"""
models/report.py
----------------
Report model: a cached summary snapshot for a specific month/year.
Generated via POST /api/reports/generate and stored for quick retrieval.
"""

from datetime import datetime
from ..extensions import db


class Report(db.Model):
    __tablename__ = "reports"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    month = db.Column(db.Integer, nullable=False)
    year = db.Column(db.Integer, nullable=False)
    total_income = db.Column(db.Numeric(12, 2), default=0.00)
    total_expense = db.Column(db.Numeric(12, 2), default=0.00)
    net_savings = db.Column(db.Numeric(12, 2), default=0.00)
    top_category = db.Column(db.String(100), nullable=True)
    generated_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "month": self.month,
            "year": self.year,
            "total_income": float(self.total_income),
            "total_expense": float(self.total_expense),
            "net_savings": float(self.net_savings),
            "top_category": self.top_category,
            "generated_at": self.generated_at.isoformat(),
        }

    def __repr__(self):
        return f"<Report {self.month}/{self.year} income={self.total_income}>"
