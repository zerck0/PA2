🌱 EcoDeli – Plateforme Web de services écoresponsables
Projet Annuel 2024-2025 – ESGI – Tom Georgin

🧾 Présentation
Application web complète de gestion de services logistiques :

Livraison de biens

Mise en relation client/prestataire

Gestion des commerçants

Location temporaire de box

Deux interfaces :

🎛️ Backoffice : administration interne

🧑‍💻 Frontoffice : espace utilisateurs (livreurs, clients…)

🧰 Technologies

Côté	Stack
Backend	Java 21, Spring Boot, JPA, PostgreSQL
Frontend	React + Vite, TypeScript, Bootstrap
Structure	Multi-applications dans un seul repo
📁 Arborescence projet
java
Copier
Modifier
PA2/
├── backend/         → API REST (Spring Boot)
├── backoffice/      → Admin React (Vite + TS)
└── frontoffice/     → Utilisateurs finaux (prévu)
🎛️ Backoffice (en place)
Fonctionnalités :

Tableau de bord d'administration

Liste & CRUD des livreurs

Liste globale des utilisateurs (avec rôle)

Formulaire d’ajout dynamique

Base pour gestion future des annonces

🚀 Lancement local
📌 Prérequis :
Java 21

Maven

Node.js (>= 18)

PostgreSQL

Git

▶️ Backend
bash
Copier
Modifier
cd backend
./mvnw spring-boot:run
Base PostgreSQL à créer : ecodeli

▶️ Backoffice
bash
Copier
Modifier
cd backoffice
npm install
npm run dev
Accessible sur http://localhost:5173

▶️ Frontoffice
📦 Création en cours
Sera accessible sur http://localhost:5174

🔜 Prochaines étapes
Authentification utilisateur (JWT)

Gestion des annonces

Espace personnel par rôle

Gestion des pièces justificatives

Facturation automatisée

👤 Auteur
Tom Georgin
Projet ESGI – PA2 – 2024/2025

