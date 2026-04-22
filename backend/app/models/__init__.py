# Import all models so Flask-Migrate can detect them
from .user import User
from .category import Category
from .transaction import Transaction
from .budget import Budget
from .savings_goal import SavingsGoal
from .insight import Insight
from .report import Report

__all__ = [
    "User", "Category", "Transaction",
    "Budget", "SavingsGoal", "Insight", "Report"
]
