from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import sqlite3
import os
from datetime import timedelta

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'sitecraft-ai-secret-key-2024')
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-string')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
    app.config['DATABASE_PATH'] = os.path.join(os.path.dirname(os.path.dirname(__file__)), '..', 'database', 'sitecraft.db')
    
    # Initialize extensions
    CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000", "null"], 
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         allow_headers=["Content-Type", "Authorization"],
         supports_credentials=True)
    jwt = JWTManager(app)
    
    # Initialize database
    init_database(app.config['DATABASE_PATH'])
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.projects import projects_bp
    from app.routes.ai_generation import ai_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(projects_bp, url_prefix='/api/projects')
    app.register_blueprint(ai_bp, url_prefix='/api/ai')
    
    return app

def init_database(db_path):
    """Initialize the database with schema if it doesn't exist"""
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    
    if not os.path.exists(db_path):
        conn = sqlite3.connect(db_path)
        
        # Read and execute schema
        schema_path = os.path.join(os.path.dirname(db_path), 'schema.sql')
        if os.path.exists(schema_path):
            with open(schema_path, 'r') as f:
                conn.executescript(f.read())
        
        conn.close()
        print(f"Database initialized at {db_path}")