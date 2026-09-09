const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

dotenv.config();

const runSeedIfEmpty = async () => {
  try {
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash('Admin123!', salt);
    const userPasswordHash = await bcrypt.hash('User123!', salt);

    const adminExists = await User.findOne({ email: 'admin@nazahatech.ma' });
    if (!adminExists) {
      console.log('👑 Création du compte administrateur INPPLC...');
      await User.create({
        name: 'Administrateur INPPLC',
        firstName: 'Administrateur',
        lastName: 'INPPLC',
        email: 'admin@nazahatech.ma',
        password: adminPasswordHash,
        role: 'admin',
        phoneNumber: '0661000000',
        organization: 'INPPLC Siège Rabat'
      });
    }

    const userCount = await User.countDocuments();
    if (userCount > 1) {
      console.log(`ℹ️ La base de données contient déjà ${userCount} utilisateurs. Seeding supplémentaire ignoré.`);
      return;
    }

    console.log('Création des comptes utilisateurs de démonstration...');
    const initialUsers = [
      {
        name: 'Hafsa Benali',
        firstName: 'Hafsa',
        lastName: 'Benali',
        email: 'hafsa@nazahatech.ma',
        password: userPasswordHash,
        role: 'user',
        phoneNumber: '0661234567',
        organization: 'Citoyenne Engagée'
      },
      {
        name: 'Karim Tazi',
        firstName: 'Karim',
        lastName: 'Tazi',
        email: 'karim@nazahatech.ma',
        password: userPasswordHash,
        role: 'user',
        phoneNumber: '0669876543',
        organization: 'Développeur Open Data'
      }
    ];

    await User.insertMany(initialUsers);
    console.log(`✅ Seeding d'utilisateurs réussi : comptes de démonstration insérés avec succès.`);
  } catch (error) {
    console.error('❌ Erreur lors du seeding des utilisateurs :', error.message);
  }
};

module.exports = { runSeedIfEmpty };
