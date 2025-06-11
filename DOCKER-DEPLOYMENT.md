# Guide de Déploiement Docker - EcoDeli

## 📋 Prérequis

- Docker Engine 20.10+
- Docker Compose 2.0+
- Git

## 🚀 Déploiement Rapide

### Environnement de Développement

```bash
# 1. Cloner le projet
git clone [URL_DU_REPO]
cd PA2

# 2. Configurer les variables d'environnement
cp .env.example .env
# Modifier .env avec vos valeurs

# 3. Démarrer tous les services
docker-compose -f docker-compose.dev.yml up -d

# 4. Vérifier le statut
docker-compose -f docker-compose.dev.yml ps
```

### Environnement de Production

```bash
# 1. Configurer les variables d'environnement pour la production
cp .env.example .env
# Modifier .env avec les valeurs de production

# 2. Démarrer en mode production
docker-compose -f docker-compose.prod.yml up -d

# 3. Vérifier le statut
docker-compose -f docker-compose.prod.yml ps
```

## 🌐 Accès aux Services

### Développement
- **Frontend Frontoffice** : http://localhost:3000
- **Frontend Backoffice** : http://localhost:3001
- **Backend API** : http://localhost:8080
- **Base de données** : localhost:5433

### Production
- **Frontend Frontoffice** : http://localhost:3000
- **Frontend Backoffice** : http://localhost:3001
- **Backend API** : http://localhost:8080

## 📦 Utilisation du Registre Docker Hub

### Configuration des identifiants Docker Hub

```bash
# Se connecter à Docker Hub
docker login
# Entrer votre nom d'utilisateur : zercko
# Entrer votre mot de passe Docker Hub
```

### Construction et envoi des images vers le registre

```bash
# Construire et taguer l'image backend
docker build -t zercko/ecodeli-backend:1.0 --target production ./backend

# Construire et taguer l'image frontoffice
docker build -t zercko/ecodeli-frontoffice:1.0 --target production ./frontend/ecodeli-frontoffice

# Construire et taguer l'image backoffice
docker build -t zercko/ecodeli-backoffice:1.0 --target production ./frontend/ecodeli-backoffice

# Envoyer les images vers Docker Hub
docker push zercko/ecodeli-backend:1.0
docker push zercko/ecodeli-frontoffice:1.0
docker push zercko/ecodeli-backoffice:1.0
```

### Récupération des images depuis le registre

```bash
# Récupérer les images depuis Docker Hub
docker pull zercko/ecodeli-backend:1.0
docker pull zercko/ecodeli-frontoffice:1.0
docker pull zercko/ecodeli-backoffice:1.0

# Démarrer en production avec les images du registre
docker-compose -f docker-compose.prod.yml up -d
```

## 🔧 Commandes Utiles

### Gestion des Services

```bash
# Démarrer les services
docker-compose -f docker-compose.dev.yml up -d

# Arrêter les services
docker-compose -f docker-compose.dev.yml down

# Redémarrer un service spécifique
docker-compose -f docker-compose.dev.yml restart ecodeli-backend

# Voir les logs
docker-compose -f docker-compose.dev.yml logs -f ecodeli-backend

# Construire et démarrer
docker-compose -f docker-compose.dev.yml up --build -d
```

### Monitoring et Debug

```bash
# Statut des services
docker-compose -f docker-compose.dev.yml ps

# Logs de tous les services
docker-compose -f docker-compose.dev.yml logs -f

# Logs d'un service spécifique
docker-compose -f docker-compose.dev.yml logs -f ecodeli-backend

# Accéder à un container
docker exec -it ecodeli-backend-dev bash
docker exec -it ecodeli-db-dev psql -U postgres -d ecodeli_db
```

### Construction des Images

```bash
# Construire toutes les images
docker-compose -f docker-compose.dev.yml build

# Construire une image spécifique
docker-compose -f docker-compose.dev.yml build ecodeli-backend

# Construire sans cache
docker-compose -f docker-compose.dev.yml build --no-cache
```

## 📝 Configuration des Variables d'Environnement

### Fichier .env Obligatoire

```bash
# Base de données
POSTGRES_DB=ecodeli_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=votre_mot_de_passe

# Backend
SPRING_DATASOURCE_PASSWORD=votre_mot_de_passe
JWT_SECRET=votre_cle_jwt_generee

# Email (optionnel)
SPRING_MAIL_USERNAME=votre_email@gmail.com
SPRING_MAIL_PASSWORD=votre_mot_de_passe_app
```

### Génération de la Clé JWT

```bash
# Générer une clé JWT sécurisée
openssl rand -base64 32
```

## 🔍 Vérification du Déploiement

### Health Checks

```bash
# Vérifier la santé des services
docker-compose -f docker-compose.dev.yml ps

# Test de l'API backend
curl http://localhost:8080/actuator/health

# Test de la base de données
docker exec ecodeli-db-dev pg_isready -U postgres
```

### Tests de Connectivité

```bash
# Test de l'API depuis le frontend
curl http://localhost:8080/api/utilisateurs

# Test de la base de données
docker exec -it ecodeli-db-dev psql -U postgres -d ecodeli_db -c "SELECT version();"
```

## 🛠️ Résolution de Problèmes

### Problèmes Courants

1. **Port déjà utilisé**
   ```bash
   # Vérifier les ports utilisés
   netstat -tulpn | grep :8080
   
   # Modifier les ports dans .env
   BACKEND_PORT=8081
   ```

2. **Problème de permissions**
   ```bash
   # Sur Linux/Mac, vérifier les permissions Docker
   sudo usermod -aG docker $USER
   ```

3. **Base de données non accessible**
   ```bash
   # Vérifier les logs PostgreSQL
   docker logs ecodeli-db-dev
   
   # Recréer le volume si nécessaire
   docker-compose -f docker-compose.dev.yml down -v
   ```

### Nettoyage

```bash
# Arrêter et supprimer tous les containers
docker-compose -f docker-compose.dev.yml down

# Supprimer les volumes (⚠️ Perte de données)
docker-compose -f docker-compose.dev.yml down -v

# Nettoyer les images non utilisées
docker image prune -f

# Nettoyage complet Docker
docker system prune -af
```

## 📊 Monitoring

### Logs Centralisés

```bash
# Suivre les logs en temps réel
docker-compose -f docker-compose.dev.yml logs -f

# Filtrer par service
docker-compose -f docker-compose.dev.yml logs -f ecodeli-backend
```

### Métriques des Containers

```bash
# Statistiques en temps réel
docker stats

# Usage des ressources par service
docker-compose -f docker-compose.dev.yml top
```

## 🔒 Sécurité

### Bonnes Pratiques Appliquées

- ✅ Utilisateurs non-root dans tous les containers
- ✅ Variables d'environnement pour les secrets
- ✅ Isolation réseau entre services
- ✅ Images basées sur Alpine (surface d'attaque réduite)
- ✅ Health checks pour tous les services

Cette documentation couvre les aspects essentiels pour déployer et gérer l'application EcoDeli avec Docker selon le cahier des charges du projet.
