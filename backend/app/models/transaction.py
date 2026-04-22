"""
models/transaction.py
---------------------
Transaction model: the core data entity of the app.
Each record is one income or expense event for a user.
"""

from datetime import datetime
from ..extensions import db


class Transaction(db.Model):
    __tablename__ = "transactions"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey("categories.id"), nullable=False)

    # 'income' or 'expense'
    type = db.Column(db.String(20), nullable=False)
    amount = db.Column(db.Numeric(12, 2), nullable=False)
    date = db.Column(db.Date, nullable=False)
    note = db.Column(db.Text, nullable=True)

    # Payment mode: cash | card | upi | bank_transfer | other
    payment_mode = db.Column(db.String(30), default="cash")

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "category_id": self.category_id,
            "category_name": self.category.name if self.category else None,
            "category_color": self.category.color if self.category else None,
            "category_icon": self.category.icon if self.category else None,
            "type": self.type,
            "amount": float(self.amount),
            "date": self.date.isoformat(),
            "note": self.note,
            "payment_mode": self.payment_mode,
            "created_at": self.created_at.isoformat(),
        }

    def __repr__(self):
        return f"<Transaction {self.type} ₹{self.amount} on {self.date}>"
