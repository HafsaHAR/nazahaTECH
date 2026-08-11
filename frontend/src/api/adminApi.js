import API from './authApi';

/**
 * Récupérer les métriques et agrégations du tableau de bord d'administration
 */
export const getAdminMetricsApi = async () => {
  const response = await API.get('/admin/metrics');
  return response.data;
};

/**
 * Récupérer l'historique des idées rejetées (Admin uniquement)
 */
export const getRejectedHistoryApi = async () => {
  const response = await API.get('/admin/history');
  return response.data;
};

/**
 * Récupérer la liste des notifications de l'administrateur
 */
export const getAdminNotificationsApi = async () => {
  const response = await API.get('/notifications');
  return response.data;
};

/**
 * Marquer une notification comme lue
 */
export const markNotificationReadApi = async (id) => {
  const response = await API.patch(`/notifications/${id}/read`);
  return response.data;
};

/**
 * Marquer toutes les notifications comme lues
 */
export const markAllNotificationsReadApi = async () => {
  const response = await API.patch('/notifications/read-all');
  return response.data;
};

/**
 * Approuver une idée (Statut -> 'approved')
 */
export const approveIdeaApi = async (id) => {
  const response = await API.patch(`/ideas/${id}/approve`);
  return response.data;
};

/**
 * Rejeter une idée (Archivage dans l'historique admin + Suppression BDD utilisateur)
 */
export const rejectIdeaApi = async (id) => {
  const response = await API.patch(`/ideas/${id}/reject`);
  return response.data;
};

/**
 * Enregistrer une participation citoyenne à un défi
 */
export const createParticipationApi = async (payload) => {
  const response = await API.post('/participations', payload);
  return response.data;
};

/**
 * Approuver une participation (Admin)
 */
export const approveParticipationApi = async (id) => {
  const response = await API.patch(`/participations/${id}/approve`);
  return response.data;
};

/**
 * Rejeter une participation (Admin)
 */
export const rejectParticipationApi = async (id) => {
  const response = await API.patch(`/participations/${id}/reject`);
  return response.data;
};
