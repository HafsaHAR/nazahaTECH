import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Créer une soumission dédiée à un défi
export const createChallengeSubmissionApi = async (challengeId, payload) => {
  const response = await API.post(`/challenges/${challengeId}/submissions`, payload);
  return response.data;
};

// Obtenir toutes les soumissions d'un défi (Admin)
export const getChallengeSubmissionsApi = async (challengeId) => {
  const response = await API.get(`/challenges/${challengeId}/submissions`);
  return response.data;
};

// Obtenir l'historique des soumissions de l'utilisateur connecté
export const getUserChallengeSubmissionsApi = async () => {
  const response = await API.get('/challenge-submissions/my');
  return response.data;
};

// Mettre à jour le statut / évaluation d'une soumission (Admin)
export const updateChallengeSubmissionStatusApi = async (id, payload) => {
  const response = await API.put(`/challenge-submissions/${id}/status`, payload);
  return response.data;
};

// Supprimer une soumission au défi
export const deleteChallengeSubmissionApi = async (id) => {
  const response = await API.delete(`/challenge-submissions/${id}`);
  return response.data;
};
