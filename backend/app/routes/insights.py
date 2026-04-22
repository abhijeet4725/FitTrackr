"""
routes/insights.py
------------------
Insights routes: generate, list, and mark as read.
Blueprint prefix: /api/insights
"""

from flask import Blueprint, request
from ..models.insight import Insight
from ..extensions import db
from ..utils.response import success, error
from ..utils.decorators import token_required
from ..utils.date_helpers import current_month_year
from ..services.insight_service import generate_insights_for_user

insights_bp = Blueprint("insights", __name__)


@insights_bp.route("", methods=["GET"])
@token_required
def get_insights(**kwargs):
    """GET /api/insights?month=4&year=2026 — Fetch insights for the month."""
    user_id = kwargs["current_user_id"]
    cur_month, cur_year = current_month_year()
    month = int(request.args.get("month", cur_month))
    year = int(request.args.get("year", cur_year))

    insights = Insight.query.filter_by(
        user_id=user_id, month=month, year=year
    ).order_by(Insight.created_at.desc()).all()

    return success(data={"insights": [i.to_dict() for i in insights]})


@insights_bp.route("/generate", methods=["POST"])
@token_required
def generate_insights(**kwargs):
    """POST /api/insights/generate — Run the rule engine and store new insights."""
    user_id = kwargs["current_user_id"]
    cur_month, cur_year = current_month_year()
    data = request.get_json() or {}
    month = int(data.get("month", cur_month))
    year = int(data.get("year", cur_year))

    new_insights = generate_insights_for_user(user_id, month, year)
    return success(
        data={"insights": [i.to_dict() for i in new_insights], "count": len(new_insights)},
        message=f"{len(new_insights)} insights generated."
    )


@insights_bp.route("/<int:insight_id>/read", methods=["PATCH"])
@token_required
def mark_read(insight_id, **kwargs):
    """PATCH /api/insights/:id/read — Mark an insight as read."""
    user_id = kwargs["current_user_id"]
    insight = Insight.query.filter_by(id=insight_id, user_id=user_id).first()
    if not insight:
        return error("Insight not found.", 404)
    insight.is_read = True
    db.session.commit()
    return success(message="Insight marked as read.")
