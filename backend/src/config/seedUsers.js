const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const User = require('../models/User');

dotenv.config();

const runSeedIfEmpty = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log(`ℹ️ La base de données contient déjà ${userCount} utilisateurs. Seeding ignoré.`);
      return;
    }

    console.log('Seeding des utilisateurs de test initiaux...');

    const hashedPasswordAdmin = await bcrypt.hash('Admin123!', 10);
    const hashedPasswordUser = await bcrypt.hash('User123!', 10);

    const testUsers = [
      {
        firstName: 'Administrateur',
        lastName: 'INPPLC',
        email: 'admin@nazahatech.ma',
        phoneNumber: '0600000000',
        password: hashedPasswordAdmin,
        role: 'admin'
      },
      {
        firstName: 'Hafsa',
        lastName: 'Benali',
        email: 'hafsa@nazahatech.ma',
        phoneNumber: '0661234567',
        password: hashedPasswordUser,
        role: 'user'
      },
      {
        firstName: 'Youssef',
        lastName: 'El Mansouri',
        email: 'youssef@nazahatech.ma',
        phoneNumber: '0669876543',
        password: hashedPasswordUser,
        role: 'user'
      }
    ];

    const inserted = await User.insertMany(testUsers);
    console.log(`✅ Seeding réussi : ${inserted.length} utilisateurs insérés en BDD.`);
  } catch (error) {
    console.error('❌ Erreur lors du seeding des utilisateurs :', error.message);
  }
};

// Si exécuté directement en CLI via `node src/config/seedUsers.js`
if (require.main === module) {
  mongoose
    .connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nazahatech')
    .then(async () => {
      // Force le re-seeding en CLI
      await User.deleteMany({});
      await runSeedIfEmpty();
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Erreur de connexion MongoDB :', err);
      process.exit(1);
    });
}

module.exports = { runSeedIfEmpty };
