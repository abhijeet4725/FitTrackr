"""
routes/transactions.py
----------------------
Transaction CRUD routes with filtering by type, category, and date range.
Blueprint prefix: /api/transactions
"""

from datetime import date
from flask import Blueprint, request
from ..models.transaction import Transaction
from ..models.category import Category
from ..extensions import db
from ..utils.response import success, error
from ..utils.decorators import token_required
from ..utils.validators import is_positive_number, is_valid_date, VALID_TRANSACTION_TYPES, VALID_PAYMENT_MODES

transactions_bp = Blueprint("transactions", __name__)


@transactions_bp.route("", methods=["GET"])
@token_required
def get_transactions(**kwargs):
    """
    GET /api/transactions
    List transactions for the current user.
    Query params: type, category_id, date_from (YYYY-MM-DD), date_to (YYYY-MM-DD), page, per_page
    """
    user_id = kwargs["current_user_id"]
    query = Transaction.query.filter_by(user_id=user_id)

    # Optional filters
    tx_type = request.args.get("type")
    category_id = request.args.get("category_id")
    date_from = request.args.get("date_from")
    date_to = request.args.get("date_to")

    if tx_type in VALID_TRANSACTION_TYPES:
        query = query.filter_by(type=tx_type)
    if category_id:
        query = query.filter_by(category_id=int(category_id))
    if date_from and is_valid_date(date_from):
        query = query.filter(Transaction.date >= date_from)
    if date_to and is_valid_date(date_to):
        query = query.filter(Transaction.date <= date_to)

    # Pagination
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 20))
    paginated = query.order_by(Transaction.date.desc(), Transaction.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return success(data={
        "transactions": [t.to_dict() for t in paginated.items],
        "total": paginated.total,
        "page": page,
        "per_page": per_page,
        "pages": paginated.pages
    })


@transactions_bp.route("", methods=["POST"])
@token_required
def create_transaction(**kwargs):
    """
    POST /api/transactions
    Add a new income or expense transaction.
    Body: { type, amount, date, category_id, note?, payment_mode? }
    """
    user_id = kwargs["current_user_id"]
    data = request.get_json() or {}

    # Required field validation
    tx_type = data.get("type", "").strip()
    amount = data.get("amount")
    tx_date = data.get("date", "").strip()
    category_id = data.get("category_id")

    if tx_type not in VALID_TRANSACTION_TYPES:
        return error("type must be 'income' or 'expense'.", 400)
    if not is_positive_number(amount):
        return error("amount must be a positive number.", 400)
    if not is_valid_date(tx_date):
        return error("date must be in YYYY-MM-DD format.", 400)
    if not category_id:
        return error("category_id is required.", 400)

    # Verify category belongs to user or is a system default
    cat = Category.query.filter(
        Category.id == category_id,
        (Category.user_id == None) | (Category.user_id == user_id)
    ).first()
    if not cat:
        return error("Category not found.", 404)

    payment_mode = data.get("payment_mode", "cash")
    if payment_mode not in VALID_PAYMENT_MODES:
        payment_mode = "cash"

    tx = Transaction(
        user_id=user_id,
        category_id=int(category_id),
        type=tx_type,
        amount=float(amount),
        date=date.fromisoformat(tx_date),
        note=data.get("note", "").strip() or None,
        payment_mode=payment_mode
    )
    db.session.add(tx)
    db.session.commit()
    return success(data={"transaction": tx.to_dict()}, message="Transaction added.", status_code=201)


@transactions_bp.route("/<int:tx_id>", methods=["GET"])
@token_required
def get_transaction(tx_id, **kwargs):
    """
    GET /api/transactions/:id
    Get a single transaction by ID.
    """
    user_id = kwargs["current_user_id"]
    tx = Transaction.query.filter_by(id=tx_id, user_id=user_id).first()
    if not tx:
        return error("Transaction not found.", 404)
    return success(data={"transaction": tx.to_dict()})


@transactions_bp.route("/<int:tx_id>", methods=["PUT"])
@token_required
def update_transaction(tx_id, **kwargs):
    """
    PUT /api/transactions/:id
    Update an existing transaction.
    Body: { type?, amount?, date?, category_id?, note?, payment_mode? }
    """
    user_id = kwargs["current_user_id"]
    tx = Transaction.query.filter_by(id=tx_id, user_id=user_id).first()
    if not tx:
        return error("Transaction not found.", 404)

    data = request.get_json() or {}

    if "type" in data:
        if data["type"] not in VALID_TRANSACTION_TYPES:
            return error("type must be 'income' or 'expense'.", 400)
        tx.type = data["type"]

    if "amount" in data:
        if not is_positive_number(data["amount"]):
            return error("amount must be a positive number.", 400)
        tx.amount = float(data["amount"])

    if "date" in data:
        if not is_valid_date(data["date"]):
            return error("date must be in YYYY-MM-DD format.", 400)
        tx.date = date.fromisoformat(data["date"])

    if "category_id" in data:
        cat = Category.query.filter(
            Category.id == data["category_id"],
            (Category.user_id == None) | (Category.user_id == user_id)
        ).first()
        if not cat:
            return error("Category not found.", 404)
        tx.category_id = data["category_id"]

    if "note" in data:
        tx.note = data["note"].strip() or None
    if "payment_mode" in data and data["payment_mode"] in VALID_PAYMENT_MODES:
        tx.payment_mode = data["payment_mode"]

    db.session.commit()
    return success(data={"transaction": tx.to_dict()}, message="Transaction updated.")


@transactions_bp.route("/<int:tx_id>", methods=["DELETE"])
@token_required
def delete_transaction(tx_id, **kwargs):
    """
    DELETE /api/transactions/:id
    Delete a transaction.
    """
    user_id = kwargs["current_user_id"]
    tx = Transaction.query.filter_by(id=tx_id, user_id=user_id).first()
    if not tx:
        return error("Transaction not found.", 404)

    db.session.delete(tx)
    db.session.commit()
    return success(message="Transaction deleted.")
