import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { projectAPI, aiAPI } from '../services/api';
import { Sparkles, Save, Eye, RefreshCw, Loader } from 'lucide-react';
import styled from 'styled-components';
import toast from 'react-hot-toast';

const BuilderContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 100px 2rem 2rem;
`;

const BuilderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const BuilderCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  color: #333;
  text-align: center;
  margin-bottom: 2rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: #333;
  font-size: 1.1rem;
`;

const Input = styled.input`
  padding: 1rem;
  border: 2px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const Select = styled.select`
  padding: 1rem;
  border: 2px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  font-size: 1rem;
  background: white;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const TextArea = styled.textarea`
  padding: 1rem;
  border: 2px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
  font-family: inherit;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Button = styled(motion.button)`
  background: ${props => props.variant === 'secondary' ? 
    'linear-gradient(145deg, #6b7280, #4b5563)' : 
    'linear-gradient(145deg, #667eea, #764ba2)'};
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  padding: 1rem 2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const GenerationSection = styled.div`
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid rgba(102, 126, 234, 0.1);
`;

const GenerationTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PromptArea = styled.div`
  margin-bottom: 1.5rem;
`;

const GenerateButton = styled(motion.button)`
  background: linear-gradient(145deg, #10b981, #059669);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 1.1rem;
  font-weight: 700;
  padding: 1.25rem 2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  transition: all 0.3s ease;
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

const LoadingCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 3rem;
  text-align: center;
  max-width: 400px;
  margin: 2rem;
`;

const LoadingTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 1rem;
`;

const LoadingText = styled.p`
  color: #666;
  margin-bottom: 2rem;
`;

const WebsiteBuilder = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  
  const [formData, setFormData] = useState({
    project_name: '',
    description: '',
    website_type: 'business',
    requirements: ''
  });
  
  const [prompt, setPrompt] = useState('');
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editId) {
      loadProject(editId);
    }
  }, [editId]);

  // Auto-generate prompt when project data changes
  useEffect(() => {
    if (project && !prompt) {
      generateAutoPrompt();
    }
  }, [project]);

  const generateAutoPrompt = () => {
    const websiteTypePrompts = {
      business: "Create a professional business website",
      portfolio: "Design a creative portfolio website", 
      blog: "Build a modern blog website",
      ecommerce: "Develop an e-commerce website",
      landing: "Create a high-converting landing page",
      restaurant: "Design a restaurant website",
      agency: "Build a digital agency website",
      nonprofit: "Create a nonprofit organization website",
      education: "Design an educational website",
      healthcare: "Build a healthcare website",
      other: "Create a professional website"
    };

    const colorSchemes = {
      business: "professional blue and white with gray accents",
      portfolio: "creative and vibrant with a dark theme",
      blog: "clean and readable with warm colors",
      ecommerce: "trustworthy blues and greens with white",
      landing: "high-contrast colors for conversions",
      restaurant: "warm and appetizing colors (reds, oranges, browns)",
      agency: "modern and bold with bright accents",
      nonprofit: "trustworthy and warm colors",
      education: "friendly and accessible colors",
      healthcare: "calming blues and greens with white",
      other: "modern and professional color scheme"
    };

    const basePrompt = websiteTypePrompts[formData.website_type] || websiteTypePrompts.other;
    const colorScheme = colorSchemes[formData.website_type] || colorSchemes.other;
    
    let autoPrompt = `${basePrompt} for "${formData.project_name}".

Requirements:
- Modern responsive design with ${colorScheme}
- Hero section, about/services, contact form, footer
${formData.website_type === 'business' ? '- Include testimonials section' : ''}
${formData.website_type === 'portfolio' ? '- Include portfolio gallery' : ''}
${formData.website_type === 'restaurant' ? '- Include menu section' : ''}
${formData.description ? `- ${formData.description}` : ''}
${formData.requirements ? `- ${formData.requirements}` : ''}

