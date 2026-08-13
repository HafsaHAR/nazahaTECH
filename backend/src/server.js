const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const { runSeedIfEmpty } = require('./config/seedUsers');
const { runSeedChallengesIfEmpty } = require('./config/seedChallenges');
const { runSeedDocumentsIfEmpty } = require('./config/seedDocuments');
const { runSeedInitiativesIfEmpty } = require('./config/seedInitiatives');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const ideaRoutes = require('./routes/ideaRoutes');
const participationRoutes = require('./routes/participationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const commentRoutes = require('./routes/commentRoutes');
const challengeRoutes = require('./routes/challengeRoutes');
const documentRoutes = require('./routes/documentRoutes');
const initiativeRoutes = require('./routes/initiativeRoutes');

dotenv.config();

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:80',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  process.env.CORS_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    callback(null, true);
  },
  credentials: true
}));

app.use(express.json());

// Service de fichiers statiques pour les téléversements locaux
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Enregistrement des routes publiques et système de l'API NazahaTECH
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ideas', ideaRoutes);
app.use('/api/participations', participationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/initiatives', initiativeRoutes);

app.get('/', (req, res) => {
  res.send('API NazahaTECH v2.2 (Téléversement de fichiers de la Bibliothèque) opérationnelle');
});

// Middleware d'erreur global Express (garantit un retour JSON propre au lieu d'HTML)
app.use((err, req, res, next) => {
  console.error('Erreur serveur Express :', err.message);
  return res.status(err.status || 500).json({
    message: err.message || 'Une erreur est survenue sur le serveur.'
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await runSeedIfEmpty();
  await runSeedChallengesIfEmpty();
  await runSeedDocumentsIfEmpty();
  await runSeedInitiativesIfEmpty();
  app.listen(PORT, () => {
    console.log(`Serveur NazahaTECH démarré sur le port ${PORT}`);
  });
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;
