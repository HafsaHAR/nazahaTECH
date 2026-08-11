import API from './authApi';

/**
 * Fetch filtered, sorted, and paginated challenges from backend
 */
export const getChallengesApi = async (params = {}) => {
  const response = await API.get('/challenges', { params });
  return response.data;
};

/**
 * Fetch single challenge details by ID
 */
export const getChallengeByIdApi = async (id) => {
  const response = await API.get(`/challenges/${id}`);
  return response.data;
};

/**
 * Toggle bookmark / save challenge for logged in user (Persisted in User.savedChallenges)
 */
export const toggleBookmarkApi = async (id) => {
  const response = await API.post(`/challenges/${id}/bookmark`);
  return response.data;
};

/**
 * Create a new challenge (Admin only)
 */
export const createChallengeApi = async (payload) => {
  const response = await API.post('/challenges', payload);
  return response.data;
};
