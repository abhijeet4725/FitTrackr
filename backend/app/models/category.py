"""
models/category.py
------------------
Category model: classifies transactions into groups like Food, Rent, Salary.
- is_default=True  → system-level category visible to all users (user_id=None)
- is_default=False → custom category created by a specific user
"""

from datetime import datetime
from ..extensions import db


class Category(db.Model):
    __tablename__ = "categories"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    # 'income' or 'expense'
    type = db.Column(db.String(20), nullable=False)
    icon = db.Column(db.String(50), nullable=True)    # e.g. emoji or icon name
    color = db.Column(db.String(20), nullable=True)   # e.g. '#FF6384'
    is_default = db.Column(db.Boolean, default=False)

    # NULL user_id = system default category; set user_id for custom categories
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    transactions = db.relationship("Transaction", backref="category", lazy=True)
    budgets = db.relationship("Budget", backref="category", lazy=True)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "type": self.type,
            "icon": self.icon,
            "color": self.color,
            "is_default": self.is_default,
            "user_id": self.user_id,
        }

    def __repr__(self):
        return f"<Category {self.name} ({self.type})>"
