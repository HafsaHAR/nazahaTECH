const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getInitiativesApi = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE_URL}/initiatives?${query}`);
  if (!res.ok) throw new Error('Erreur lors du chargement de l\'annuaire des initiatives');
  return res.json();
};

export const getInitiativeByIdApi = async (id) => {
  const res = await fetch(`${API_BASE_URL}/initiatives/${id}`);
  if (!res.ok) throw new Error('Erreur lors de la récupération de l\'initiative');
  return res.json();
};

export const createInitiativeApi = async (initData) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/initiatives`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(initData)
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Erreur lors de la création de l\'initiative');
  }
  return res.json();
};

export const updateInitiativeApi = async (id, initData) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/initiatives/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(initData)
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Erreur lors de la modification de l\'initiative');
  }
  return res.json();
};

export const deleteInitiativeApi = async (id) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/initiatives/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Erreur lors de la suppression de l\'initiative');
  }
  return res.json();
};
