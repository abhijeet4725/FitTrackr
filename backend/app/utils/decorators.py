"""
utils/decorators.py
-------------------
Custom Flask decorators used across route handlers.
"""

from functools import wraps
from flask import request
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from .response import error


def token_required(f):
    """
    Decorator to protect routes that require a valid JWT token.
    Sets current_user_id in kwargs for use inside the route.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            verify_jwt_in_request()
            kwargs["current_user_id"] = int(get_jwt_identity())
        except Exception:
            return error("Authentication required. Please log in.", 401)
        return f(*args, **kwargs)
    return decorated


def validate_json(*required_fields):
    """
    Decorator to validate that a JSON body is present and contains required fields.
    Usage: @validate_json('amount', 'date', 'category_id')
    """
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            data = request.get_json()
            if not data:
                return error("Request body must be valid JSON.", 400)
            missing = [field for field in required_fields if field not in data or data[field] is None]
            if missing:
                return error(f"Missing required fields: {', '.join(missing)}", 400)
            return f(*args, **kwargs)
        return decorated
    return decorator
