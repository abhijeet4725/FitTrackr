"""
services/insight_service.py
----------------------------
Rule-based financial insight engine.
Analyzes user's transactions and budget data to generate contextual insights.
No AI/LLM — pure Python comparisons and business logic.

Rules Implemented:
  R01 — Category spend this month > last month by >20%
  R02 — Top expense category this month
  R03 — Budget exceeded for any category
  R04 — Savings below monthly target
  R05 — No income recorded this month
  R06 — Savings goal deadline approaching (<30 days) & progress <50%
  R07 — Total expenses > 80% of total income
"""

from datetime import datetime, date
from sqlalchemy import func
from ..extensions import db
from ..models.transaction import Transaction
from ..models.budget import Budget
from ..models.savings_goal import SavingsGoal
from ..models.insight import Insight
from ..models.user import User
from ..models.category import Category
from ..utils.date_helpers import get_month_date_range, previous_month_year


def _get_category_spend(user_id: int, category_id: int, start_date, end_date) -> float:
    """Helper: sum of expense transactions for a category in a date range."""
    result = db.session.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
        Transaction.user_id == user_id,
        Transaction.category_id == category_id,
        Transaction.type == "expense",
        Transaction.date >= start_date,
        Transaction.date <= end_date
    ).scalar()
    return float(result)


def _clear_existing_insights(user_id: int, month: int, year: int):
    """Delete previously generated insights for the month before regenerating."""
    Insight.query.filter_by(user_id=user_id, month=month, year=year).delete()
    db.session.flush()


def _add_insight(user_id, insight_type, message, severity, month, year) -> Insight:
    """Create and persist a new insight record."""
    insight = Insight(
        user_id=user_id,
        type=insight_type,
        message=message,
        severity=severity,
        month=month,
        year=year
    )
    db.session.add(insight)
    return insight


def generate_insights_for_user(user_id: int, month: int, year: int) -> list:
    """
    Main entry point: runs all insight rules for a user for the given month/year.
    Returns list of newly created Insight objects.
    """
    user = User.query.get(user_id)
    if not user:
        return []

    new_insights = []
    start_date, end_date = get_month_date_range(month, year)
    prev_month, prev_year = previous_month_year(month, year)
    prev_start, prev_end = get_month_date_range(prev_month, prev_year)

    # Clear old insights for this month
    _clear_existing_insights(user_id, month, year)

    # Compute totals for current month
    total_income = db.session.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
        Transaction.user_id == user_id,
        Transaction.type == "income",
        Transaction.date >= start_date,
        Transaction.date <= end_date
    ).scalar()
    total_income = float(total_income)

    total_expense = db.session.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
        Transaction.user_id == user_id,
        Transaction.type == "expense",
        Transaction.date >= start_date,
        Transaction.date <= end_date
    ).scalar()
    total_expense = float(total_expense)

    # R05 — No income recorded this month
    if total_income == 0:
        ins = _add_insight(
            user_id, "no_income",
            "No income has been recorded this month yet. Add your income to track your finances accurately.",
            "info", month, year
        )
        new_insights.append(ins)

    # R07 — Total expenses > 80% of income
    if total_income > 0 and total_expense > 0:
        ratio = (total_expense / total_income) * 100
        if ratio >= 80:
            ins = _add_insight(
                user_id, "high_expense_ratio",
                f"You've spent {ratio:.0f}% of your monthly income this month. Consider reducing discretionary spending.",
                "warning", month, year
            )
            new_insights.append(ins)

    # R04 — Savings below monthly target
    if user.monthly_savings_target:
        target = float(user.monthly_savings_target)
        actual_savings = total_income - total_expense
        if actual_savings < target:
            shortfall = target - actual_savings
            ins = _add_insight(
                user_id, "savings_below_target",
                f"Your savings this month are ₹{actual_savings:,.0f}, which is ₹{shortfall:,.0f} below your monthly target of ₹{target:,.0f}.",
                "warning", month, year
            )
            new_insights.append(ins)

    # Category-level analysis
    cat_rows = db.session.query(
        Category.id,
        Category.name,
        func.sum(Transaction.amount).label("total")
    ).join(Transaction, Transaction.category_id == Category.id).filter(
        Transaction.user_id == user_id,
        Transaction.type == "expense",
        Transaction.date >= start_date,
        Transaction.date <= end_date
    ).group_by(Category.id, Category.name).order_by(func.sum(Transaction.amount).desc()).all()

    if cat_rows:
        # R02 — Top expense category
        top_cat = cat_rows[0]
        ins = _add_insight(
            user_id, "top_category",
            f"'{top_cat.name}' is your top spending category this month with ₹{float(top_cat.total):,.0f} spent.",
            "info", month, year
        )
        new_insights.append(ins)

        # R01 — Category spend increase > 20% vs last month
        for row in cat_rows:
            prev_spend = _get_category_spend(user_id, row.id, prev_start, prev_end)
            curr_spend = float(row.total)
            if prev_spend > 0:
                pct_change = ((curr_spend - prev_spend) / prev_spend) * 100
                if pct_change > 20:
                    ins = _add_insight(
                        user_id, "category_spike",
                        f"You spent {pct_change:.0f}% more on '{row.name}' this month (₹{curr_spend:,.0f}) compared to last month (₹{prev_spend:,.0f}).",
                        "warning", month, year
                    )
                    new_insights.append(ins)

    # R03 — Budget exceeded
    budgets = Budget.query.filter_by(user_id=user_id, month=month, year=year).all()
    for b in budgets:
        spent = _get_category_spend(user_id, b.category_id, start_date, end_date)
        limit = float(b.limit_amount)
        if spent > limit:
            overshoot = spent - limit
            ins = _add_insight(
                user_id, "budget_exceeded",
                f"You have exceeded your '{b.category.name}' budget by ₹{overshoot:,.0f} (limit: ₹{limit:,.0f}, spent: ₹{spent:,.0f}).",
                "critical", month, year
            )
            new_insights.append(ins)

    # R06 — Savings goal deadline approaching
    today = date.today()
    active_goals = SavingsGoal.query.filter_by(user_id=user_id, status="active").all()
    for goal in active_goals:
        if goal.deadline:
            days_left = (goal.deadline - today).days
            if 0 <= days_left <= 30 and goal.progress_percent < 50:
                ins = _add_insight(
                    user_id, "goal_at_risk",
                    f"Your savings goal '{goal.name}' is due in {days_left} days but only {goal.progress_percent:.0f}% funded. Consider contributing more.",
                    "warning", month, year
                )
                new_insights.append(ins)

    db.session.commit()
    return new_insights
