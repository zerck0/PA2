# GUIDE DE PRÉPARATION À LA SOUTENANCE DOCKER

**Auteur :** Tom Georgin  
**Projet :** PA2 ESGI 2024-2025  
**Date :** Juin 2025

---

## COMPRENDRE VOTRE ARCHITECTURE DOCKER

### Qu'est-ce que vous avez fait ?

Vous avez **conteneurisé** votre application EcoDeli en divisant chaque partie en **conteneurs indépendants** :

1. **ecodeli-db** : Base de données PostgreSQL
2. **ecodeli-backend** : API Spring Boot 
3. **ecodeli-frontoffice** : Interface utilisateur React
4. **ecodeli-backoffice** : Interface admin React

### Pourquoi c'est génial ?

**Avant Docker :**
- Installation complexe (Java, Node.js, PostgreSQL)
- Configurations différentes sur chaque machine
- Problèmes de compatibilité
- 7-8 étapes de déploiement

**Avec Docker :**
- Une seule commande : `docker compose up`
- Même environnement partout
- Isolation complète des services
- Déploiement simplifié

---

## COMMENT ÇA FONCTIONNE TECHNIQUEMENT

### Le principe des conteneurs

**Analogie simple :** Un conteneur Docker = un appartement meublé
- Chaque service a son "appartement" (conteneur)
- Tout est inclus (code, dépendances, runtime)
- Les appartements peuvent communiquer entre eux
- Si un "appartement" a un problème, les autres continuent

### Vos 4 services en détail

**1. ecodeli-db (PostgreSQL)**
- **Rôle :** Stockage de toutes vos données
- **Image :** postgres:15-alpine (version légère)
- **Port :** 5432
- **Volume :** Données persistantes même si le conteneur redémarre

**2. ecodeli-backend (Spring Boot)**
- **Rôle :** API REST, logique métier
- **Image :** Java 21 + votre code compilé
- **Port :** 8080
- **Build multi-étapes :** Compilation + Exécution séparées

**3. ecodeli-frontoffice (React)**
- **Rôle :** Interface utilisateur
- **Image :** Nginx + fichiers React compilés
- **Port :** 3000
- **Build multi-étapes :** NPM build + Serveur web

**4. ecodeli-backoffice (React)**
- **Rôle :** Interface administration
- **Image :** Nginx + fichiers React compilés
- **Port :** 3001
- **Build multi-étapes :** NPM build + Serveur web

### Communication entre services

```
Utilisateur → Frontend (React) → Backend (Spring Boot) → Database (PostgreSQL)
     ↓              ↓                    ↓                     ↓
   Port 3000    Port 3000          Port 8080           Port 5432
```

Les services se parlent par **nom** grâce au réseau Docker :
- Frontend appelle `http://ecodeli-backend:8080`
- Backend appelle `ecodeli-db:5432`

---

## BUILDS MULTI-ÉTAPES EXPLIQUÉS

### Pourquoi c'est important ?

**Problème :** Si on met tout dans un conteneur, il devient énorme (1-2 GB)
**Solution :** Séparer compilation et exécution

### Exemple Backend (Spring Boot)

**ÉTAPE 1 - BUILD :**
```dockerfile
FROM eclipse-temurin:21-jdk AS build
# Installation Maven
# Copie du code source
# Compilation : mvn clean package
# Résultat : fichier .jar
```

**ÉTAPE 2 - RUNTIME :**
```dockerfile
FROM eclipse-temurin:21-jre AS runtime
# Copie UNIQUEMENT du .jar depuis l'étape build
# Pas de code source, pas de Maven
# Image finale 3x plus petite
```

### Exemple Frontend (React)

**ÉTAPE 1 - BUILD :**
```dockerfile
FROM node:20-alpine AS build
# Installation des dépendances npm
# Compilation TypeScript + bundling Vite
# Résultat : dossier dist/ avec fichiers statiques
```

**ÉTAPE 2 - RUNTIME :**
```dockerfile
FROM nginx:alpine AS runtime
# Copie UNIQUEMENT des fichiers dist/
# Serveur web Nginx
# Pas de Node.js, pas de code source
```

**Avantage :** Images finales 70% plus légères !

---

## DOCKER COMPOSE ORCHESTRATION

### Qu'est-ce que Docker Compose ?

**Définition :** Outil pour gérer plusieurs conteneurs ensemble

**Votre fichier docker-compose.dev.yml fait :**
1. Démarre PostgreSQL en premier
2. Attend que la DB soit prête (health check)
3. Démarre le backend (dépend de la DB)
4. Démarre les frontends (dépendent du backend)
5. Crée un réseau pour qu'ils se parlent
6. Monte des volumes pour la persistance

### Différence Dev vs Prod

**docker-compose.dev.yml :**
- Hot reload activé
- Base de données exposée
- Logs détaillés
- Volumes de code montés

**docker-compose.prod.yml :**
- Images optimisées
- Sécurité renforcée
- Utilisateurs non-root
- Limitations de ressources

---

## PLAN DE PRÉSENTATION (10 MINUTES)

### 1. Introduction (1 minute)
"J'ai conteneurisé mon projet EcoDeli pour simplifier le déploiement et standardiser les environnements."

### 2. Architecture générale (2 minutes)
- Montrer le diagramme Mermaid
- Expliquer les 4 services
- Souligner les avantages vs installation classique

### 3. Technologies utilisées (2 minutes)
- PostgreSQL pour la persistance
- Spring Boot pour l'API
- React pour les interfaces
- Docker pour la conteneurisation

