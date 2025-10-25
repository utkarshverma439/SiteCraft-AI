from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.project import WebsiteProject

projects_bp = Blueprint('projects', __name__)

@projects_bp.route('', methods=['GET'])
@projects_bp.route('/', methods=['GET'])
@jwt_required()
def get_projects():
    """Get user's projects"""
    try:
        user_id = int(get_jwt_identity())
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        # Calculate offset
        offset = (page - 1) * per_page
        
        projects = WebsiteProject.find_by_user(user_id, limit=per_page, offset=offset)
        
        return jsonify({
            'projects': [project.to_dict() for project in projects],
            'page': page,
            'per_page': per_page
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get projects', 'details': str(e)}), 500

@projects_bp.route('', methods=['POST'])
@projects_bp.route('/', methods=['POST'])
@jwt_required()
def create_project():
    """Create new project"""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()
        
        # Validate required fields
        if not data.get('project_name'):
            return jsonify({'error': 'Project name is required'}), 400
        
        project = WebsiteProject(
            user_id=user_id,
            project_name=data['project_name'].strip(),
            description=data.get('description', '').strip(),
            website_type=data.get('website_type', 'general'),
            requirements=data.get('requirements', '').strip(),
            status='draft'
        )
        
        project.save()
        
        return jsonify({
            'message': 'Project created successfully',
            'project': project.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'error': 'Failed to create project', 'details': str(e)}), 500

@projects_bp.route('/<int:project_id>', methods=['GET'])
@projects_bp.route('/<int:project_id>/', methods=['GET'])
@jwt_required()
def get_project(project_id):
    """Get specific project"""
    try:
        user_id = int(get_jwt_identity())
        project = WebsiteProject.find_by_id(project_id, user_id)
        
        if not project:
            return jsonify({'error': 'Project not found'}), 404
        
        return jsonify({'project': project.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get project', 'details': str(e)}), 500

@projects_bp.route('/<int:project_id>', methods=['PUT'])
@projects_bp.route('/<int:project_id>/', methods=['PUT'])
@jwt_required()
def update_project(project_id):
    """Update project"""
    try:
        user_id = int(get_jwt_identity())
        project = WebsiteProject.find_by_id(project_id, user_id)
        
        if not project:
            return jsonify({'error': 'Project not found'}), 404
        
        data = request.get_json()
        
        # Update allowed fields
        if data.get('project_name'):
            project.project_name = data['project_name'].strip()
        
        if 'description' in data:
            project.description = data['description'].strip()
        
        if data.get('website_type'):
            project.website_type = data['website_type']
        
        if 'requirements' in data:
            project.requirements = data['requirements'].strip()
        
        if 'generated_code' in data:
            project.generated_code = data['generated_code']
        
        if data.get('status'):
            project.status = data['status']
        
        project.save()
        
        return jsonify({
            'message': 'Project updated successfully',
            'project': project.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to update project', 'details': str(e)}), 500

@projects_bp.route('/<int:project_id>', methods=['DELETE'])
@projects_bp.route('/<int:project_id>/', methods=['DELETE'])
@jwt_required()
def delete_project(project_id):
    """Delete project"""
    try:
        user_id = int(get_jwt_identity())
        project = WebsiteProject.find_by_id(project_id, user_id)
        
        if not project:
            return jsonify({'error': 'Project not found'}), 404
        
        project.delete()
        
        return jsonify({'message': 'Project deleted successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to delete project', 'details': str(e)}), 500