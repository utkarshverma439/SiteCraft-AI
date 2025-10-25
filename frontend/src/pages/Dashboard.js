import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { projectAPI } from '../services/api';
import { Plus, Folder, Calendar, Eye, Trash2, Edit3 } from 'lucide-react';
import styled from 'styled-components';
import toast from 'react-hot-toast';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 100px 2rem 2rem;
`;

const DashboardContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const WelcomeTitle = styled(motion.h1)`
  font-size: 3rem;
  font-weight: 800;
  color: white;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const WelcomeSubtitle = styled(motion.p)`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 2rem;
`;

const ActionButtons = styled(motion.div)`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 3rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const ActionButton = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  color: white;
  text-decoration: none;
  font-weight: 600;
  padding: 1rem 1.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }
`;

const ProjectsSection = styled.section`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ProjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
`;

const ProjectCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }
`;

const ProjectHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const ProjectTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.5rem;
  flex: 1;
`;

const ProjectStatus = styled.span`
  background: ${props => {
    switch (props.status) {
      case 'generated': return 'linear-gradient(145deg, #10b981, #059669)';
      case 'regenerated': return 'linear-gradient(145deg, #3b82f6, #2563eb)';
      case 'draft': return 'linear-gradient(145deg, #f59e0b, #d97706)';
      default: return 'linear-gradient(145deg, #6b7280, #4b5563)';
    }
  }};
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
`;

const ProjectDescription = styled.p`
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  line-height: 1.5;
`;

const ProjectMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #888;
  font-size: 0.8rem;
  margin-bottom: 1rem;
`;

const ProjectActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionBtn = styled.button`
  background: ${props => props.variant === 'danger' ? 
    'linear-gradient(145deg, #ef4444, #dc2626)' : 
    'linear-gradient(145deg, #667eea, #764ba2)'};
  border: none;
  border-radius: 8px;
  color: white;
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    opacity: 0.9;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: rgba(255, 255, 255, 0.8);
`;

const EmptyStateTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const EmptyStateText = styled.p`
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await projectAPI.getProjects();
      setProjects(response.data.projects);
    } catch (error) {
      toast.error('Failed to load projects');
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      await projectAPI.deleteProject(projectId);
      setProjects(projects.filter(p => p.id !== projectId));
      toast.success('Project deleted successfully');
    } catch (error) {
      toast.error('Failed to delete project');
      console.error('Error deleting project:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <DashboardContainer>
        <DashboardContent>
          <div style={{ textAlign: 'center', color: 'white', fontSize: '1.2rem' }}>
            <div className="pulse-animation">Loading your projects...</div>
          </div>
        </DashboardContent>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <DashboardContent>
        <Header>
          <WelcomeTitle
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Welcome back, {user?.full_name || user?.username}!
          </WelcomeTitle>
          
          <WelcomeSubtitle
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Ready to create something amazing with AI?
          </WelcomeSubtitle>
          
          <ActionButtons
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <ActionButton to="/builder">
              <Plus size={20} />
              New Project
            </ActionButton>
          </ActionButtons>
        </Header>

        <ProjectsSection>
          <SectionTitle>
            <Folder size={24} />
            Your Projects ({projects.length})
          </SectionTitle>

          {projects.length === 0 ? (
            <EmptyState>
              <EmptyStateTitle>No projects yet</EmptyStateTitle>
              <EmptyStateText>
                Start your first AI-powered website project and watch the magic happen!
              </EmptyStateText>
              <ActionButton to="/builder">
                <Plus size={20} />
                Create Your First Project
              </ActionButton>
            </EmptyState>
          ) : (
            <ProjectsGrid>
              {projects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <ProjectHeader>
                    <div style={{ flex: 1 }}>
                      <ProjectTitle>{project.project_name}</ProjectTitle>
                      <ProjectStatus status={project.status}>
                        {project.status}
                      </ProjectStatus>
                    </div>
                  </ProjectHeader>
                  
                  {project.description && (
                    <ProjectDescription>
                      {project.description.length > 100 
                        ? `${project.description.substring(0, 100)}...`
                        : project.description
                      }
                    </ProjectDescription>
                  )}
                  
                  <ProjectMeta>
                    <span>
                      <Calendar size={14} style={{ marginRight: '0.25rem' }} />
                      {formatDate(project.created_at)}
                    </span>
                    <span>Type: {project.website_type}</span>
                  </ProjectMeta>
                  
                  <ProjectActions>
                    <ActionBtn 
                      onClick={() => navigate(`/project/${project.id}`)}
                      title="View Project"
                    >
                      <Eye size={16} />
                    </ActionBtn>
                    <ActionBtn 
                      onClick={() => navigate(`/builder?edit=${project.id}`)}
                      title="Edit Project"
                    >
                      <Edit3 size={16} />
                    </ActionBtn>
                    <ActionBtn 
                      variant="danger"
                      onClick={() => handleDeleteProject(project.id)}
                      title="Delete Project"
                    >
                      <Trash2 size={16} />
                    </ActionBtn>
                  </ProjectActions>
                </ProjectCard>
              ))}
            </ProjectsGrid>
          )}
        </ProjectsSection>
      </DashboardContent>
    </DashboardContainer>
  );
};

export default Dashboard;