### 4. Builds multi-étapes (2 minutes)
- Expliquer le concept
- Montrer un exemple concret
- Mentionner l'optimisation de taille

### 5. Orchestration Docker Compose (2 minutes)
- Dev vs Production
- Gestion des dépendances
- Réseaux et volumes

### 6. Démonstration (1 minute)
- Lancer `./start-docker.sh`
- Montrer les services qui démarrent
- Accéder aux URLs

---

## DÉMONSTRATION PRATIQUE

### Scénario de démonstration

**1. Préparation :**
```bash
# Vérifier que Docker fonctionne
docker --version

# Se placer dans le projet
cd PA2
```

**2. Lancement :**
```bash
# Méthode script (recommandée)
./start-docker.sh
# Choisir option 1 (Développement)

# OU méthode directe
docker compose -f docker-compose.dev.yml up -d
```

**3. Vérification :**
```bash
# Voir le statut
docker compose -f docker-compose.dev.yml ps

# Tester les URLs
curl http://localhost:8080/actuator/health
```

**4. Présentation des résultats :**
- Ouvrir http://localhost:3000 (Frontend)
- Ouvrir http://localhost:3001 (Backoffice)
- Montrer http://localhost:8080 (API)

### Points de vigilance

- **Temps de démarrage :** 30-60 secondes
- **Ports libres :** Vérifier 3000, 3001, 8080, 5432
- **Ressources :** ~1.5GB RAM nécessaire
- **Logs :** En cas d'erreur, `docker compose logs`

---

## QUESTIONS/RÉPONSES PROBABLES

### Questions techniques

**Q: Pourquoi Docker plutôt qu'une installation classique ?**
R: Docker garantit la reproductibilité. Même environnement partout, pas de problèmes de dépendances, déploiement simplifié.

**Q: Pourquoi 4 conteneurs et pas un seul ?**
R: Séparation des responsabilités. Chaque service peut évoluer indépendamment, scalabilité, maintenance facilitée.

**Q: Qu'est-ce qu'un build multi-étapes ?**
R: Séparer compilation et exécution. Images finales plus légères, sécurité renforcée, pas d'outils de dev en production.

**Q: Comment les services communiquent ?**
R: Réseau Docker interne. Les services se découvrent par nom DNS automatiquement.

**Q: Et la persistance des données ?**
R: Volumes Docker. Les données PostgreSQL persistent même si le conteneur redémarre.

### Questions business

**Q: Quels sont les avantages pour l'entreprise ?**
R: Réduction du time-to-market, diminution des coûts opérationnels, facilité de scalabilité, standardisation des environnements.

**Q: Et la sécurité ?**
R: Isolation des services, utilisateurs non-root, images minimales, gestion sécurisée des secrets.

**Q: Facilité de maintenance ?**
R: Chaque équipe peut se concentrer sur son service, déploiements sans risque, rollback facile.

---

## ARGUMENTS CLÉS À RETENIR

### Avantages techniques
- **Reproductibilité :** Même environnement partout
- **Isolation :** Pas de conflits entre services
- **Optimisation :** Images 70% plus légères
- **Simplicité :** Une commande pour tout démarrer

### Avantages business
- **Productivité :** Onboarding développeur instantané
- **Fiabilité :** Moins d'incidents de déploiement
- **Agilité :** Évolution indépendante des services
- **Coûts :** Réduction des temps de déploiement

### Points différenciants
- **Architecture microservices** bien pensée
- **Builds multi-étapes** optimisés
- **Deux environnements** (dev/prod)
- **Documentation complète** et professionnelle

---

## CONSEILS POUR LA PRÉSENTATION

### Posture et attitude
- **Confiant :** Vous maîtrisez votre sujet
- **Pédagogue :** Expliquez simplement
- **Passionné :** Montrez l'intérêt de votre solution

### Vocabulaire professionnel
- "Conteneurisation" plutôt que "dockerisation"
- "Orchestration" pour Docker Compose
- "Isolation" plutôt que "séparation"
- "Reproductibilité" plutôt que "ça marche partout"

### Gestion des imprévus
- **Problème réseau :** Avoir des captures d'écran
- **Erreur de démo :** Prévoir `docker compose logs`
- **Question difficile :** "C'est une excellente question, laissez-moi détailler..."

### Points à éviter
- Trop de détails techniques
- Jargon trop complexe
- Critique d'autres solutions
- Stress visible si problème

---

## CHECKLIST AVANT SOUTENANCE

### Préparation technique
- [ ] Docker fonctionne sur votre machine
- [ ] Tous les ports sont libres (3000, 3001, 8080, 5432)
- [ ] Le script `./start-docker.sh` fonctionne
- [ ] Les 4 services démarrent correctement
- [ ] Les URLs sont accessibles

### Préparation présentation
- [ ] Document d'architecture imprimé
- [ ] Diagramme bien visible
- [ ] Plan de présentation mémorisé
- [ ] Réponses aux questions probables préparées
- [ ] Timing respecté (10 minutes)

### Matériel
- [ ] Ordinateur chargé
- [ ] Connexion internet stable
- [ ] Écran/projecteur testé
- [ ] Documents de sauvegarde (PDF)

---

## CONCLUSION

Vous avez créé une architecture Docker complète et professionnelle qui :
- **Simplifie le déploiement** de 7 étapes à 1 commande
- **Standardise les environnements** pour toute l'équipe
- **Optimise les performances** avec des builds multi-étapes
- **Facilite la maintenance** avec une architecture microservices

**Message clé pour le jury :** "J'ai transformé un déploiement complexe en une opération simple et fiable grâce à Docker."

Vous êtes prêt pour réussir votre soutenance !
