"""
routes/categories.py
--------------------
Category routes: list, create, update, delete.
Blueprint prefix: /api/categories
"""

from flask import Blueprint, request
from ..models.category import Category
from ..extensions import db
from ..utils.response import success, error
from ..utils.decorators import token_required

categories_bp = Blueprint("categories", __name__)

VALID_TYPES = {"income", "expense"}


@categories_bp.route("", methods=["GET"])
@token_required
def get_categories(**kwargs):
    """
    GET /api/categories
    Returns all system-default categories + user's custom categories.
    Optional query param: ?type=income|expense
    """
    user_id = kwargs["current_user_id"]
    cat_type = request.args.get("type")

    # System defaults (user_id is NULL) + user's own custom categories
    query = Category.query.filter(
        (Category.user_id == None) | (Category.user_id == user_id)
    )
    if cat_type in VALID_TYPES:
        query = query.filter_by(type=cat_type)

    categories = query.order_by(Category.is_default.desc(), Category.name).all()
    return success(data={"categories": [c.to_dict() for c in categories]})


@categories_bp.route("", methods=["POST"])
@token_required
def create_category(**kwargs):
    """
    POST /api/categories
    Create a custom category for the current user.
    Body: { name, type, icon?, color? }
    """
    user_id = kwargs["current_user_id"]
    data = request.get_json() or {}

    name = data.get("name", "").strip()
    cat_type = data.get("type", "").strip()

    if not name:
        return error("Category name is required.", 400)
    if cat_type not in VALID_TYPES:
        return error("type must be 'income' or 'expense'.", 400)

    # Check for duplicate name for this user
    existing = Category.query.filter(
        (Category.user_id == user_id) | (Category.user_id == None),
        Category.name.ilike(name),
        Category.type == cat_type
    ).first()
    if existing:
        return error(f"A '{cat_type}' category named '{name}' already exists.", 409)

    cat = Category(
        name=name,
        type=cat_type,
        icon=data.get("icon"),
        color=data.get("color", "#6366f1"),
        is_default=False,
        user_id=user_id
    )
    db.session.add(cat)
    db.session.commit()
    return success(data={"category": cat.to_dict()}, message="Category created.", status_code=201)


@categories_bp.route("/<int:cat_id>", methods=["PUT"])
@token_required
def update_category(cat_id, **kwargs):
    """
    PUT /api/categories/:id
    Update a custom category (only user's own, not system defaults).
    Body: { name?, icon?, color? }
    """
    user_id = kwargs["current_user_id"]
    cat = Category.query.filter_by(id=cat_id, user_id=user_id).first()
    if not cat:
        return error("Category not found or cannot be edited.", 404)

    data = request.get_json() or {}
    if "name" in data and data["name"].strip():
        cat.name = data["name"].strip()
    if "icon" in data:
        cat.icon = data["icon"]
    if "color" in data:
        cat.color = data["color"]

    db.session.commit()
    return success(data={"category": cat.to_dict()}, message="Category updated.")


@categories_bp.route("/<int:cat_id>", methods=["DELETE"])
@token_required
def delete_category(cat_id, **kwargs):
    """
    DELETE /api/categories/:id
    Delete a custom category (only user's own, not system defaults).
    """
    user_id = kwargs["current_user_id"]
    cat = Category.query.filter_by(id=cat_id, user_id=user_id).first()
    if not cat:
        return error("Category not found or cannot be deleted.", 404)

    db.session.delete(cat)
    db.session.commit()
    return success(message="Category deleted.")
