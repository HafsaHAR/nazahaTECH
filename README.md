# 🇲🇦 NazahaTECH — Hub d'Innovation pour la Probité & la Lutte contre la Corruption (INPPLC)

> **NazahaTECH** est la plateforme web participative et d'innovation ouverte développée pour l'**Instance Nationale de la Probité, de la Prévention et de la Lutte contre la Corruption (INPPLC)**.  
> Elle permet de mobiliser les citoyens et les innovateurs autour de la co-création de solutions numériques d'intégrité, tout en centralisant la base documentaire officielle et l'annuaire des initiatives d'éthique publique.

---

## 🌟 Fonctionnalités Clés

1. **🌐 Expérience Visiteur / Publique** :
   - Navigation libre sans inscription préalable pour découvrir les parcours d'innovation (*Prévention, Transparence, Digital, Éducation*).
   - Sélecteur de langue dynamique (**FR / EN / AR** avec prise en charge intégrale du mode **RTL** pour l'arabe).
   - Gestionnaire de thème visuel (**Mode Sombre / Mode Clair**).
   - Modal d'invitation à la connexion (`AuthPromptModal`) pour protéger les actions restreintes.

2. **📚 Bibliothèque & Base Documentaire INPPLC (`/library`)** :
   - Consultation et téléchargement des lois, guides méthodologiques, normes (ISO 37001) et rapports.
   - **Espace Admin** : Téléversement local de fichiers réels (`PDF, DOCX, XLSX`) avec détection automatique de la taille et du format.

3. **📋 Annuaire des Initiatives Innovantes (`/initiatives`)** :
   - Répertoire national et international recensant les projets de probité (*Chikaya.ma, OCDS Marchés Publics, Clubs Citoyens Scolaires*).
   - Filtres par domaine, niveau de maturité (*Deployed, POC, Idea*) et ville/pays.

4. **🎯 Défis d'Innovation & Isolation des Soumissions (`/challenges`)** :
   - Organisation de hackathons et défis ciblés.
   - **Isolation Absolue** : Les idées soumises à un défi spécifique sont isolées de la galerie d'idées citoyennes générales.
   - **Espace Participant** : Historique des candidatures sous l'onglet `🎯 Mes Soumissions aux Défis`.
   - **Console Admin** : Gestion des dossiers de candidatures directement sur la fiche du défi (`/challenges/:id`).

5. **📎 Pièces Jointes & Illustrations des Idées (`/submit-idea`)** :
   - Sélecteur multi-fichiers pour joindre des visuels (**JPG, PNG, WEBP**) et documents (**PDF, DOCX, XLSX**).
   - Galerie de visualisation avec téléchargement direct sur la fiche de l'idée (`/ideas/:id`).

---

## 🛠️ Stack Technique

- **Frontend** : React, Vite, Single Page Application (SPA), React Router DOM, Context API, Vanilla CSS.
- **Backend** : Node.js, Express.js, API RESTful.
- **Base de données** : MongoDB, Mongoose ODM.
- **Sécurité & Authentification** : JWT (JSON Web Tokens), Bcrypt, Contrôle d'accès basé sur les rôles (RBAC).
- **Stockage Fichiers** : Multer (stockage local sécurisé).
- **Conteneurisation & Déploiement** : Docker, Docker-Compose, Nginx, Mongo-Express.

---

## 🚀 Guide de Démarrage Rapide (Déploiement Docker)

### Prérequis
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installé et démarré sur la machine.

### Lancement de la plateforme en une seule commande

À la racine du projet (`nazahatech`), exécutez :

```bash
docker-compose up --build --remove-orphans -d
```

### URLs d'accès aux services :

| Service | URL | Description |
| :--- | :--- | :--- |
| 🌐 **Application Web Frontend** | `http://localhost:3000` | Interface utilisateur & Admin |
| ⚙️ **Serveur Backend Express** | `http://localhost:5000` | API REST & Téléversements |
| 🗄️ **Base de données MongoDB** | `localhost:27017` | Instance MongoDB |
| 📊 **Admin BDD Mongo Express** | `http://localhost:8081` | Interface Web de gestion BDD |

---

## 🔑 Comptes de Démonstration Seédés

- **Administrateur INPPLC** : `admin@nazahatech.ma` / `Admin123!`
- **Participant Citoyen 1** : `hafsa@nazahatech.ma` / `User123!`
- **Participant Citoyen 2** : `youssef@nazahatech.ma` / `User123!`

---

## 📁 Structure du Projet

```text
nazahatech/
├── backend/
│   ├── src/
│   │   ├── config/          # Connexion BDD & Seeding initial
│   │   ├── controllers/     # Logique métier (Auth, Ideas, Documents, Initiatives, Challenges)
│   │   ├── middlewares/     # Auth JWT, RBAC & Multer Upload
│   │   ├── models/          # Schémas Mongoose
│   │   └── routes/          # Endpoints Express
│   └── uploads/             # Stockage des fichiers téléversés
├── frontend/
│   ├── src/
│   │   ├── api/             # Appels API Axios & Fetch
│   │   ├── components/      # Composants réutilisables (Topbar, Navbar, LanguageDropdown, Modals)
│   │   ├── context/         # AuthContext, ThemeContext, LanguageContext
│   │   └── pages/           # Pages de l'application
│   └── Dockerfile           # Build Nginx multi-stage
├── docker-compose.yml       # Configuration de l'orchestration Docker
└── README.md                # Documentation principale du projet
```
