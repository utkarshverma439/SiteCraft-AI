import os
import sqlite3
import requests
import json
from datetime import datetime
from flask import current_app

class AIService:
    def __init__(self):
        self.api_key = os.environ.get('OPENROUTER_API_KEY')
        self.base_url = "https://openrouter.ai/api/v1/chat/completions"
        self.model = "deepseek/deepseek-chat"
        
        if not self.api_key:
            raise ValueError("OPENROUTER_API_KEY environment variable is required")
    
    def generate_website_code(self, prompt, website_type="general"):
        """Generate complete website code using AI"""
        
        system_prompt = f"""You are SiteCraft AI, an expert website generator. Generate a complete, professional website based on the user's requirements.

Website Type: {website_type}

Requirements:
1. Generate a complete HTML file with embedded CSS and JavaScript
2. Use modern, responsive design with 3D effects and professional styling
3. Include proper semantic HTML structure
4. Add interactive elements and smooth animations
5. Ensure mobile responsiveness
6. Use modern CSS features (flexbox, grid, transforms, shadows)
7. Include proper meta tags and SEO optimization
8. Add placeholder content that matches the website purpose
9. Use professional color schemes and typography
10. Include navigation, hero section, content sections, and footer

Return ONLY the complete HTML code, no explanations or markdown formatting."""

        user_prompt = f"Create a professional website for: {prompt}"
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "max_tokens": 8000,
            "temperature": 0.7
        }
        
        response = requests.post(self.base_url, headers=headers, json=payload)
        
        if response.status_code != 200:
            raise Exception(f"AI API request failed: {response.status_code} - {response.text}")
        
        result = response.json()
        
        if 'choices' not in result or not result['choices']:
            raise Exception("No response from AI model")
        
        generated_code = result['choices'][0]['message']['content'].strip()
        
        # Clean up the response (remove markdown formatting if present)
        if generated_code.startswith('```html'):
            generated_code = generated_code[7:]
        if generated_code.startswith('```'):
            generated_code = generated_code[3:]
        if generated_code.endswith('```'):
            generated_code = generated_code[:-3]
        
        return generated_code.strip()
    
    def modify_website_code(self, existing_code, modifications, website_type="general"):
        """Modify existing website code based on user instructions"""
        
        system_prompt = f"""You are SiteCraft AI, an expert website modifier. Modify the existing website code based on the user's instructions.

Website Type: {website_type}

Instructions:
1. Take the existing HTML code and apply the requested modifications
2. Maintain the overall structure and quality
3. Ensure the modifications are properly integrated
4. Keep the professional 3D styling and responsiveness
5. Return the complete modified HTML code
6. Do not break existing functionality

Return ONLY the complete modified HTML code, no explanations or markdown formatting."""

        user_prompt = f"""Existing website code:
{existing_code}

Modifications requested:
{modifications}

Apply these modifications to the existing code and return the complete updated website."""
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "max_tokens": 8000,
            "temperature": 0.7
        }
        
        response = requests.post(self.base_url, headers=headers, json=payload)
        
        if response.status_code != 200:
            raise Exception(f"AI API request failed: {response.status_code} - {response.text}")
        
        result = response.json()
        
        if 'choices' not in result or not result['choices']:
            raise Exception("No response from AI model")
        
        modified_code = result['choices'][0]['message']['content'].strip()
        
        # Clean up the response
        if modified_code.startswith('```html'):
            modified_code = modified_code[7:]
        if modified_code.startswith('```'):
            modified_code = modified_code[3:]
        if modified_code.endswith('```'):
            modified_code = modified_code[:-3]
        
        return modified_code.strip()
    
    def log_generation(self, project_id, prompt, generated_output, generation_time, success, error_message=None):
        """Log AI generation attempt to database"""
        try:
            conn = sqlite3.connect(current_app.config['DATABASE_PATH'])
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO generation_history 
                (project_id, prompt, generated_output, generation_time, success, error_message, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (project_id, prompt, generated_output, generation_time, success, error_message, datetime.now()))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            print(f"Failed to log generation: {e}")
    
    def get_generation_history(self, project_id, limit=20):
        """Get generation history for a project"""
        conn = sqlite3.connect(current_app.config['DATABASE_PATH'])
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, prompt, generation_time, success, error_message, created_at
            FROM generation_history 
            WHERE project_id = ? 
            ORDER BY created_at DESC 
            LIMIT ?
        ''', (project_id, limit))
        
        rows = cursor.fetchall()
        conn.close()
        
        history = []
        for row in rows:
            history.append({
                'id': row[0],
                'prompt': row[1],
                'generation_time': row[2],
                'success': row[3],
                'error_message': row[4],
                'created_at': row[5]
            })
        
        return history