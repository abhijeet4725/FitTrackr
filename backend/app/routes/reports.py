"""
routes/reports.py
-----------------
Report routes: generate, list, view, and export (CSV/PDF).
Blueprint prefix: /api/reports
"""

import csv
import io
from flask import Blueprint, request, make_response
from ..models.report import Report
from ..models.transaction import Transaction
from ..models.category import Category
from ..extensions import db
from ..utils.response import success, error
from ..utils.decorators import token_required
from ..utils.date_helpers import current_month_year, get_month_date_range
from ..services.report_service import generate_monthly_report, export_report_csv

reports_bp = Blueprint("reports", __name__)


@reports_bp.route("", methods=["GET"])
@token_required
def get_reports(**kwargs):
    """GET /api/reports — List all generated reports."""
    user_id = kwargs["current_user_id"]
    reports = Report.query.filter_by(user_id=user_id).order_by(
        Report.year.desc(), Report.month.desc()
    ).all()
    return success(data={"reports": [r.to_dict() for r in reports]})


@reports_bp.route("/generate", methods=["POST"])
@token_required
def generate_report(**kwargs):
    """POST /api/reports/generate — Generate a monthly summary report."""
    user_id = kwargs["current_user_id"]
    cur_month, cur_year = current_month_year()
    data = request.get_json() or {}
    month = int(data.get("month", cur_month))
    year = int(data.get("year", cur_year))

    report = generate_monthly_report(user_id, month, year)
    return success(data={"report": report.to_dict()}, message="Report generated.", status_code=201)


@reports_bp.route("/<int:report_id>", methods=["GET"])
@token_required
def get_report(report_id, **kwargs):
    """GET /api/reports/:id — Get a specific report with category breakdown."""
    user_id = kwargs["current_user_id"]
    report = Report.query.filter_by(id=report_id, user_id=user_id).first()
    if not report:
        return error("Report not found.", 404)

    # Get category-wise breakdown for the report month/year
    start_date, end_date = get_month_date_range(report.month, report.year)
    from sqlalchemy import func
    rows = db.session.query(
        Category.name,
        func.sum(Transaction.amount).label("total"),
        Transaction.type
    ).join(Transaction, Transaction.category_id == Category.id).filter(
        Transaction.user_id == user_id,
        Transaction.date >= start_date,
        Transaction.date <= end_date
    ).group_by(Category.name, Transaction.type).all()

    breakdown = [{"category": r.name, "total": float(r.total), "type": r.type} for r in rows]
    return success(data={"report": report.to_dict(), "breakdown": breakdown})


@reports_bp.route("/<int:report_id>/export/csv", methods=["GET"])
@token_required
def export_csv(report_id, **kwargs):
    """GET /api/reports/:id/export/csv — Download report as CSV."""
    user_id = kwargs["current_user_id"]
    report = Report.query.filter_by(id=report_id, user_id=user_id).first()
    if not report:
        return error("Report not found.", 404)

    csv_content = export_report_csv(user_id, report)
    response = make_response(csv_content)
    response.headers["Content-Type"] = "text/csv"
    response.headers["Content-Disposition"] = (
        f"attachment; filename=fintrackr_report_{report.year}_{report.month:02d}.csv"
    )
    return response
