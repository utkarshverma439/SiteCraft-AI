import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Direct connection for debugging
  timeout: 120000, // 2 minutes timeout for AI generation
});

// Add token to requests automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Project API functions
export const projectAPI = {
  // Get all projects
  getProjects: (page = 1, perPage = 10) => 
    api.get(`/projects/?page=${page}&per_page=${perPage}`),
  
  // Get single project
  getProject: (id) => 
    api.get(`/projects/${id}/`),
  
  // Create new project
  createProject: (projectData) => 
    api.post('/projects/', projectData),
  
  // Update project
  updateProject: (id, projectData) => 
    api.put(`/projects/${id}/`, projectData),
  
  // Delete project
  deleteProject: (id) => 
    api.delete(`/projects/${id}/`),
};

// AI Generation API functions
export const aiAPI = {
  // Generate website
  generateWebsite: (projectId, prompt) => 
    api.post('/ai/generate-website/', {
      project_id: projectId,
      prompt: prompt
    }),
  
  // Regenerate with modifications
  regenerateWebsite: (projectId, modifications) => 
    api.post('/ai/regenerate-website/', {
      project_id: projectId,
      modifications: modifications
    }),
  
  // Get generation history
  getGenerationHistory: (projectId) => 
    api.get(`/ai/generation-history/${projectId}/`),
};

// Auth API functions (using the same api instance)
export const authAPI = {
  login: (email, password) => 
    api.post('/auth/login/', { email, password }),
  
  register: (userData) => 
    api.post('/auth/register/', userData),
  
  getProfile: () => 
    api.get('/auth/profile/'),
  
  updateProfile: (profileData) => 
    api.put('/auth/profile/', profileData),
};

export default api;