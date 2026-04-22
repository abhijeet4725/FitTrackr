"""
seed/seed_data.py
-----------------
Seeds the database with:
  1. System default categories (income + expense)
  2. A demo user account
  3. 3 months of realistic transactions
  4. Demo budgets for current month
  5. Demo savings goals

Run with: python seed/seed_data.py
(from the backend/ directory with venv activated)
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import date, timedelta
import random
from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.category import Category
from app.models.transaction import Transaction
from app.models.budget import Budget
from app.models.savings_goal import SavingsGoal

app = create_app("development")

# ── Default Categories ────────────────────────────────────────────────────────
DEFAULT_CATEGORIES = [
    # Income categories
    {"name": "Salary",        "type": "income",  "icon": "💼", "color": "#22c55e"},
    {"name": "Freelance",     "type": "income",  "icon": "💻", "color": "#10b981"},
    {"name": "Investment",    "type": "income",  "icon": "📈", "color": "#06b6d4"},
    {"name": "Gift",          "type": "income",  "icon": "🎁", "color": "#8b5cf6"},
    {"name": "Other Income",  "type": "income",  "icon": "💰", "color": "#f59e0b"},
    # Expense categories
    {"name": "Food",          "type": "expense", "icon": "🍔", "color": "#f97316"},
    {"name": "Rent",          "type": "expense", "icon": "🏠", "color": "#ef4444"},
    {"name": "Transport",     "type": "expense", "icon": "🚌", "color": "#3b82f6"},
    {"name": "Bills",         "type": "expense", "icon": "⚡", "color": "#eab308"},
    {"name": "Shopping",      "type": "expense", "icon": "🛍️", "color": "#ec4899"},
    {"name": "Entertainment", "type": "expense", "icon": "🎬", "color": "#a855f7"},
    {"name": "Travel",        "type": "expense", "icon": "✈️", "color": "#06b6d4"},
    {"name": "Health",        "type": "expense", "icon": "💊", "color": "#14b8a6"},
    {"name": "Education",     "type": "expense", "icon": "📚", "color": "#6366f1"},
    {"name": "Savings",       "type": "expense", "icon": "🏦", "color": "#22c55e"},
    {"name": "Other",         "type": "expense", "icon": "📦", "color": "#94a3b8"},
]


def seed_categories():
    """Seed system-default categories (user_id=None, is_default=True)."""
    existing = Category.query.filter_by(user_id=None).count()
    if existing > 0:
        print(f"  ✓ {existing} default categories already exist, skipping.")
        return

    for cat_data in DEFAULT_CATEGORIES:
        cat = Category(
            name=cat_data["name"],
            type=cat_data["type"],
            icon=cat_data["icon"],
            color=cat_data["color"],
            is_default=True,
            user_id=None
        )
        db.session.add(cat)
    db.session.commit()
    print(f"  ✓ Seeded {len(DEFAULT_CATEGORIES)} default categories.")


def seed_demo_user():
    """Create a demo user account."""
    email = "demo@fintrackr.com"
    user = User.query.filter_by(email=email).first()
    if user:
        print(f"  ✓ Demo user already exists: {email}")
        return user

    user = User(
        name="Arjun Sharma",
        email=email,
        currency="INR",
        monthly_income_target=60000,
        monthly_savings_target=10000
    )
    user.set_password("Demo@1234")
    db.session.add(user)
    db.session.commit()
    print(f"  ✓ Created demo user: {email} / Demo@1234")
    return user


def seed_transactions(user: User):
    """Seed 3 months of realistic transactions."""
    if Transaction.query.filter_by(user_id=user.id).count() > 0:
        print("  ✓ Transactions already exist for demo user, skipping.")
        return

    cats = {c.name: c for c in Category.query.filter_by(user_id=None).all()}
    today = date.today()

    # Generate transactions for past 3 months
    transactions = []
    for months_ago in range(2, -1, -1):
        # Calculate month/year
        m = today.month - months_ago
        y = today.year
        while m <= 0:
            m += 12
            y -= 1

        # Base date for this month
        base = date(y, m, 1)

        # ── Income ─────────────────────────────────────────────────────────
        transactions.append(Transaction(
            user_id=user.id, category_id=cats["Salary"].id,
            type="income", amount=55000 + random.randint(-2000, 5000),
            date=base.replace(day=1), payment_mode="bank_transfer",
            note="Monthly salary"
        ))
        if random.random() > 0.4:
            transactions.append(Transaction(
                user_id=user.id, category_id=cats["Freelance"].id,
                type="income", amount=random.randint(5000, 15000),
                date=base.replace(day=random.randint(10, 20)), payment_mode="upi",
                note="Freelance project payment"
            ))

        # ── Expenses ───────────────────────────────────────────────────────
        transactions.append(Transaction(
            user_id=user.id, category_id=cats["Rent"].id,
            type="expense", amount=15000,
            date=base.replace(day=2), payment_mode="bank_transfer",
            note="Monthly rent"
        ))
        transactions.append(Transaction(
            user_id=user.id, category_id=cats["Bills"].id,
            type="expense", amount=random.randint(1500, 3000),
            date=base.replace(day=5), payment_mode="upi",
            note="Electricity + Internet"
        ))
        for _ in range(random.randint(8, 12)):
            transactions.append(Transaction(
                user_id=user.id, category_id=cats["Food"].id,
                type="expense", amount=random.randint(200, 1200),
                date=base.replace(day=random.randint(1, 28)), payment_mode=random.choice(["cash", "upi"]),
                note=random.choice(["Lunch", "Dinner", "Groceries", "Swiggy order", "Zomato"])
            ))
        for _ in range(random.randint(2, 4)):
            transactions.append(Transaction(
                user_id=user.id, category_id=cats["Transport"].id,
                type="expense", amount=random.randint(150, 800),
                date=base.replace(day=random.randint(1, 28)), payment_mode=random.choice(["cash", "upi"]),
                note=random.choice(["Uber", "Auto rickshaw", "Petrol", "Metro pass"])
            ))
        if random.random() > 0.3:
            transactions.append(Transaction(
                user_id=user.id, category_id=cats["Shopping"].id,
                type="expense", amount=random.randint(1000, 5000),
                date=base.replace(day=random.randint(10, 28)), payment_mode=random.choice(["card", "upi"]),
                note=random.choice(["Clothes", "Amazon order", "Electronics", "Flipkart"])
            ))
        if random.random() > 0.5:
            transactions.append(Transaction(
                user_id=user.id, category_id=cats["Entertainment"].id,
                type="expense", amount=random.randint(300, 1500),
                date=base.replace(day=random.randint(5, 28)), payment_mode=random.choice(["card", "upi"]),
                note=random.choice(["Movie tickets", "Netflix subscription", "Concert", "OTT"])
            ))
        if random.random() > 0.6:
            transactions.append(Transaction(
                user_id=user.id, category_id=cats["Health"].id,
                type="expense", amount=random.randint(200, 2000),
                date=base.replace(day=random.randint(1, 28)), payment_mode=random.choice(["cash", "card"]),
                note=random.choice(["Medicine", "Doctor visit", "Gym membership", "Lab test"])
            ))

    for tx in transactions:
        db.session.add(tx)
    db.session.commit()
    print(f"  ✓ Seeded {len(transactions)} transactions across 3 months.")


def seed_budgets(user: User):
    """Seed monthly budgets for current month."""
    from datetime import date as d
    today = d.today()
    if Budget.query.filter_by(user_id=user.id, month=today.month, year=today.year).count() > 0:
        print("  ✓ Budgets already exist for this month, skipping.")
        return

    cats = {c.name: c for c in Category.query.filter_by(user_id=None).all()}
    budget_data = [
        ("Food", 8000), ("Rent", 15000), ("Transport", 3000),
        ("Bills", 3000), ("Shopping", 5000), ("Entertainment", 2000),
        ("Health", 2000), ("Travel", 3000),
    ]
    for cat_name, limit in budget_data:
        if cat_name in cats:
            b = Budget(
                user_id=user.id,
                category_id=cats[cat_name].id,
                month=today.month,
                year=today.year,
                limit_amount=limit
            )
            db.session.add(b)
    db.session.commit()
    print(f"  ✓ Seeded {len(budget_data)} budgets for {today.month}/{today.year}.")


def seed_savings_goals(user: User):
    """Seed sample savings goals."""
    if SavingsGoal.query.filter_by(user_id=user.id).count() > 0:
        print("  ✓ Savings goals already exist, skipping.")
        return

    goals = [
        SavingsGoal(user_id=user.id, name="Emergency Fund",
                    target_amount=100000, saved_amount=32000,
                    deadline=date.today().replace(year=date.today().year + 1), status="active"),
        SavingsGoal(user_id=user.id, name="Goa Trip 🏖️",
                    target_amount=25000, saved_amount=12000,
                    deadline=date.today() + timedelta(days=45), status="active"),
        SavingsGoal(user_id=user.id, name="New Laptop 💻",
                    target_amount=80000, saved_amount=80000,
                    deadline=None, status="completed"),
    ]
    for g in goals:
        db.session.add(g)
    db.session.commit()
    print(f"  ✓ Seeded {len(goals)} savings goals.")


if __name__ == "__main__":
    with app.app_context():
        print("\n🌱 Seeding FinTrackr database...\n")
        db.create_all()
        seed_categories()
        user = seed_demo_user()
        seed_transactions(user)
        seed_budgets(user)
        seed_savings_goals(user)
        print("\n✅ Seeding complete!\n")
        print("  Demo credentials:")
        print("  Email   : demo@fintrackr.com")
        print("  Password: Demo@1234\n")
