"""
utils/response.py
-----------------
Standard API response helpers.
All routes use these functions to ensure consistent JSON structure.
"""

from flask import jsonify


def success(data=None, message="Success", status_code=200):
    """Return a successful JSON response."""
    payload = {"success": True, "message": message}
    if data is not None:
        payload["data"] = data
    return jsonify(payload), status_code


def error(message="An error occurred", status_code=400, errors=None):
    """Return an error JSON response."""
    payload = {"success": False, "message": message}
    if errors:
        payload["errors"] = errors
    return jsonify(payload), status_code
