"""
models/savings_goal.py
----------------------
SavingsGoal model: tracks financial goals with target amounts and deadlines.
Users manually contribute to goals; progress is calculated as (saved / target) * 100.
"""

from datetime import datetime
from ..extensions import db


class SavingsGoal(db.Model):
    __tablename__ = "savings_goals"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = db.Column(db.String(150), nullable=False)
    target_amount = db.Column(db.Numeric(12, 2), nullable=False)
    saved_amount = db.Column(db.Numeric(12, 2), default=0.00)
    deadline = db.Column(db.Date, nullable=True)

    # 'active' | 'completed' | 'cancelled'
    status = db.Column(db.String(20), default="active")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    @property
    def progress_percent(self) -> float:
        """Returns progress toward goal as a percentage (0–100)."""
        if not self.target_amount or float(self.target_amount) == 0:
            return 0.0
        pct = (float(self.saved_amount) / float(self.target_amount)) * 100
        return round(min(pct, 100.0), 2)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "target_amount": float(self.target_amount),
            "saved_amount": float(self.saved_amount),
            "progress_percent": self.progress_percent,
            "deadline": self.deadline.isoformat() if self.deadline else None,
            "status": self.status,
            "created_at": self.created_at.isoformat(),
        }

    def __repr__(self):
        return f"<SavingsGoal '{self.name}' {self.progress_percent}%>"
