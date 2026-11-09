import axios from 'axios';

const API_BASE = '/api';

// Auth APIs
export const authAPI = {
  register: (data) => axios.post(`${API_BASE}/auth/register`, data),
  login: (data) => axios.post(`${API_BASE}/auth/login`, data),
  me: () => axios.get(`${API_BASE}/auth/me`),
  updateProfile: (data) => axios.put(`${API_BASE}/auth/profile`, data),
  changePassword: (data) => axios.put(`${API_BASE}/auth/password`, data),
  deleteAccount: () => axios.delete(`${API_BASE}/auth/account`),
};

// Resume APIs
export const resumeAPI = {
  getAll: () => axios.get(`${API_BASE}/resumes`),
  getById: (id) => axios.get(`${API_BASE}/resumes/${id}`),
  create: (data) => axios.post(`${API_BASE}/resumes`, data),
  update: (id, data) => axios.put(`${API_BASE}/resumes/${id}`, data),
  delete: (id) => axios.delete(`${API_BASE}/resumes/${id}`),
  duplicate: (id) => axios.post(`${API_BASE}/resumes/${id}/duplicate`),
  parseUpload: (formData) => axios.post(`${API_BASE}/resumes/parse-upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// AI APIs
export const aiAPI = {
  improve: (data) => axios.post(`${API_BASE}/ai/improve`, data),
  analyze: (resumeId) => axios.post(`${API_BASE}/ai/analyze/${resumeId}`),
  matchJob: (data) => axios.post(`${API_BASE}/ai/match-job`, data),
  suggestSkills: (data) => axios.post(`${API_BASE}/ai/suggest-skills`, data),
};

export default { authAPI, resumeAPI, aiAPI };
