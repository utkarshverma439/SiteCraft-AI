import React, { useState } from 'react';
import axios from 'axios';

const DebugAPI = () => {
  const [results, setResults] = useState({});
  const [token, setToken] = useState(null);

  const testLogin = async () => {
    try {
      console.log('Testing login...');
      const response = await axios.post('/api/auth/login', {
        email: 'testapi@test.com',
        password: 'test123'
      });
      
      console.log('Login response:', response);
      setToken(response.data.access_token);
      setResults(prev => ({
        ...prev,
        login: { success: true, data: response.data }
      }));
    } catch (error) {
      console.error('Login error:', error);
      setResults(prev => ({
        ...prev,
        login: { success: false, error: error.message, details: error.response?.data }
      }));
    }
  };

  const testProjects = async () => {
    if (!token) {
      setResults(prev => ({
        ...prev,
        projects: { success: false, error: 'No token available' }
      }));
      return;
    }

    try {
      console.log('Testing projects with token:', token.substring(0, 20) + '...');
      const response = await axios.get('/api/projects/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Projects response:', response);
      setResults(prev => ({
        ...prev,
        projects: { success: true, data: response.data }
      }));
    } catch (error) {
      console.error('Projects error:', error);
      setResults(prev => ({
        ...prev,
        projects: { success: false, error: error.message, details: error.response?.data }
      }));
    }
  };

  const testCreateProject = async () => {
    if (!token) {
      setResults(prev => ({
        ...prev,
        create: { success: false, error: 'No token available' }
      }));
      return;
    }

    try {
      console.log('Testing create project...');
      const response = await axios.post('/api/projects/', {
        project_name: 'React Debug Test',
        description: 'Test from React debug component',
        website_type: 'business',
        requirements: 'Simple test'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Create project response:', response);
      setResults(prev => ({
        ...prev,
        create: { success: true, data: response.data }
      }));
    } catch (error) {
      console.error('Create project error:', error);
      setResults(prev => ({
        ...prev,
        create: { success: false, error: error.message, details: error.response?.data }
      }));
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>API Debug Component</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={testLogin} style={{ marginRight: '10px' }}>
          Test Login
        </button>
        <button onClick={testProjects} style={{ marginRight: '10px' }}>
          Test Get Projects
        </button>
        <button onClick={testCreateProject}>
          Test Create Project
        </button>
      </div>

      <div>
        <h3>Results:</h3>
        <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
          {JSON.stringify(results, null, 2)}
        </pre>
      </div>

      {token && (
        <div>
          <h3>Current Token:</h3>
          <p style={{ wordBreak: 'break-all', background: '#f0f0f0', padding: '5px' }}>
            {token.substring(0, 50)}...
          </p>
        </div>
      )}
    </div>
  );
};

export default DebugAPI;