Create a complete HTML file with embedded CSS and JavaScript. Use modern design with smooth animations and 3D effects.`;

    setPrompt(autoPrompt);
  };

  const loadProject = async (projectId) => {
    try {
      setLoading(true);
      const response = await projectAPI.getProject(projectId);
      const projectData = response.data.project;
      
      setProject(projectData);
      setFormData({
        project_name: projectData.project_name,
        description: projectData.description || '',
        website_type: projectData.website_type,
        requirements: projectData.requirements || ''
      });
    } catch (error) {
      toast.error('Failed to load project');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const newFormData = {
      ...formData,
      [e.target.name]: e.target.value
    };
    setFormData(newFormData);
    
    // Auto-regenerate prompt if website type changes
    if (e.target.name === 'website_type' && project) {
      setTimeout(() => {
        generateAutoPrompt();
      }, 100);
    }
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    
    if (!formData.project_name.trim()) {
      toast.error('Project name is required');
      return;
    }

    try {
      setSaving(true);
      
      if (project) {
        // Update existing project
        await projectAPI.updateProject(project.id, formData);
        toast.success('Project updated successfully');
      } else {
        // Create new project
        const response = await projectAPI.createProject(formData);
        setProject(response.data.project);
        toast.success('Project created successfully');
      }
    } catch (error) {
      toast.error('Failed to save project');
      console.error('Error saving project:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateWebsite = async () => {
    if (!project) {
      toast.error('Please save the project first');
      return;
    }

    if (!prompt.trim()) {
      toast.error('Please describe what kind of website you want');
      return;
    }

    try {
      setGenerating(true);
      
      console.log('🚀 Starting AI generation...');
      console.log('📋 Project ID:', project.id);
      console.log('📝 Prompt length:', prompt.length);
      console.log('👀 Prompt preview:', prompt.substring(0, 100) + '...');
      
      // Show progress message
      toast.loading('AI is crafting your website... This may take 1-2 minutes.', {
        id: 'ai-generation',
        duration: 120000 // 2 minutes
      });
      
      const startTime = Date.now();
      const response = await aiAPI.generateWebsite(project.id, prompt);
      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(1);
      
      console.log('✅ AI generation completed in', duration, 'seconds');
      console.log('📊 Response data:', response.data);
      
      // Dismiss loading toast
      toast.dismiss('ai-generation');
      
      // Update project with generated code
      setProject(response.data.project);
      
      toast.success('Website generated successfully!');
      
      // Navigate to project view
      setTimeout(() => {
        navigate(`/project/${project.id}`);
      }, 1000);
      
    } catch (error) {
      console.error('Error generating website:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Failed to generate website. Please try again.';
      
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 401) {
          errorMessage = 'Authentication failed. Please login again.';
        } else if (status === 400) {
          errorMessage = data.error || 'Invalid request. Please check your input.';
        } else if (status === 500) {
          errorMessage = data.error || 'Server error. Please try again later.';
        } else {
          errorMessage = `Error ${status}: ${data.error || 'Unknown error'}`;
        }
      } else if (error.request) {
        // Network error
        errorMessage = 'Network error. Please check your connection.';
      }
      
      toast.error(errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  const websiteTypes = [
    { value: 'business', label: 'Business Website' },
    { value: 'portfolio', label: 'Portfolio' },
    { value: 'blog', label: 'Blog' },
    { value: 'ecommerce', label: 'E-commerce' },
    { value: 'landing', label: 'Landing Page' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'agency', label: 'Agency' },
    { value: 'nonprofit', label: 'Non-profit' },
    { value: 'education', label: 'Education' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'other', label: 'Other' }
  ];

  if (loading) {
    return (
      <BuilderContainer>
        <BuilderContent>
          <div style={{ textAlign: 'center', color: 'white', fontSize: '1.2rem' }}>
            <div className="pulse-animation">Loading project...</div>
          </div>
        </BuilderContent>
      </BuilderContainer>
    );
  }

  return (
    <>
      <BuilderContainer>
        <BuilderContent>
          <BuilderCard
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Title>
              {project ? 'Edit Project' : 'Create New Project'}
            </Title>

            <Form onSubmit={handleSaveProject}>
              <FormGroup>
                <Label htmlFor="project_name">Project Name *</Label>
                <Input
                  type="text"
                  id="project_name"
                  name="project_name"
                  value={formData.project_name}
                  onChange={handleInputChange}
                  placeholder="Enter your project name"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="website_type">Website Type</Label>
                <Select
                  id="website_type"
                  name="website_type"
                  value={formData.website_type}
                  onChange={handleInputChange}
                >
                  {websiteTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="description">Description</Label>
                <TextArea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief description of your project"
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="requirements">Requirements & Features</Label>
                <TextArea
                  id="requirements"
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleInputChange}
                  placeholder="List any specific requirements, features, or functionality you need"
                />
              </FormGroup>

              <ButtonGroup>
                <Button
                  type="submit"
                  disabled={saving}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {saving ? (
                    <>
                      <Loader size={20} className="pulse-animation" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      {project ? 'Update Project' : 'Save Project'}
                    </>
                  )}
                </Button>

                {project && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => navigate(`/project/${project.id}`)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Eye size={20} />
                    View Project
                  </Button>
                )}
              </ButtonGroup>
            </Form>

            {project && (
              <GenerationSection>
                <GenerationTitle>
                  <Sparkles size={24} />
                  Generate Website with AI
                </GenerationTitle>

                <PromptArea>
                  <FormGroup>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <Label htmlFor="prompt">Describe Your Website</Label>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={generateAutoPrompt}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Sparkles size={16} style={{ marginRight: '0.5rem' }} />
                        Auto-Generate Prompt
                      </Button>
                    </div>
                    <TextArea
                      id="prompt"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Click 'Auto-Generate Prompt' to create an intelligent prompt based on your project details, or write your own custom description..."
                      style={{ minHeight: '200px' }}
                    />
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      fontSize: '0.85rem', 
                      color: '#666', 
                      marginTop: '0.5rem' 
                    }}>
                      <span>💡 Tip: The auto-generated prompt includes your project details, website type, and best practices. You can edit it to add specific requirements, colors, or features.</span>
                      <button
                        type="button"
                        onClick={() => {
                          const examples = {
                            business: "Create a modern business website for a tech startup with a dark blue theme, hero section with animated background, services grid, team profiles, client testimonials, and contact form. Include smooth scrolling and 3D card effects.",
                            portfolio: "Design a creative portfolio website for a graphic designer with a dark theme, animated hero section, project gallery with hover effects, about section, skills showcase, and contact form. Use vibrant accent colors.",
                            restaurant: "Build a restaurant website with warm colors, hero section with food images, menu with categories, reservation system, location map, chef's story, and customer reviews. Include appetizing food photography."
                          };
                          setPrompt(examples[formData.website_type] || examples.business);
                        }}
                        style={{
                          background: 'none',
                          border: '1px solid #667eea',
                          borderRadius: '6px',
                          color: '#667eea',
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          marginLeft: '1rem'
                        }}
                      >
                        See Example
                      </button>
                    </div>
                  </FormGroup>
                </PromptArea>

                <GenerateButton
                  onClick={handleGenerateWebsite}
                  disabled={generating || !prompt.trim()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {generating ? (
                    <>
                      <Loader size={24} className="pulse-animation" />
                      Generating Website...
                    </>
                  ) : (
                    <>
                      <Sparkles size={24} />
                      Generate Website
                    </>
                  )}
                </GenerateButton>
              </GenerationSection>
            )}
          </BuilderCard>
        </BuilderContent>
      </BuilderContainer>

      {generating && (
        <LoadingOverlay>
          <LoadingCard>
            <LoadingTitle>AI is crafting your website...</LoadingTitle>
            <LoadingText>
              This may take 30-60 seconds. We're creating a professional, 
              responsive website based on your requirements.
            </LoadingText>
            <div className="pulse-animation" style={{ 
              width: '60px', 
              height: '60px', 
              background: 'linear-gradient(145deg, #667eea, #764ba2)',
              borderRadius: '50%',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={30} color="white" />
            </div>
          </LoadingCard>
        </LoadingOverlay>
      )}
    </>
  );
};

export default WebsiteBuilder;