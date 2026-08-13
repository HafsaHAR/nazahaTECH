const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getDocumentsApi = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  try {
    const res = await fetch(`${API_BASE_URL}/documents?${query}`);
    if (!res.ok) throw new Error('Erreur lors du chargement de la base documentaire');
    return res.json();
  } catch (err) {
    console.error('Erreur getDocumentsApi :', err);
    return { documents: [] };
  }
};

export const uploadDocumentFileApi = async (file) => {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('file', file);

  let res;
  try {
    res = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });
  } catch (netErr) {
    throw new Error('Impossible de contacter le serveur backend. Veuillez vous assurer que le serveur Node/Express (port 5000) est bien démarré.');
  }

  const contentType = res.headers.get('content-type') || '';

  if (!res.ok) {
    if (contentType.includes('application/json')) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Erreur lors du téléversement du fichier');
    } else {
      throw new Error(`Erreur serveur (HTTP ${res.status}). Le serveur backend Express n'est pas accessible.`);
    }
  }

  if (contentType.includes('application/json')) {
    return res.json();
  } else {
    throw new Error('Le serveur a renvoyé un format de réponse invalide.');
  }
};

export const createDocumentApi = async (docData) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/documents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(docData)
  });

  const contentType = res.headers.get('content-type') || '';

  if (!res.ok) {
    if (contentType.includes('application/json')) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Erreur lors de la création du document');
    } else {
      throw new Error(`Erreur HTTP ${res.status}`);
    }
  }

  return res.json();
};

export const deleteDocumentApi = async (id) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}/documents/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Erreur lors de la suppression du document');
    } else {
      throw new Error(`Erreur HTTP ${res.status}`);
    }
  }

  return res.json();
};
