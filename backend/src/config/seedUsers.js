const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

dotenv.config();

const runSeedIfEmpty = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log(`ℹ️ La base de données contient déjà ${userCount} utilisateurs. Seeding d'utilisateurs ignoré.`);
      return;
    }

    console.log('Création des comptes administrateur et utilisateurs de démonstration...');
    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash('Password123!', salt);

    const initialUsers = [
      {
        name: 'Administrateur INPPLC',
        firstName: 'Administrateur',
        lastName: 'INPPLC',
        email: 'admin@nazahatech.ma',
        password: defaultPasswordHash,
        role: 'admin',
        phoneNumber: '0661000000',
        organization: 'INPPLC Siège Rabat'
      },
      {
        name: 'Hafsa Benali',
        firstName: 'Hafsa',
        lastName: 'Benali',
        email: 'hafsa@nazahatech.ma',
        password: defaultPasswordHash,
        role: 'user',
        phoneNumber: '0661234567',
        organization: 'Citoyenne Engagée'
      },
      {
        name: 'Karim Tazi',
        firstName: 'Karim',
        lastName: 'Tazi',
        email: 'karim@nazahatech.ma',
        password: defaultPasswordHash,
        role: 'user',
        phoneNumber: '0669876543',
        organization: 'Développeur Open Data'
      }
    ];

    await User.insertMany(initialUsers);
    console.log(`✅ Seeding d'utilisateurs réussi : ${initialUsers.length} comptes insérés avec succès.`);
  } catch (error) {
    console.error('❌ Erreur lors du seeding des utilisateurs :', error.message);
  }
};

module.exports = { runSeedIfEmpty };
