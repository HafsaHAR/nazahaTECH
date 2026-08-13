import API from './authApi';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Téléverser une pièce jointe (Image / Document) pour une idée
 */
export const uploadIdeaAttachmentApi = async (file) => {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/ideas/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: `Erreur HTTP ${res.status}` }));
    throw new Error(errorData.message || 'Erreur lors du téléversement de la pièce jointe');
  }

  return res.json();
};

/**
 * Soumettre une nouvelle idée à l'API backend (sauvegarde BDD)
 */
export const createIdeaApi = async (ideaData) => {
  const response = await API.post('/ideas', ideaData);
  return response.data;
};

/**
 * Récupérer la liste des idées avec filtres dynamiques (category, search, sort)
 */
export const getIdeasApi = async (params = {}) => {
  const response = await API.get('/ideas', { params });
  return response.data;
};

/**
 * Récupérer une idée spécifique par son ID
 */
export const getIdeaByIdApi = async (id) => {
  const response = await API.get(`/ideas/${id}`);
  return response.data;
};

/**
 * Voter pour une idée
 */
export const voteIdeaApi = async (id) => {
  const response = await API.post(`/ideas/${id}/vote`);
  return response.data;
};
