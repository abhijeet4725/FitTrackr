"""
routes/savings_goals.py
-----------------------
Savings goal routes: create, list, update, delete, and contribute.
Blueprint prefix: /api/savings-goals
"""

from datetime import date
from flask import Blueprint, request
from ..models.savings_goal import SavingsGoal
from ..extensions import db
from ..utils.response import success, error
from ..utils.decorators import token_required
from ..utils.validators import is_positive_number, is_valid_date, VALID_GOAL_STATUSES

savings_goals_bp = Blueprint("savings_goals", __name__)


@savings_goals_bp.route("", methods=["GET"])
@token_required
def get_goals(**kwargs):
    """GET /api/savings-goals — List all savings goals for current user."""
    user_id = kwargs["current_user_id"]
    status_filter = request.args.get("status")
    query = SavingsGoal.query.filter_by(user_id=user_id)
    if status_filter in VALID_GOAL_STATUSES:
        query = query.filter_by(status=status_filter)
    goals = query.order_by(SavingsGoal.created_at.desc()).all()
    return success(data={"goals": [g.to_dict() for g in goals]})


@savings_goals_bp.route("", methods=["POST"])
@token_required
def create_goal(**kwargs):
    """POST /api/savings-goals — Create a new savings goal."""
    user_id = kwargs["current_user_id"]
    data = request.get_json() or {}

    name = data.get("name", "").strip()
    target_amount = data.get("target_amount")
    deadline = data.get("deadline")

    if not name:
        return error("Goal name is required.", 400)
    if not is_positive_number(target_amount):
        return error("target_amount must be a positive number.", 400)
    if deadline and not is_valid_date(deadline):
        return error("deadline must be in YYYY-MM-DD format.", 400)

    goal = SavingsGoal(
        user_id=user_id,
        name=name,
        target_amount=float(target_amount),
        saved_amount=float(data.get("saved_amount", 0)),
        deadline=date.fromisoformat(deadline) if deadline else None,
        status="active"
    )
    db.session.add(goal)
    db.session.commit()
    return success(data={"goal": goal.to_dict()}, message="Savings goal created.", status_code=201)


@savings_goals_bp.route("/<int:goal_id>", methods=["PUT"])
@token_required
def update_goal(goal_id, **kwargs):
    """PUT /api/savings-goals/:id — Update goal name, target, deadline, or status."""
    user_id = kwargs["current_user_id"]
    goal = SavingsGoal.query.filter_by(id=goal_id, user_id=user_id).first()
    if not goal:
        return error("Savings goal not found.", 404)

    data = request.get_json() or {}
    if "name" in data and data["name"].strip():
        goal.name = data["name"].strip()
    if "target_amount" in data:
        if not is_positive_number(data["target_amount"]):
            return error("target_amount must be a positive number.", 400)
        goal.target_amount = float(data["target_amount"])
    if "deadline" in data:
        if data["deadline"] and not is_valid_date(data["deadline"]):
            return error("deadline must be in YYYY-MM-DD format.", 400)
        goal.deadline = date.fromisoformat(data["deadline"]) if data["deadline"] else None
    if "status" in data:
        if data["status"] not in VALID_GOAL_STATUSES:
            return error("status must be active, completed, or cancelled.", 400)
        goal.status = data["status"]

    db.session.commit()
    return success(data={"goal": goal.to_dict()}, message="Goal updated.")


@savings_goals_bp.route("/<int:goal_id>", methods=["DELETE"])
@token_required
def delete_goal(goal_id, **kwargs):
    """DELETE /api/savings-goals/:id — Delete a savings goal."""
    user_id = kwargs["current_user_id"]
    goal = SavingsGoal.query.filter_by(id=goal_id, user_id=user_id).first()
    if not goal:
        return error("Savings goal not found.", 404)
    db.session.delete(goal)
    db.session.commit()
    return success(message="Savings goal deleted.")


@savings_goals_bp.route("/<int:goal_id>/contribute", methods=["PATCH"])
@token_required
def contribute_to_goal(goal_id, **kwargs):
    """PATCH /api/savings-goals/:id/contribute — Add amount to saved_amount."""
    user_id = kwargs["current_user_id"]
    goal = SavingsGoal.query.filter_by(id=goal_id, user_id=user_id).first()
    if not goal:
        return error("Savings goal not found.", 404)
    if goal.status != "active":
        return error("Cannot contribute to a non-active goal.", 400)

    data = request.get_json() or {}
    amount = data.get("amount")
    if not is_positive_number(amount):
        return error("amount must be a positive number.", 400)

    goal.saved_amount = float(goal.saved_amount) + float(amount)
    # Auto-complete if target reached
    if float(goal.saved_amount) >= float(goal.target_amount):
        goal.status = "completed"

    db.session.commit()
    return success(data={"goal": goal.to_dict()}, message="Contribution added.")
