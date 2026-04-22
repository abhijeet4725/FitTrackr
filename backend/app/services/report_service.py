"""
services/report_service.py
--------------------------
Business logic for generating and exporting monthly financial reports.
"""

import csv
import io
from sqlalchemy import func
from ..extensions import db
from ..models.report import Report
from ..models.transaction import Transaction
from ..models.category import Category
from ..utils.date_helpers import get_month_date_range


def generate_monthly_report(user_id: int, month: int, year: int) -> Report:
    """
    Generate (or regenerate) a monthly financial summary report.
    Computes income, expense, savings, and top category from transactions.
    """
    start_date, end_date = get_month_date_range(month, year)

    total_income = db.session.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
        Transaction.user_id == user_id,
        Transaction.type == "income",
        Transaction.date >= start_date,
        Transaction.date <= end_date
    ).scalar()

    total_expense = db.session.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
        Transaction.user_id == user_id,
        Transaction.type == "expense",
        Transaction.date >= start_date,
        Transaction.date <= end_date
    ).scalar()

    total_income = float(total_income)
    total_expense = float(total_expense)
    net_savings = total_income - total_expense

    # Find top spending category
    top_cat_row = db.session.query(
        Category.name,
        func.sum(Transaction.amount).label("total")
    ).join(Transaction, Transaction.category_id == Category.id).filter(
        Transaction.user_id == user_id,
        Transaction.type == "expense",
        Transaction.date >= start_date,
        Transaction.date <= end_date
    ).group_by(Category.name).order_by(func.sum(Transaction.amount).desc()).first()

    top_category = top_cat_row.name if top_cat_row else None

    # Upsert report
    report = Report.query.filter_by(user_id=user_id, month=month, year=year).first()
    if report:
        report.total_income = total_income
        report.total_expense = total_expense
        report.net_savings = net_savings
        report.top_category = top_category
        from datetime import datetime
        report.generated_at = datetime.utcnow()
    else:
        report = Report(
            user_id=user_id,
            month=month,
            year=year,
            total_income=total_income,
            total_expense=total_expense,
            net_savings=net_savings,
            top_category=top_category
        )
        db.session.add(report)

    db.session.commit()
    return report


def export_report_csv(user_id: int, report: Report) -> str:
    """
    Generate a CSV string from the report's transaction data.
    Includes all transactions for the report month/year.
    """
    start_date, end_date = get_month_date_range(report.month, report.year)

    transactions = Transaction.query.filter(
        Transaction.user_id == user_id,
        Transaction.date >= start_date,
        Transaction.date <= end_date
    ).order_by(Transaction.date.asc()).all()

    output = io.StringIO()
    writer = csv.writer(output)

    # Header
    writer.writerow(["Date", "Type", "Category", "Amount (INR)", "Payment Mode", "Note"])

    # Summary rows at top
    writer.writerow([])
    writer.writerow(["MONTHLY SUMMARY", "", "", "", "", ""])
    writer.writerow(["Total Income", "", "", f"{float(report.total_income):,.2f}", "", ""])
    writer.writerow(["Total Expense", "", "", f"{float(report.total_expense):,.2f}", "", ""])
    writer.writerow(["Net Savings", "", "", f"{float(report.net_savings):,.2f}", "", ""])
    writer.writerow(["Top Category", "", "", report.top_category or "N/A", "", ""])
    writer.writerow([])
    writer.writerow(["TRANSACTIONS", "", "", "", "", ""])
    writer.writerow(["Date", "Type", "Category", "Amount (INR)", "Payment Mode", "Note"])

    for tx in transactions:
        writer.writerow([
            tx.date.strftime("%Y-%m-%d"),
            tx.type.capitalize(),
            tx.category.name if tx.category else "Unknown",
            f"{float(tx.amount):,.2f}",
            tx.payment_mode,
            tx.note or ""
        ])

    return output.getvalue()
