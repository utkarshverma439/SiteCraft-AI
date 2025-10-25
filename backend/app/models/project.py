import sqlite3
from datetime import datetime
from flask import current_app

class WebsiteProject:
    def __init__(self, id=None, user_id=None, project_name=None, description=None,
                 website_type=None, requirements=None, generated_code=None, 
                 status='draft', created_at=None, updated_at=None):
        self.id = id
        self.user_id = user_id
        self.project_name = project_name
        self.description = description
        self.website_type = website_type
        self.requirements = requirements
        self.generated_code = generated_code
        self.status = status
        self.created_at = created_at
        self.updated_at = updated_at
    
    def save(self):
        """Save project to database"""
        conn = sqlite3.connect(current_app.config['DATABASE_PATH'])
        cursor = conn.cursor()
        
        if self.id is None:
            # Create new project
            cursor.execute('''
                INSERT INTO website_projects 
                (user_id, project_name, description, website_type, requirements, 
                 generated_code, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (self.user_id, self.project_name, self.description, self.website_type,
                  self.requirements, self.generated_code, self.status, 
                  datetime.now(), datetime.now()))
            self.id = cursor.lastrowid
        else:
            # Update existing project
            cursor.execute('''
                UPDATE website_projects SET 
                project_name=?, description=?, website_type=?, requirements=?,
                generated_code=?, status=?, updated_at=?
                WHERE id=? AND user_id=?
            ''', (self.project_name, self.description, self.website_type,
                  self.requirements, self.generated_code, self.status,
                  datetime.now(), self.id, self.user_id))
        
        conn.commit()
        conn.close()
        return self
    
    @staticmethod
    def find_by_user(user_id, limit=50, offset=0):
        """Find projects by user ID"""
        conn = sqlite3.connect(current_app.config['DATABASE_PATH'])
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM website_projects 
            WHERE user_id = ? 
            ORDER BY updated_at DESC 
            LIMIT ? OFFSET ?
        ''', (user_id, limit, offset))
        
        rows = cursor.fetchall()
        conn.close()
        
        projects = []
        for row in rows:
            projects.append(WebsiteProject(
                id=row[0], user_id=row[1], project_name=row[2], description=row[3],
                website_type=row[4], requirements=row[5], generated_code=row[6],
                status=row[7], created_at=row[8], updated_at=row[9]
            ))
        
        return projects
    
    @staticmethod
    def find_by_id(project_id, user_id):
        """Find project by ID and user ID"""
        conn = sqlite3.connect(current_app.config['DATABASE_PATH'])
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM website_projects 
            WHERE id = ? AND user_id = ?
        ''', (project_id, user_id))
        
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return WebsiteProject(
                id=row[0], user_id=row[1], project_name=row[2], description=row[3],
                website_type=row[4], requirements=row[5], generated_code=row[6],
                status=row[7], created_at=row[8], updated_at=row[9]
            )
        return None
    
    def delete(self):
        """Delete project from database"""
        if self.id:
            conn = sqlite3.connect(current_app.config['DATABASE_PATH'])
            cursor = conn.cursor()
            
            cursor.execute('DELETE FROM website_projects WHERE id = ? AND user_id = ?', 
                          (self.id, self.user_id))
            
            conn.commit()
            conn.close()
            return True
        return False
    
    def to_dict(self):
        """Convert project to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'project_name': self.project_name,
            'description': self.description,
            'website_type': self.website_type,
            'requirements': self.requirements,
            'generated_code': self.generated_code,
            'status': self.status,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }