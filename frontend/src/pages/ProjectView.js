import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { projectAPI, aiAPI } from '../services/api';
import { 
  Eye, Download, Edit3, RefreshCw, Code, 
  Smartphone, Monitor, Tablet, Loader, 
  ArrowLeft, Sparkles, Save 
} from 'lucide-react';
import styled from 'styled-components';
import toast from 'react-hot-toast';

const ProjectContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 100px 2rem 2rem;
`;

const ProjectContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  color: white;
  padding: 0.75rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const ProjectTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  color: white;
  text-align: center;
  flex: 1;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const ActionButton = styled.button`
  background: ${props => {
    switch (props.variant) {
      case 'primary': return 'linear-gradient(145deg, #667eea, #764ba2)';
      case 'success': return 'linear-gradient(145deg, #10b981, #059669)';
      case 'warning': return 'linear-gradient(145deg, #f59e0b, #d97706)';
      default: return 'rgba(255, 255, 255, 0.2)';
    }
  }};
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  color: white;
  padding: 0.75rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    opacity: 0.9;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const PreviewSection = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
`;

const PreviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(102, 126, 234, 0.1);
`;

const PreviewTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DeviceButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const DeviceButton = styled.button`
  background: ${props => props.active ? 
    'linear-gradient(145deg, #667eea, #764ba2)' : 
    'rgba(102, 126, 234, 0.1)'};
  border: none;
  border-radius: 8px;
  color: ${props => props.active ? 'white' : '#667eea'};
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.active ? 
      'linear-gradient(145deg, #667eea, #764ba2)' : 
      'rgba(102, 126, 234, 0.2)'};
  }
`;

const PreviewFrame = styled.div`
  width: 100%;
  height: 600px;
  border: 2px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  overflow: hidden;
  background: white;
  position: relative;
  
  iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InfoCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const CardTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 1rem;
`;

const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
  
  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.span`
  color: #666;
  font-weight: 500;
`;

const InfoValue = styled.span`
  color: #333;
  font-weight: 600;
`;

const StatusBadge = styled.span`
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

const ModifySection = styled.div``;

const ModifyTextArea = styled.textarea`
  width: 100%;
  padding: 1rem;
  border: 2px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  font-size: 0.9rem;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  margin-bottom: 1rem;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const ModifyButton = styled.button`
  background: linear-gradient(145deg, #10b981, #059669);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  padding: 0.75rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
`;

const ProjectView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDevice, setActiveDevice] = useState('desktop');
  const [modifications, setModifications] = useState('');
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    loadProject();
  }, [id]);

  const loadProject = async () => {
    try {
      const response = await projectAPI.getProject(id);
      setProject(response.data.project);
    } catch (error) {
      toast.error('Failed to load project');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };  const handleDownload = () => {
    if (!project?.generated_code) {
      toast.error('No generated code to download');
      return;
    }

    const blob = new Blob([project.generated_code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.project_name.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Website downloaded successfully!');
  };

  const handleRegenerate = async () => {
    if (!modifications.trim()) {
      toast.error('Please describe what changes you want to make');
      return;
    }

    try {
      setRegenerating(true);
      const response = await aiAPI.regenerateWebsite(project.id, modifications);
      setProject(response.data.project);
      setModifications('');
      toast.success('Website regenerated successfully!');
    } catch (error) {
      toast.error('Failed to regenerate website');
      console.error('Error regenerating:', error);
    } finally {
      setRegenerating(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDeviceWidth = () => {
    switch (activeDevice) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      default: return '100%';
    }
  };

  if (loading) {
    return (
      <ProjectContainer>
        <ProjectContent>
          <div style={{ textAlign: 'center', color: 'white', fontSize: '1.2rem' }}>
            <div className="pulse-animation">Loading project...</div>
          </div>
        </ProjectContent>
      </ProjectContainer>
    );
  }

  if (!project) {
    return (
      <ProjectContainer>
        <ProjectContent>
          <div style={{ textAlign: 'center', color: 'white' }}>
            <h2>Project not found</h2>
            <button onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </button>
          </div>
        </ProjectContent>
      </ProjectContainer>
    );
  }

  return (
    <ProjectContainer>
      <ProjectContent>
        <Header>
          <BackButton onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={20} />
            Back to Dashboard
          </BackButton>
          
          <ProjectTitle>{project.project_name}</ProjectTitle>
          
          <ActionButtons>
            <ActionButton 
              variant="primary"
              onClick={() => navigate(`/builder?edit=${project.id}`)}
            >
              <Edit3 size={18} />
              Edit
            </ActionButton>
            
            {project.generated_code && (
              <ActionButton 
                variant="success"
                onClick={handleDownload}
              >
                <Download size={18} />
                Download
              </ActionButton>
            )}
          </ActionButtons>
        </Header>

        <MainContent>
          <PreviewSection>
            <PreviewHeader>
              <PreviewTitle>
                <Eye size={20} />
                Website Preview
              </PreviewTitle>
              
              <DeviceButtons>
                <DeviceButton 
                  active={activeDevice === 'desktop'}
                  onClick={() => setActiveDevice('desktop')}
                  title="Desktop View"
                >
                  <Monitor size={18} />
                </DeviceButton>
                <DeviceButton 
                  active={activeDevice === 'tablet'}
                  onClick={() => setActiveDevice('tablet')}
                  title="Tablet View"
                >
                  <Tablet size={18} />
                </DeviceButton>
                <DeviceButton 
                  active={activeDevice === 'mobile'}
                  onClick={() => setActiveDevice('mobile')}
                  title="Mobile View"
                >
                  <Smartphone size={18} />
                </DeviceButton>
              </DeviceButtons>
            </PreviewHeader>

            <PreviewFrame>
              {project.generated_code ? (
                <iframe
                  srcDoc={project.generated_code}
                  style={{ 
                    width: getDeviceWidth(),
                    margin: activeDevice !== 'desktop' ? '0 auto' : '0',
                    display: 'block'
                  }}
                  title="Website Preview"
                />
              ) : (
                <EmptyState>
                  <h3>No website generated yet</h3>
                  <p>Use the website builder to generate your AI-powered website</p>
                  <ActionButton 
                    variant="primary"
                    onClick={() => navigate(`/builder?edit=${project.id}`)}
                    style={{ marginTop: '1rem' }}
                  >
                    <Sparkles size={18} />
                    Generate Website
                  </ActionButton>
                </EmptyState>
              )}
            </PreviewFrame>
          </PreviewSection>

          <Sidebar>
            <InfoCard>
              <CardTitle>Project Information</CardTitle>
              <InfoItem>
                <InfoLabel>Status:</InfoLabel>
                <StatusBadge status={project.status}>
                  {project.status}
                </StatusBadge>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Type:</InfoLabel>
                <InfoValue>{project.website_type}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Created:</InfoLabel>
                <InfoValue>{formatDate(project.created_at)}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Updated:</InfoLabel>
                <InfoValue>{formatDate(project.updated_at)}</InfoValue>
              </InfoItem>
            </InfoCard>

            {project.description && (
              <InfoCard>
                <CardTitle>Description</CardTitle>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  {project.description}
                </p>
              </InfoCard>
            )}

            {project.requirements && (
              <InfoCard>
                <CardTitle>Requirements</CardTitle>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  {project.requirements}
                </p>
              </InfoCard>
            )}

            {project.generated_code && (
              <InfoCard>
                <ModifySection>
                  <CardTitle>Modify Website</CardTitle>
                  <ModifyTextArea
                    value={modifications}
                    onChange={(e) => setModifications(e.target.value)}
                    placeholder="Describe what changes you want to make to the website..."
                  />
                  <ModifyButton
                    onClick={handleRegenerate}
                    disabled={regenerating || !modifications.trim()}
                  >
                    {regenerating ? (
                      <>
                        <Loader size={16} className="pulse-animation" />
                        Regenerating...
                      </>
                    ) : (
                      <>
                        <RefreshCw size={16} />
                        Regenerate
                      </>
                    )}
                  </ModifyButton>
                </ModifySection>
              </InfoCard>
            )}
          </Sidebar>
        </MainContent>
      </ProjectContent>
    </ProjectContainer>
  );
};

export default ProjectView;