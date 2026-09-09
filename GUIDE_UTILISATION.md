
# Guide d'Utilisation — Plateforme NazahaTECH
## INPPLC Innovation Hub

**Stagiaire :** HAROUAL Hafsa
**Encadrant :** RACHID Zakaria
**Organisation :** Instance Nationale de la Probité, de la Prévention et de la Lutte contre la Corruption
**Date :** Septembre 2026

---

## À propos de NazahaTECH

NazahaTECH est la plateforme d'innovation citoyenne de l'INPPLC. Elle permet aux citoyens, agents publics et partenaires de proposer des idées innovantes, de voter pour les meilleures propositions, de participer à des défis thématiques, et d'accéder à une bibliothèque de ressources sur la probité et la transparence au Maroc.

---

## PARTIE 0 — Démarrer la plateforme

Cette section explique comment lancer NazahaTECH sur votre machine.

### Prérequis

Avant de démarrer, assurez-vous que les éléments suivants sont installés sur votre ordinateur :

| Outil | Vérification |
|---|---|
| **Docker Desktop** | Ouvrez Docker Desktop — il doit être en cours d'exécution (icône verte) |
| **Git** | Facultatif — uniquement si vous clonez le projet |

> Si Docker Desktop n'est pas installé, téléchargez-le sur : https://www.docker.com/products/docker-desktop

---

### Étape 1 — Ouvrir un terminal

Ouvrez **PowerShell** ou **l'Invite de commandes** sur Windows.

Pour ouvrir PowerShell rapidement :
- Appuyez sur `Windows + R`
- Tapez `powershell`
- Appuyez sur `Entrée`

---

### Étape 2 — Se placer dans le dossier du projet

```powershell
cd C:\Users\LENOVO\Desktop\nazahatech
```

---

### Étape 3 — Lancer la plateforme

#### Première utilisation (construction complète)

La première fois, utilisez cette commande. Elle télécharge les images Docker et construit le projet :

```powershell
docker-compose up --build
```

> ⏳ Cette opération peut prendre **2 à 5 minutes** la première fois. Les fois suivantes, elle sera beaucoup plus rapide.

#### Utilisations suivantes (démarrage normal)

```powershell
docker-compose up
```

---

### Étape 4 — Vérifier que tout fonctionne

Attendez de voir ces messages dans le terminal :

```
✅ MongoDB Connecté
✅ Seeding réussi : 3 utilisateurs insérés en BDD
✅ Serveur NazahaTECH démarré sur http://localhost:5000
```

Ensuite, ouvrez votre navigateur et accédez à :

```
http://localhost:3000
```

La plateforme est prête à être utilisée.

---

### Accès aux services

| Service | Adresse | Description |
|---|---|---|
| **Plateforme web** | http://localhost:3000 | L'application principale |
| **API backend** | http://localhost:5000 | Réponses JSON de l'API |
| **Base de données (visuel)** | http://localhost:8081 | Interface Mongo Express (admin / pass) |

---

### Arrêter la plateforme

Pour arrêter proprement tous les services, appuyez sur `Ctrl + C` dans le terminal, puis tapez :

```powershell
docker-compose down
```

---

### Réinitialiser complètement (supprime toutes les données)

> ⚠️ Cette commande **supprime toutes les données** de la base (idées, utilisateurs, etc.). À utiliser uniquement si vous voulez repartir de zéro.

```powershell
docker-compose down -v
docker-compose up --build
```

---

### Résolution des problèmes courants

| Problème | Solution |
|---|---|
| La page ne s'affiche pas sur http://localhost:3000 | Attendez 30 secondes que les services démarrent, puis rafraîchissez |
| Erreur "port already in use" | Un autre programme utilise le port 3000 ou 5000. Fermez-le ou redémarrez Docker |
| Erreur de connexion MongoDB | Vérifiez que Docker Desktop est bien démarré (icône dans la barre des tâches) |
| Les idées n'apparaissent pas | Attendez que le seeding automatique se termine (voir les logs dans le terminal) |
| Conteneur "nazahatech-mongo" ne démarre pas | Un autre conteneur MongoDB tourne déjà. Tapez `docker ps` pour identifier et arrêter le conteneur conflictuel |

