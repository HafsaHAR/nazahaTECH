import API from './authApi';

/**
 * Get nested comment tree for an idea with sorting (recent | popular)
 */
export const getCommentsApi = async (ideaId, sort = 'recent') => {
  const response = await API.get('/comments', {
    params: { ideaId, sort }
  });
  return response.data;
};

/**
 * Post a new root comment on an idea
 */
export const createCommentApi = async (payload) => {
  const response = await API.post('/comments', payload);
  return response.data;
};

/**
 * Post a nested reply to an existing comment
 */
export const replyToCommentApi = async (commentId, payload) => {
  const response = await API.post(`/comments/${commentId}/reply`, payload);
  return response.data;
};

/**
 * Toggle reaction (like / dislike) on a comment
 */
export const reactToCommentApi = async (commentId, type) => {
  const response = await API.post(`/comments/${commentId}/react`, { type });
  return response.data;
};

/**
 * Soft delete a comment (Admin Moderation)
 */
export const deleteCommentApi = async (commentId) => {
  const response = await API.delete(`/comments/${commentId}`);
  return response.data;
};
