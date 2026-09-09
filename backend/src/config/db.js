const mongoose = require('mongoose');

const connectDB = async (retries = 10, delay = 3000) => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nazahatech';

  for (let i = 1; i <= retries; i++) {
    try {
      const conn = await mongoose.connect(uri);
      console.log(`✅ MongoDB Connecté : ${conn.connection.host}`);
      return;
    } catch (error) {
      console.error(`⏳ [Tentative ${i}/${retries}] Erreur connexion MongoDB (${error.message}). Re-tentative dans ${delay / 1000}s...`);
      if (i === retries) {
        console.error('❌ Échec critique de connexion à MongoDB après plusieurs tentatives.');
        process.exit(1);
      }
      await new Promise((res) => setTimeout(res, delay));
    }
  }
};

module.exports = connectDB;
