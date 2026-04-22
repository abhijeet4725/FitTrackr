"""
routes/budgets.py
-----------------
Budget routes: set, list, update, delete, and progress comparison.
Blueprint prefix: /api/budgets
"""

from flask import Blueprint, request
from sqlalchemy import func
from ..models.budget import Budget
from ..models.transaction import Transaction
from ..models.category import Category
from ..extensions import db
from ..utils.response import success, error
from ..utils.decorators import token_required
from ..utils.date_helpers import get_month_date_range, current_month_year
from ..utils.validators import is_positive_number, is_valid_month

budgets_bp = Blueprint("budgets", __name__)


@budgets_bp.route("", methods=["GET"])
@token_required
def get_budgets(**kwargs):
    """GET /api/budgets?month=4&year=2026 — List budgets for a month/year."""
    user_id = kwargs["current_user_id"]
    cur_month, cur_year = current_month_year()
    month = int(request.args.get("month", cur_month))
    year = int(request.args.get("year", cur_year))
    budgets = Budget.query.filter_by(user_id=user_id, month=month, year=year).all()
    return success(data={"budgets": [b.to_dict() for b in budgets]})


@budgets_bp.route("", methods=["POST"])
@token_required
def create_budget(**kwargs):
    """POST /api/budgets — Create or update a monthly category budget."""
    user_id = kwargs["current_user_id"]
    data = request.get_json() or {}

    category_id = data.get("category_id")
    month = data.get("month")
    year = data.get("year")
    limit_amount = data.get("limit_amount")

    if not category_id:
        return error("category_id is required.", 400)
    if not is_valid_month(month):
        return error("month must be between 1 and 12.", 400)
    if not year:
        return error("year is required.", 400)
    if not is_positive_number(limit_amount):
        return error("limit_amount must be a positive number.", 400)

    cat = Category.query.filter(
        Category.id == category_id,
        Category.type == "expense",
        (Category.user_id == None) | (Category.user_id == user_id)
    ).first()
    if not cat:
        return error("Expense category not found.", 404)

    budget = Budget.query.filter_by(
        user_id=user_id, category_id=category_id, month=int(month), year=int(year)
    ).first()

    if budget:
        budget.limit_amount = float(limit_amount)
        message = "Budget updated."
    else:
        budget = Budget(
            user_id=user_id, category_id=int(category_id),
            month=int(month), year=int(year), limit_amount=float(limit_amount)
        )
        db.session.add(budget)
        message = "Budget created."

    db.session.commit()
    return success(data={"budget": budget.to_dict()}, message=message, status_code=201)


@budgets_bp.route("/<int:budget_id>", methods=["PUT"])
@token_required
def update_budget(budget_id, **kwargs):
    """PUT /api/budgets/:id — Update budget limit amount."""
    user_id = kwargs["current_user_id"]
    budget = Budget.query.filter_by(id=budget_id, user_id=user_id).first()
    if not budget:
        return error("Budget not found.", 404)
    data = request.get_json() or {}
    if not is_positive_number(data.get("limit_amount")):
        return error("limit_amount must be a positive number.", 400)
    budget.limit_amount = float(data["limit_amount"])
    db.session.commit()
    return success(data={"budget": budget.to_dict()}, message="Budget updated.")


@budgets_bp.route("/<int:budget_id>", methods=["DELETE"])
@token_required
def delete_budget(budget_id, **kwargs):
    """DELETE /api/budgets/:id — Delete a budget."""
    user_id = kwargs["current_user_id"]
    budget = Budget.query.filter_by(id=budget_id, user_id=user_id).first()
    if not budget:
        return error("Budget not found.", 404)
    db.session.delete(budget)
    db.session.commit()
    return success(message="Budget deleted.")


@budgets_bp.route("/progress", methods=["GET"])
@token_required
def get_budget_progress(**kwargs):
    """GET /api/budgets/progress?month=4&year=2026 — Budget vs actual spending."""
    user_id = kwargs["current_user_id"]
    cur_month, cur_year = current_month_year()
    month = int(request.args.get("month", cur_month))
    year = int(request.args.get("year", cur_year))

    budgets = Budget.query.filter_by(user_id=user_id, month=month, year=year).all()
    start_date, end_date = get_month_date_range(month, year)

    progress_list = []
    for b in budgets:
        spent = db.session.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
            Transaction.user_id == user_id,
            Transaction.category_id == b.category_id,
            Transaction.type == "expense",
            Transaction.date >= start_date,
            Transaction.date <= end_date
        ).scalar()

        spent_val = float(spent)
        limit_val = float(b.limit_amount)
        pct = round((spent_val / limit_val * 100), 2) if limit_val > 0 else 0.0
        progress_list.append({
            **b.to_dict(),
            "spent": spent_val,
            "remaining": max(0, limit_val - spent_val),
            "percent_used": pct,
            "exceeded": spent_val > limit_val
        })

    return success(data={"progress": progress_list})
