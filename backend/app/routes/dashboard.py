"""
routes/dashboard.py
-------------------
Dashboard analytics routes: summary cards, recent transactions,
category breakdown, monthly trend, and budget status.
Blueprint prefix: /api/dashboard
"""

from flask import Blueprint, request
from sqlalchemy import func
from ..models.transaction import Transaction
from ..models.budget import Budget
from ..models.category import Category
from ..extensions import db
from ..utils.response import success, error
from ..utils.decorators import token_required
from ..utils.date_helpers import (
    get_month_date_range, current_month_year,
    previous_month_year, month_name
)

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.route("/summary", methods=["GET"])
@token_required
def get_summary(**kwargs):
    """GET /api/dashboard/summary — Monthly income, expense, balance, savings."""
    user_id = kwargs["current_user_id"]
    cur_month, cur_year = current_month_year()
    month = int(request.args.get("month", cur_month))
    year = int(request.args.get("year", cur_year))

    start_date, end_date = get_month_date_range(month, year)

    income = db.session.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
        Transaction.user_id == user_id,
        Transaction.type == "income",
        Transaction.date >= start_date,
        Transaction.date <= end_date
    ).scalar()

    expense = db.session.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
        Transaction.user_id == user_id,
        Transaction.type == "expense",
        Transaction.date >= start_date,
        Transaction.date <= end_date
    ).scalar()

    income_val = float(income)
    expense_val = float(expense)
    savings_val = income_val - expense_val

    return success(data={
        "month": month,
        "year": year,
        "total_income": income_val,
        "total_expense": expense_val,
        "net_savings": savings_val,
        "balance": savings_val
    })


@dashboard_bp.route("/recent-transactions", methods=["GET"])
@token_required
def recent_transactions(**kwargs):
    """GET /api/dashboard/recent-transactions — Last 10 transactions."""
    user_id = kwargs["current_user_id"]
    limit = int(request.args.get("limit", 10))
    txs = Transaction.query.filter_by(user_id=user_id).order_by(
        Transaction.date.desc(), Transaction.created_at.desc()
    ).limit(limit).all()
    return success(data={"transactions": [t.to_dict() for t in txs]})


@dashboard_bp.route("/category-breakdown", methods=["GET"])
@token_required
def category_breakdown(**kwargs):
    """GET /api/dashboard/category-breakdown — Expense by category for current month."""
    user_id = kwargs["current_user_id"]
    cur_month, cur_year = current_month_year()
    month = int(request.args.get("month", cur_month))
    year = int(request.args.get("year", cur_year))

    start_date, end_date = get_month_date_range(month, year)

    rows = db.session.query(
        Category.name,
        Category.color,
        Category.icon,
        func.sum(Transaction.amount).label("total")
    ).join(Transaction, Transaction.category_id == Category.id).filter(
        Transaction.user_id == user_id,
        Transaction.type == "expense",
        Transaction.date >= start_date,
        Transaction.date <= end_date
    ).group_by(Category.id, Category.name, Category.color, Category.icon).all()

    data = [
        {"category": r.name, "color": r.color, "icon": r.icon, "amount": float(r.total)}
        for r in rows
    ]
    return success(data={"breakdown": data})


@dashboard_bp.route("/monthly-trend", methods=["GET"])
@token_required
def monthly_trend(**kwargs):
    """GET /api/dashboard/monthly-trend — Last 6 months income vs expense."""
    user_id = kwargs["current_user_id"]
    cur_month, cur_year = current_month_year()

    trend = []
    month, year = cur_month, cur_year

    for _ in range(6):
        start_date, end_date = get_month_date_range(month, year)

        income = db.session.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
            Transaction.user_id == user_id,
            Transaction.type == "income",
            Transaction.date >= start_date,
            Transaction.date <= end_date
        ).scalar()

        expense = db.session.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
            Transaction.user_id == user_id,
            Transaction.type == "expense",
            Transaction.date >= start_date,
            Transaction.date <= end_date
        ).scalar()

        trend.insert(0, {
            "month": month_name(month),
            "month_num": month,
            "year": year,
            "income": float(income),
            "expense": float(expense)
        })
        month, year = previous_month_year(month, year)

    return success(data={"trend": trend})


@dashboard_bp.route("/budget-cards", methods=["GET"])
@token_required
def budget_cards(**kwargs):
    """GET /api/dashboard/budget-cards — Budget status cards for current month."""
    user_id = kwargs["current_user_id"]
    cur_month, cur_year = current_month_year()
    month = int(request.args.get("month", cur_month))
    year = int(request.args.get("year", cur_year))

    budgets = Budget.query.filter_by(user_id=user_id, month=month, year=year).all()
    start_date, end_date = get_month_date_range(month, year)

    cards = []
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

        cards.append({
            "budget_id": b.id,
            "category_id": b.category_id,
            "category_name": b.category.name if b.category else "Unknown",
            "category_color": b.category.color if b.category else "#888",
            "category_icon": b.category.icon if b.category else None,
            "limit": limit_val,
            "spent": spent_val,
            "remaining": max(0, limit_val - spent_val),
            "percent": pct,
            "exceeded": spent_val > limit_val
        })

    return success(data={"budget_cards": cards})
