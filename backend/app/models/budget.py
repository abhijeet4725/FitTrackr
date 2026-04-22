"""
models/budget.py
----------------
Budget model: monthly spending limit per category.
Unique constraint prevents duplicate budgets for the same category/month/year.
"""

from datetime import datetime
from ..extensions import db


class Budget(db.Model):
    __tablename__ = "budgets"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey("categories.id"), nullable=False)
    month = db.Column(db.Integer, nullable=False)   # 1–12
    year = db.Column(db.Integer, nullable=False)
    limit_amount = db.Column(db.Numeric(12, 2), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # A user can only have one budget per category per month/year
    __table_args__ = (
        db.UniqueConstraint("user_id", "category_id", "month", "year", name="uq_budget_user_cat_month_year"),
    )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "category_id": self.category_id,
            "category_name": self.category.name if self.category else None,
            "category_color": self.category.color if self.category else None,
            "category_icon": self.category.icon if self.category else None,
            "month": self.month,
            "year": self.year,
            "limit_amount": float(self.limit_amount),
        }

    def __repr__(self):
        return f"<Budget cat={self.category_id} {self.month}/{self.year} limit={self.limit_amount}>"
