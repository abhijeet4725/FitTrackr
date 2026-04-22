"""
__init__.py  (App Factory)
--------------------------
Creates and configures the Flask application instance.
Registers all blueprints (route groups) and initializes extensions.
"""

import os
from flask import Flask
from .config import config_map
from .extensions import db, migrate, jwt, cors


def create_app(env_name: str = None) -> Flask:
    """
    Application factory.
    Args:
        env_name: 'development' | 'production' | 'testing'
    Returns:
        Configured Flask application instance.
    """
    app = Flask(__name__)

    # Load configuration
    env = env_name or os.getenv("FLASK_ENV", "development")
    app.config.from_object(config_map.get(env, config_map["development"]))

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})

    # Register blueprints (route modules)
    from .routes.auth import auth_bp
    from .routes.transactions import transactions_bp
    from .routes.categories import categories_bp
    from .routes.budgets import budgets_bp
    from .routes.savings_goals import savings_goals_bp
    from .routes.dashboard import dashboard_bp
    from .routes.insights import insights_bp
    from .routes.reports import reports_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(transactions_bp, url_prefix="/api/transactions")
    app.register_blueprint(categories_bp, url_prefix="/api/categories")
    app.register_blueprint(budgets_bp, url_prefix="/api/budgets")
    app.register_blueprint(savings_goals_bp, url_prefix="/api/savings-goals")
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")
    app.register_blueprint(insights_bp, url_prefix="/api/insights")
    app.register_blueprint(reports_bp, url_prefix="/api/reports")

    # Health check endpoint
    @app.route("/api/health")
    def health():
        return {"status": "ok", "app": "FinTrackr"}

    return app
