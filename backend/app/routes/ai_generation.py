from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.project import WebsiteProject
from app.services.ai_service import AIService
import time

ai_bp = Blueprint('ai', __name__)

@ai_bp.route('/generate-website', methods=['POST'])
@ai_bp.route('/generate-website/', methods=['POST'])
@jwt_required()
def generate_website():
    """Generate website using AI"""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()
        
        # Validate required fields
        if not data.get('project_id'):
            return jsonify({'error': 'Project ID is required'}), 400
        
        if not data.get('prompt'):
            return jsonify({'error': 'Website description/prompt is required'}), 400
        
        project_id = data['project_id']
        prompt = data['prompt'].strip()
        
        # Get project
        project = WebsiteProject.find_by_id(project_id, user_id)
        if not project:
            return jsonify({'error': 'Project not found'}), 404
        
        # Generate website using AI
        start_time = time.time()
        ai_service = AIService()
        
        try:
            generated_code = ai_service.generate_website_code(prompt, project.website_type)
            generation_time = time.time() - start_time
            
            # Update project with generated code
            project.generated_code = generated_code
            project.status = 'generated'
            project.save()
            
            # Log generation history
            ai_service.log_generation(project_id, prompt, generated_code, generation_time, True)
            
            return jsonify({
                'message': 'Website generated successfully',
                'project': project.to_dict(),
                'generation_time': generation_time
            }), 200
            
        except Exception as ai_error:
            generation_time = time.time() - start_time
            error_message = str(ai_error)
            
            # Log failed generation
            ai_service.log_generation(project_id, prompt, None, generation_time, False, error_message)
            
            return jsonify({
                'error': 'AI generation failed',
                'details': error_message
            }), 500
        
    except Exception as e:
        return jsonify({'error': 'Generation request failed', 'details': str(e)}), 500

@ai_bp.route('/regenerate-website', methods=['POST'])
@ai_bp.route('/regenerate-website/', methods=['POST'])
@jwt_required()
def regenerate_website():
    """Regenerate website with modifications"""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()
        
        # Validate required fields
        if not data.get('project_id'):
            return jsonify({'error': 'Project ID is required'}), 400
        
        if not data.get('modifications'):
            return jsonify({'error': 'Modification instructions are required'}), 400
        
        project_id = data['project_id']
        modifications = data['modifications'].strip()
        
        # Get project
        project = WebsiteProject.find_by_id(project_id, user_id)
        if not project:
            return jsonify({'error': 'Project not found'}), 404
        
        if not project.generated_code:
            return jsonify({'error': 'No existing code to modify. Generate website first.'}), 400
        
        # Regenerate with modifications
        start_time = time.time()
        ai_service = AIService()
        
        try:
            modified_code = ai_service.modify_website_code(
                project.generated_code, 
                modifications, 
                project.website_type
            )
            generation_time = time.time() - start_time
            
            # Update project
            project.generated_code = modified_code
            project.status = 'regenerated'
            project.save()
            
            # Log generation history
            ai_service.log_generation(project_id, f"Modifications: {modifications}", 
                                    modified_code, generation_time, True)
            
            return jsonify({
                'message': 'Website regenerated successfully',
                'project': project.to_dict(),
                'generation_time': generation_time
            }), 200
            
        except Exception as ai_error:
            generation_time = time.time() - start_time
            error_message = str(ai_error)
            
            # Log failed generation
            ai_service.log_generation(project_id, f"Modifications: {modifications}", 
                                    None, generation_time, False, error_message)
            
            return jsonify({
                'error': 'AI regeneration failed',
                'details': error_message
            }), 500
        
    except Exception as e:
        return jsonify({'error': 'Regeneration request failed', 'details': str(e)}), 500

@ai_bp.route('/generation-history/<int:project_id>', methods=['GET'])
@ai_bp.route('/generation-history/<int:project_id>/', methods=['GET'])
@jwt_required()
def get_generation_history(project_id):
    """Get AI generation history for a project"""
    try:
        user_id = int(get_jwt_identity())
        
        # Verify project ownership
        project = WebsiteProject.find_by_id(project_id, user_id)
        if not project:
            return jsonify({'error': 'Project not found'}), 404
        
        ai_service = AIService()
        history = ai_service.get_generation_history(project_id)
        
        return jsonify({'history': history}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get generation history', 'details': str(e)}), 500