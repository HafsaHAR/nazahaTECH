import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const registerApi = async (userData) => {
  const response = await API.post('/auth/register', userData);
  return response.data;
};

export const loginApi = async (credentials) => {
  const response = await API.post('/auth/login', credentials);
  return response.data;
};

export const getMeApi = async () => {
  const response = await API.get('/auth/me');
  return response.data;
};

export const updateProfileApi = async (data) => {
  const response = await API.patch('/auth/profile', data);
  return response.data;
};

export const getActivitySummaryApi = async () => {
  const response = await API.get('/auth/activity/summary');
  return response.data;
};

export const getUserIdeasApi = async (params = {}) => {
  const response = await API.get('/users/me/ideas', { params });
  return response.data;
};

export const getUserCommentsApi = async (params = {}) => {
  const response = await API.get('/users/me/comments', { params });
  return response.data;
};

export const getUserChallengesApi = async (params = {}) => {
  const response = await API.get('/users/me/challenges', { params });
  return response.data;
};

export const getUserInteractionsApi = async (params = {}) => {
  const response = await API.get('/users/me/interactions', { params });
  return response.data;
};

export default API;
