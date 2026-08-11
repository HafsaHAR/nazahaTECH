import API from './authApi';

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
