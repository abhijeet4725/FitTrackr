"""
utils/validators.py
-------------------
Input validation helpers used across route handlers.
"""

import re


def is_valid_email(email: str) -> bool:
    """Check if email is in a valid format."""
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w{2,}$'
    return bool(re.match(pattern, email))


def is_positive_number(value) -> bool:
    """Check if a value is a positive number."""
    try:
        return float(value) > 0
    except (TypeError, ValueError):
        return False


def is_valid_date(date_str: str) -> bool:
    """Check if a date string is in YYYY-MM-DD format."""
    from datetime import datetime
    try:
        datetime.strptime(date_str, "%Y-%m-%d")
        return True
    except (ValueError, TypeError):
        return False


def is_valid_month(month) -> bool:
    """Check if month is between 1 and 12."""
    try:
        return 1 <= int(month) <= 12
    except (TypeError, ValueError):
        return False


VALID_TRANSACTION_TYPES = {"income", "expense"}
VALID_PAYMENT_MODES = {"cash", "card", "upi", "bank_transfer", "other"}
VALID_GOAL_STATUSES = {"active", "completed", "cancelled"}
VALID_SEVERITIES = {"info", "warning", "critical"}
