"""
extensions.py
-------------
Flask extension instances created here (not bound to an app yet).
Imported into the app factory (__init__.py) for initialization.
"""

from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
cors = CORS()
