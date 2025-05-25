const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw { response: { data: error } };
  }
  return response.json();
};

// Authentication API
export const authAPI = {
  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email, password })
    });
    return handleResponse(response);
  },

  async register(name, email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, email, password })
    });
    return handleResponse(response);
  },

  async getMe() {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  async logout() {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Transcription API
export const transcriptionAPI = {
  async uploadAndTranscribe(audioFile) {
    const formData = new FormData();
    formData.append('audio', audioFile);

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/transcriptions`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: formData
    });
    return handleResponse(response);
  },

  async getTranscriptions() {
    const response = await fetch(`${API_BASE_URL}/transcriptions`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  async deleteTranscription(id) {
    const response = await fetch(`${API_BASE_URL}/transcriptions/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};