---

### Commandes utiles

```powershell
# Voir les conteneurs en cours d'exécution
docker ps

# Voir les logs du backend en temps réel
docker logs -f nazahatech-backend

# Voir les logs de la base de données
docker logs -f nazahatech-mongo

# Redémarrer uniquement le backend
docker-compose restart backend

# Reconstruire uniquement le backend après une modification
docker-compose up --build backend
```

---

## Profils utilisateurs

La plateforme distingue trois types d'utilisateurs :

| Profil | Description | Accès |
|---|---|---|
| **Visiteur** | Personne non inscrite | Consultation uniquement |
| **Utilisateur** | Citoyen inscrit | Soumettre, voter, commenter, participer |
| **Administrateur** | Agent INPPLC | Gestion complète de la plateforme |

---

## Comptes de démonstration

Ces comptes sont créés automatiquement au premier démarrage :

| Nom | Email | Mot de passe | Rôle |
|---|---|---|---|
| Administrateur INPPLC | admin@nazahatech.ma | Admin123! | Administrateur |
| Hafsa Benali | hafsa@nazahatech.ma | User123! | Utilisateur |
| Youssef Alami | youssef@nazahatech.ma | User123! | Utilisateur |

---

## PARTIE 1 — Accès en mode visiteur

Un visiteur peut consulter la plateforme sans créer de compte.

### Comment accéder en mode visiteur

1. Rendez-vous sur la page d'accueil `http://localhost:3000`
2. Cliquez sur le lien **« Continuer en tant que visiteur »** sous les boutons de connexion
3. Vous accédez à la galerie en lecture seule

### Ce que le visiteur peut faire

- ✅ Consulter la liste des idées citoyennes
- ✅ Lire le détail d'une idée
- ✅ Consulter les défis en cours
- ✅ Parcourir la bibliothèque documentaire
- ✅ Consulter l'annuaire des initiatives
- ❌ Soumettre une idée (connexion requise)
- ❌ Voter pour une idée (connexion requise)
- ❌ Laisser un commentaire (connexion requise)
- ❌ Participer à un défi (connexion requise)

> Lorsqu'un visiteur tente une action réservée aux membres, une fenêtre l'invite à se connecter ou créer un compte.

---

## PARTIE 2 — Créer un compte

### Étapes d'inscription

1. Depuis la page d'accueil, cliquez sur **« Créer un compte »**
2. Remplissez le formulaire :
   - **Prénom** — obligatoire
   - **Nom** — obligatoire
   - **Adresse email** — doit être unique sur la plateforme
   - **Mot de passe** — minimum 6 caractères
3. Cliquez sur **« S'inscrire »**
4. Vous êtes automatiquement connecté et redirigé vers le tableau de bord

> Le rôle attribué est automatiquement **Utilisateur**. Il n'est pas possible de s'inscrire en tant qu'administrateur.

---

## PARTIE 3 — Se connecter

### Étapes de connexion

1. Cliquez sur **« Se connecter »** depuis la page d'accueil ou la barre de navigation
2. Entrez votre **email** et votre **mot de passe**
3. Cliquez sur **« Connexion »**
4. Vous êtes redirigé vers le tableau de bord

### Session persistante

Votre session est conservée même si vous fermez et rouvrez votre navigateur. Vous n'avez pas besoin de vous reconnecter à chaque visite.

---

## PARTIE 4 — Tableau de bord

Après connexion, vous arrivez sur le **tableau de bord principal** qui présente :

