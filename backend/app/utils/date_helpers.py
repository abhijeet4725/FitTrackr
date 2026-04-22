"""
utils/date_helpers.py
---------------------
Date and month range utility functions shared across services.
"""

from datetime import date, datetime


def get_month_date_range(month: int, year: int):
    """
    Return the first and last date of a given month/year.
    Returns: (start_date, end_date) as date objects.
    """
    import calendar
    start_date = date(year, month, 1)
    last_day = calendar.monthrange(year, month)[1]
    end_date = date(year, month, last_day)
    return start_date, end_date


def current_month_year():
    """Return current (month, year) as integers."""
    now = datetime.utcnow()
    return now.month, now.year


def previous_month_year(month: int, year: int):
    """Return the (month, year) of the previous month."""
    if month == 1:
        return 12, year - 1
    return month - 1, year


def month_name(month: int) -> str:
    """Return abbreviated month name (e.g. 'Jan', 'Feb')."""
    import calendar
    return calendar.month_abbr[month]
