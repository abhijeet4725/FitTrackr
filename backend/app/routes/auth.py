"""
routes/auth.py
--------------
Authentication routes: register, login, logout, profile management.
Blueprint prefix: /api/auth
"""

from flask import Blueprint, request
from flask_jwt_extended import create_access_token, get_jwt_identity
from ..models.user import User
from ..extensions import db
from ..utils.response import success, error
from ..utils.validators import is_valid_email
from ..utils.decorators import token_required

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    """
    POST /api/auth/register
    Register a new user account.
    Body: { name, email, password }
    """
    data = request.get_json()
    if not data:
        return error("Request body required.", 400)

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    # Validation
    if not name or not email or not password:
        return error("Name, email, and password are required.", 400)
    if not is_valid_email(email):
        return error("Invalid email address format.", 400)
    if len(password) < 6:
        return error("Password must be at least 6 characters.", 400)
    if User.query.filter_by(email=email).first():
        return error("An account with this email already exists.", 409)

    # Create user
    user = User(name=name, email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    # Seed default categories for the new user (system categories are shared)
    token = create_access_token(identity=str(user.id))
    return success(
        data={"user": user.to_dict(), "access_token": token},
        message="Account created successfully.",
        status_code=201
    )


@auth_bp.route("/login", methods=["POST"])
def login():
    """
    POST /api/auth/login
    Authenticate user and return JWT access token.
    Body: { email, password }
    """
    data = request.get_json()
    if not data:
        return error("Request body required.", 400)

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return error("Email and password are required.", 400)

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return error("Invalid email or password.", 401)

    token = create_access_token(identity=str(user.id))
    return success(
        data={"user": user.to_dict(), "access_token": token},
        message="Login successful."
    )


@auth_bp.route("/logout", methods=["POST"])
@token_required
def logout(**kwargs):
    """
    POST /api/auth/logout
    Logout is handled client-side (discard token).
    Server acknowledges the request.
    """
    return success(message="Logged out successfully.")


@auth_bp.route("/me", methods=["GET"])
@token_required
def get_profile(**kwargs):
    """
    GET /api/auth/me
    Get the currently logged-in user's profile.
    """
    user_id = kwargs["current_user_id"]
    user = User.query.get(user_id)
    if not user:
        return error("User not found.", 404)
    return success(data={"user": user.to_dict()})


@auth_bp.route("/me", methods=["PUT"])
@token_required
def update_profile(**kwargs):
    """
    PUT /api/auth/me
    Update display name, currency, and monthly targets.
    Body: { name?, currency?, monthly_income_target?, monthly_savings_target? }
    """
    user_id = kwargs["current_user_id"]
    user = User.query.get(user_id)
    if not user:
        return error("User not found.", 404)

    data = request.get_json() or {}

    if "name" in data and data["name"].strip():
        user.name = data["name"].strip()
    if "currency" in data and data["currency"].strip():
        user.currency = data["currency"].strip().upper()
    if "monthly_income_target" in data:
        try:
            user.monthly_income_target = float(data["monthly_income_target"])
        except (TypeError, ValueError):
            return error("monthly_income_target must be a number.", 400)
    if "monthly_savings_target" in data:
        try:
            user.monthly_savings_target = float(data["monthly_savings_target"])
        except (TypeError, ValueError):
            return error("monthly_savings_target must be a number.", 400)

    db.session.commit()
    return success(data={"user": user.to_dict()}, message="Profile updated.")


@auth_bp.route("/change-password", methods=["PUT"])
@token_required
def change_password(**kwargs):
    """
    PUT /api/auth/change-password
    Change the user's password.
    Body: { current_password, new_password }
    """
    user_id = kwargs["current_user_id"]
    user = User.query.get(user_id)
    data = request.get_json() or {}

    current_password = data.get("current_password", "")
    new_password = data.get("new_password", "")

    if not current_password or not new_password:
        return error("current_password and new_password are required.", 400)
    if not user.check_password(current_password):
        return error("Current password is incorrect.", 401)
    if len(new_password) < 6:
        return error("New password must be at least 6 characters.", 400)

    user.set_password(new_password)
    db.session.commit()
    return success(message="Password changed successfully.")