- Un message de bienvenue personnalisé
- Les dernières idées citoyennes soumises
- Les défis actifs en cours
- Les chiffres clés de la plateforme (nombre d'idées, de participants, de défis)
- Un accès rapide aux fonctionnalités principales

La barre de navigation à gauche donne accès à toutes les sections :

| Lien | Section |
|---|---|
| 🏠 Tableau de bord | Page d'accueil après connexion |
| 💡 Idées | Galerie des idées citoyennes |
| 🏆 Défis | Défis thématiques |
| 📚 Bibliothèque | Ressources documentaires |
| 📋 Initiatives | Initiatives INPPLC |
| 👤 Profil | Mon espace personnel |

---

## PARTIE 5 — La galerie des idées

### Accéder à la galerie

Cliquez sur **« Idées »** dans le menu de navigation de gauche.

### Comprendre l'affichage

Chaque carte d'idée affiche :
- Le **titre** de l'idée
- La **catégorie** (Prévention, Transparence, Digital, Éducation)
- La **date** de soumission
- Le nom de l'**auteur**
- Le nombre de **votes**
- Le **statut** (En modération, Publiée)

### Filtrer et rechercher des idées

| Filtre | Options |
|---|---|
| **Onglets de statut** | Toutes les idées / Publiées / En modération (admin) |
| **Recherche** | Tapez un mot-clé pour chercher dans les titres et descriptions |
| **Catégorie** | Toutes / Prévention / Transparence / Digital / Éducation |
| **Tri** | Plus récentes / Plus populaires |

### Consulter le détail d'une idée

Cliquez sur une carte pour accéder à la page de détail qui affiche la description complète, les informations de l'auteur, le bouton de vote et la section des commentaires.

---

## PARTIE 6 — Soumettre une idée

> Cette action nécessite d'être connecté.

1. Dans la galerie des idées, cliquez sur **« + Nouvelle idée »**
2. Remplissez le formulaire :

| Champ | Description | Obligatoire |
|---|---|---|
| **Titre** | Nom court et clair de votre idée (min. 3 caractères) | Oui |
| **Catégorie** | Prévention / Transparence / Digital / Éducation | Oui |
| **Description** | Explication détaillée (min. 10 caractères) | Oui |
| **Pièce jointe** | Document ou image illustrant l'idée (PDF, image) | Non |

3. Cliquez sur **« Soumettre »**

### Après la soumission

- L'idée est enregistrée avec le statut **« En modération »**
- L'équipe INPPLC examine la proposition
- Si approuvée → statut **« Publiée »**, visible dans la galerie
- Si rejetée → archivée dans l'historique

> Les idées soumises par un administrateur sont publiées immédiatement.

---

## PARTIE 7 — Voter pour une idée

> Cette action nécessite d'être connecté.

1. Ouvrez la page de détail d'une idée
2. Cliquez sur le bouton **« 👍 Voter »**
3. Le compteur s'incrémente et le bouton devient vert

Pour retirer votre vote, cliquez à nouveau sur le même bouton.

> Chaque utilisateur ne peut voter qu'**une seule fois** par idée.

---

## PARTIE 8 — Commenter une idée

> Cette action nécessite d'être connecté.

1. Ouvrez la page de détail d'une idée
2. Faites défiler jusqu'à la section **« Commentaires »**
3. Saisissez votre commentaire et cliquez sur **« Publier »**

Vous pouvez supprimer vos propres commentaires à tout moment.

---

## PARTIE 9 — Les défis thématiques

1. Cliquez sur **« Défis »** dans le menu de navigation
2. Consultez la liste avec les statuts :
   - 🟢 **Actif** — participation ouverte
   - 🔴 **Clôturé** — participation terminée
   - ⚪ **Brouillon** — non encore publié
3. Cliquez sur un défi pour voir son détail
4. Si le défi est actif et que vous êtes connecté, cliquez sur **« Participer »** pour soumettre une proposition

---

## PARTIE 10 — Bibliothèque documentaire

1. Cliquez sur **« Bibliothèque »** dans le menu de navigation
2. Parcourez les documents disponibles (rapports, guides, textes législatifs)
3. Cliquez sur **« Télécharger »** ou **« Ouvrir »** pour accéder à un document

> Accessible aux visiteurs et membres sans restriction.

---

## PARTIE 11 — Initiatives INPPLC

1. Cliquez sur **« Initiatives »** dans le menu de navigation
2. Consultez la liste des initiatives officielles de l'INPPLC
3. Cliquez sur une initiative pour afficher sa description complète

---

## PARTIE 12 — Mon profil

1. Cliquez sur **« Profil »** dans le menu de navigation
2. La page affiche un résumé de votre activité :

| Section | Description |
|---|---|
| **Informations personnelles** | Prénom, nom, email, téléphone |
| **Mes idées** | Toutes vos idées soumises |
| **Mes commentaires** | Historique de vos commentaires |
| **Mes défis** | Vos participations aux défis |
| **Mes interactions** | Idées pour lesquelles vous avez voté |

Pour modifier vos informations, cliquez sur **« Modifier le profil »**, mettez à jour vos données et cliquez sur **« Enregistrer »**.

> L'adresse email ne peut pas être modifiée après l'inscription.

---

## PARTIE 13 — Espace administrateur

> Réservé aux comptes avec le rôle **Administrateur**.

Connectez-vous avec `admin@nazahatech.ma` / `Admin123!` pour accéder au tableau de bord d'administration.

### Modération des idées

Dans la section **« Idées »** du tableau de bord admin :

| Action | Effet |
|---|---|
| ✅ **Approuver** | L'idée devient visible dans la galerie |
| ❌ **Rejeter** | L'idée est archivée et supprimée de la galerie |

### Gestion des utilisateurs

- Consulter tous les comptes inscrits
- Supprimer un compte
- Changer le rôle d'un utilisateur (user ↔ admin)

### Gestion des défis

- Créer un nouveau défi (titre, description, dates, statut)
- Modifier ou clôturer un défi existant

### Gestion des documents

- Ajouter un document via upload (PDF, Word, image)
- Supprimer un document existant

---

## PARTIE 14 — Paramètres de l'interface

### Changer la langue

Cliquez sur l'icône 🌐 en haut de la barre de navigation.
Langues disponibles : 🇫🇷 Français · 🇬🇧 Anglais · 🇲🇦 Arabe

### Changer le thème

Cliquez sur l'icône ☀️ / 🌙 pour basculer entre le mode clair et le mode sombre.

---

## PARTIE 15 — Utilisation sur mobile

La plateforme est entièrement compatible avec les smartphones et tablettes.

- Sur mobile, le menu latéral est remplacé par un **bouton hamburger ☰** en haut de l'écran
- Les boutons sont adaptés au tactile (grande zone de clic)
- La galerie passe en vue colonne unique

---

## PARTIE 16 — Se déconnecter

1. Cliquez sur **« Déconnexion »** dans la barre de navigation
2. Vous êtes redirigé vers la page d'accueil

---

## Résumé des actions par profil

### Visiteur

| Action | Disponible |
|---|---|
| Consulter les idées, défis, bibliothèque, initiatives | ✅ |
| Soumettre une idée | ❌ |
| Voter / Commenter / Participer | ❌ |

### Utilisateur connecté

| Action | Disponible |
|---|---|
| Toutes les consultations | ✅ |
| Soumettre une idée | ✅ |
| Voter et retirer son vote | ✅ |
| Commenter et supprimer ses commentaires | ✅ |
| Participer à un défi | ✅ |
| Modifier son profil | ✅ |

### Administrateur

| Action | Disponible |
|---|---|
| Toutes les actions utilisateur | ✅ |
| Approuver / Rejeter les idées | ✅ |
| Gérer les utilisateurs | ✅ |
| Créer et gérer les défis | ✅ |
| Gérer la bibliothèque | ✅ |
| Statistiques globales | ✅ |

---

*Guide d'utilisation — NazahaTECH v2.5*
*INPPLC Innovation Hub — Septembre 2026*
*Développeuse : HAROUAL Hafsa | Encadrant : RACHID Zakaria*
