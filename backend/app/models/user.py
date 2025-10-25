import sqlite3
import hashlib
import secrets
from datetime import datetime, timedelta
from flask import current_app

class User:
    def __init__(self, id=None, username=None, email=None, password_hash=None, 
                 full_name=None, created_at=None, updated_at=None, is_active=True):
        self.id = id
        self.username = username
        self.email = email
        self.password_hash = password_hash
        self.full_name = full_name
        self.created_at = created_at
        self.updated_at = updated_at
        self.is_active = is_active
    
    @staticmethod
    def hash_password(password):
        """Hash password using SHA-256"""
        return hashlib.sha256(password.encode()).hexdigest()
    
    @staticmethod
    def verify_password(password, password_hash):
        """Verify password against hash"""
        return hashlib.sha256(password.encode()).hexdigest() == password_hash
    
    def save(self):
        """Save user to database"""
        conn = sqlite3.connect(current_app.config['DATABASE_PATH'])
        cursor = conn.cursor()
        
        if self.id is None:
            # Create new user
            cursor.execute('''
                INSERT INTO users (username, email, password_hash, full_name, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (self.username, self.email, self.password_hash, self.full_name, 
                  datetime.now(), datetime.now()))
            self.id = cursor.lastrowid
        else:
            # Update existing user
            cursor.execute('''
                UPDATE users SET username=?, email=?, full_name=?, updated_at=?
                WHERE id=?
            ''', (self.username, self.email, self.full_name, datetime.now(), self.id))
        
        conn.commit()
        conn.close()
        return self
    
    @staticmethod
    def find_by_email(email):
        """Find user by email"""
        conn = sqlite3.connect(current_app.config['DATABASE_PATH'])
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM users WHERE email = ? AND is_active = TRUE', (email,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return User(
                id=row[0], username=row[1], email=row[2], password_hash=row[3],
                full_name=row[4], created_at=row[5], updated_at=row[6], is_active=row[7]
            )
        return None
    
    @staticmethod
    def find_by_username(username):
        """Find user by username"""
        conn = sqlite3.connect(current_app.config['DATABASE_PATH'])
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM users WHERE username = ? AND is_active = TRUE', (username,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return User(
                id=row[0], username=row[1], email=row[2], password_hash=row[3],
                full_name=row[4], created_at=row[5], updated_at=row[6], is_active=row[7]
            )
        return None
    
    @staticmethod
    def find_by_id(user_id):
        """Find user by ID"""
        conn = sqlite3.connect(current_app.config['DATABASE_PATH'])
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM users WHERE id = ? AND is_active = TRUE', (user_id,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return User(
                id=row[0], username=row[1], email=row[2], password_hash=row[3],
                full_name=row[4], created_at=row[5], updated_at=row[6], is_active=row[7]
            )
        return None
    
    def to_dict(self):
        """Convert user to dictionary (excluding password)"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'full_name': self.full_name,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
            'is_active': self.is_active
        }