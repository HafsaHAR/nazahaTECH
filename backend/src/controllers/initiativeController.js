const Initiative = require('../models/Initiative');

// GET /api/initiatives — Obtenir la liste des initiatives (Publique & Participants)
const getInitiatives = async (req, res) => {
  try {
    const { search, domain, country, maturityLevel } = req.query;
    let query = {};

    if (domain && domain !== 'Tous') {
      query.domain = domain;
    }

    if (country && country !== 'Tous') {
      query.country = country;
    }

    if (maturityLevel && maturityLevel !== 'Tous') {
      query.maturityLevel = maturityLevel;
    }

    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { organization: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const initiatives = await Initiative.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      count: initiatives.length,
      initiatives
    });
  } catch (error) {
    console.error('Erreur récupération initiatives :', error);
    return res.status(500).json({ message: 'Erreur lors du chargement de l\'annuaire des initiatives.' });
  }
};

// GET /api/initiatives/:id — Fiche détaillée d'une initiative (Publique & Participants)
const getInitiativeById = async (req, res) => {
  try {
    const initiative = await Initiative.findById(req.params.id);
    if (!initiative) {
      return res.status(404).json({ message: 'Initiative introuvable.' });
    }
    return res.status(200).json({ initiative });
  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la récupération de l\'initiative.' });
  }
};

// POST /api/initiatives — Créer une initiative (Réservé à l'Admin)
const createInitiative = async (req, res) => {
  try {
    const { title, organization, country, city, domain, description, maturityLevel, actorType, year, contactEmail, contactWebsite, tags } = req.body;

    if (!title || !organization || !description) {
      return res.status(400).json({ message: 'Le titre, l\'organisation et la description sont obligatoires.' });
    }

    const newInitiative = await Initiative.create({
      title,
      organization,
      country: country || 'Maroc',
      city: city || 'Rabat',
      domain: domain || 'Digital',
      description,
      maturityLevel: maturityLevel || 'Idea',
      actorType: actorType || 'Public',
      year: year || new Date().getFullYear(),
      contactEmail: contactEmail || 'contact@inpplc.ma',
      contactWebsite: contactWebsite || 'https://inpplc.ma',
      tags: tags || ['Digital', 'Transparence']
    });

    return res.status(201).json({
      message: 'Initiative ajoutée avec succès à l\'Annuaire.',
      initiative: newInitiative
    });
  } catch (error) {
    console.error('Erreur création initiative :', error);
    return res.status(500).json({ message: 'Erreur lors de la création de l\'initiative.' });
  }
};

// PUT /api/initiatives/:id — Modifier une initiative (Réservé à l'Admin)
const updateInitiative = async (req, res) => {
  try {
    const initiative = await Initiative.findById(req.params.id);
    if (!initiative) {
      return res.status(404).json({ message: 'Initiative introuvable.' });
    }

    const updated = await Initiative.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    return res.status(200).json({
      message: 'Initiative mise à jour avec succès.',
      initiative: updated
    });
  } catch (error) {
    console.error('Erreur modification initiative :', error);
    return res.status(500).json({ message: 'Erreur lors de la modification de l\'initiative.' });
  }
};

// DELETE /api/initiatives/:id — Supprimer une initiative (Réservé à l'Admin)
const deleteInitiative = async (req, res) => {
  try {
    const initiative = await Initiative.findById(req.params.id);
    if (!initiative) {
      return res.status(404).json({ message: 'Initiative introuvable.' });
    }

    await Initiative.findByIdAndDelete(req.params.id);

    return res.status(200).json({ message: 'Initiative supprimée de l\'Annuaire avec succès.' });
  } catch (error) {
    console.error('Erreur suppression initiative :', error);
    return res.status(500).json({ message: 'Erreur lors de la suppression de l\'initiative.' });
  }
};

module.exports = {
  getInitiatives,
  getInitiativeById,
  createInitiative,
  updateInitiative,
  deleteInitiative
};
