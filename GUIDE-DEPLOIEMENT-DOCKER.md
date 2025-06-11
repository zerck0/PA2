# GUIDE DE DÉPLOIEMENT DOCKER - ECODELI

**Auteur :** Tom Georgin  
**Projet :** PA2 ESGI 2024-2025  
**Date :** Juin 2025

---

## PRÉREQUIS SYSTÈME

### Logiciels requis

- **Docker** >= 24.0
- **Docker Compose** >= 2.0
- **Git** (pour cloner le projet)

### Vérification de l'installation

```bash
# Vérifier Docker
docker --version
docker compose version

# Vérifier l'état de Docker
docker info
```

---

## INSTALLATION ET CONFIGURATION

### 1. Préparation de l'environnement

```bash
# Cloner le projet (si nécessaire)
git clone <url-du-projet>
cd PA2

# Copier le fichier de configuration
cp .env.example .env
```

### 2. Configuration des variables d'environnement

Éditez le fichier `.env` et modifiez les valeurs suivantes :

```env
# OBLIGATOIRE : Changez le mot de passe PostgreSQL
POSTGRES_PASSWORD=votre_mot_de_passe_securise

# OBLIGATOIRE : Changez la clé JWT
JWT_SECRET=votre_cle_jwt_unique_et_complexe

# OPTIONNEL : Adaptez les ports si nécessaire
BACKEND_PORT=8080
FRONTOFFICE_PORT=3000
BACKOFFICE_PORT=3001
```

### 3. Création des répertoires de volumes

```bash
mkdir -p docker-volumes/postgres-logs
mkdir -p docker-volumes/backend-logs
```

---

## DÉPLOIEMENT

### Environnement de développement

```bash
# Démarrage des services
docker compose -f docker-compose.dev.yml up -d

# Vérification du statut
docker compose -f docker-compose.dev.yml ps

# Visualisation des logs
docker compose -f docker-compose.dev.yml logs -f
```

**URLs d'accès :**
- Frontend Frontoffice : http://localhost:3000
- Frontend Backoffice : http://localhost:3001
- API Backend : http://localhost:8080
- Base de données : localhost:5432

### Environnement de production

```bash
# Démarrage en production
docker compose -f docker-compose.prod.yml up -d

# Vérification du statut
docker compose -f docker-compose.prod.yml ps

# Visualisation des logs
docker compose -f docker-compose.prod.yml logs -f
```

---

## UTILISATION DU REGISTRE D'IMAGES

### Configuration des identifiants Docker Hub

1. **Connexion à Docker Hub :**
```bash
docker login
# Entrer votre nom d'utilisateur Docker Hub : zercko
# Entrer votre mot de passe Docker Hub
```

### Construction et tag des images

2. **Construire et taguer les images avec le nom du registre :**
```bash
# Backend
docker build -t zercko/ecodeli-backend:1.0.0 ./backend
docker build -t zercko/ecodeli-backend:latest ./backend

# Frontend Frontoffice
docker build -t zercko/ecodeli-frontoffice:1.0.0 ./frontend/ecodeli-frontoffice
docker build -t zercko/ecodeli-frontoffice:latest ./frontend/ecodeli-frontoffice

# Frontend Backoffice
docker build -t zercko/ecodeli-backoffice:1.0.0 ./frontend/ecodeli-backoffice
docker build -t zercko/ecodeli-backoffice:latest ./frontend/ecodeli-backoffice
```

### Push vers le registre Docker Hub

3. **Pousser les images vers Docker Hub :**
```bash
docker push zercko/ecodeli-backend:1.0.0
docker push zercko/ecodeli-backend:latest
docker push zercko/ecodeli-frontoffice:1.0.0
docker push zercko/ecodeli-frontoffice:latest
docker push zercko/ecodeli-backoffice:1.0.0
docker push zercko/ecodeli-backoffice:latest
```

### Récupération et utilisation des images

4. **Pull des images depuis Docker Hub :**
```bash
docker pull zercko/ecodeli-backend:1.0.0
docker pull zercko/ecodeli-frontoffice:1.0.0
docker pull zercko/ecodeli-backoffice:1.0.0
```

### Modification des fichiers Docker Compose

5. **Pour utiliser les images du registre au lieu du build local :**

Remplacez les sections `build` par des références aux images du registre :

```yaml
# Exemple pour le backend dans docker-compose.dev.yml ou docker-compose.prod.yml
ecodeli-backend:
  image: zercko/ecodeli-backend:1.0.0
  # Commentez ou supprimez la section build:
  # build:
  #   context: ./backend
  #   dockerfile: Dockerfile
```

Répétez cette modification pour les trois services dans vos fichiers Docker Compose.

---

## GESTION ET MAINTENANCE

### Commandes utiles

```bash
# Statut des conteneurs
docker compose -f docker-compose.dev.yml ps

# Logs d'un service spécifique
docker compose -f docker-compose.dev.yml logs -f ecodeli-backend

# Redémarrage d'un service
docker compose -f docker-compose.dev.yml restart ecodeli-backend

# Mise à jour des images
docker compose -f docker-compose.dev.yml pull
docker compose -f docker-compose.dev.yml up -d

# Reconstruction complète
docker compose -f docker-compose.dev.yml build --no-cache
docker compose -f docker-compose.dev.yml up -d --force-recreate
```

### Sauvegarde des données

```bash
# Sauvegarde de la base de données
docker exec ecodeli-db-dev pg_dump -U postgres ecodeli_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restauration
cat backup_YYYYMMDD_HHMMSS.sql | docker exec -i ecodeli-db-dev psql -U postgres ecodeli_db
```

### Monitoring

```bash
# Statistiques des conteneurs
docker stats

# Inspection d'un conteneur
docker inspect ecodeli-backend-dev

# Health check status
docker compose -f docker-compose.dev.yml ps
```

---

## DÉPANNAGE

### Problèmes courants

#### 1. Port déjà utilisé

```bash
# Identifier le processus utilisant le port
netstat -tulpn | grep :8080

# Solutions :
# - Arrêter le processus utilisant le port
# - Changer le port dans .env
BACKEND_PORT=8081
```

#### 2. Erreur de connexion à la base de données

```bash
# Vérifier que la DB est démarrée et saine
docker compose -f docker-compose.dev.yml logs ecodeli-db
docker compose -f docker-compose.dev.yml ps

# Tester la connexion
docker exec -it ecodeli-db-dev psql -U postgres -d ecodeli_db
```

#### 3. Erreurs de build

```bash
# Nettoyer et reconstruire
docker system prune -a
docker compose -f docker-compose.dev.yml build --no-cache
```

#### 4. Problèmes de permissions

```bash
# Vérifier les permissions des volumes
ls -la docker-volumes/

# Corriger les permissions (Linux/Mac)
sudo chown -R $USER:$USER docker-volumes/

# Windows : Vérifier les paramètres de partage de Docker Desktop
```

### Logs de débogage

```bash
# Logs détaillés pour tous les services
docker compose -f docker-compose.dev.yml logs --follow

# Logs avec timestamps
docker compose -f docker-compose.dev.yml logs -f -t

# Logs d'un service spécifique
docker compose -f docker-compose.dev.yml logs -f ecodeli-backend
```

---

## ARRÊT ET NETTOYAGE

### Arrêt des services

```bash
# Arrêt propre
docker compose -f docker-compose.dev.yml down

# Arrêt avec suppression des volumes (ATTENTION : perte de données)
docker compose -f docker-compose.dev.yml down -v
```

### Nettoyage du système

```bash
# Nettoyage des ressources inutilisées
docker system prune

# Nettoyage complet (ATTENTION : supprime tout)
docker system prune -a --volumes
```

---

## SÉCURITÉ EN PRODUCTION

### Bonnes pratiques

1. **Variables d'environnement sécurisées :**
   - Ne jamais commiter le fichier `.env` avec des secrets
   - Utiliser des mots de passe complexes
   - Changer les clés par défaut

2. **Mise à jour régulière :**
   - Maintenir Docker à jour
   - Mettre à jour les images de base
   - Appliquer les patches de sécurité

3. **Monitoring :**
   - Surveiller les logs d'erreur
   - Mettre en place des alertes
   - Monitorer les performances

4. **Backup :**
   - Sauvegardes automatisées
   - Tests de restauration
   - Stockage sécurisé des backups

---

## SCRIPTS AUTOMATISÉS

Le projet inclut un script de démarrage automatisé :

```bash
# Rendre le script exécutable
chmod +x start-docker.sh

# Lancer le script interactif
./start-docker.sh
```

Ce script propose un menu interactif pour :
- Démarrer l'environnement de développement
- Démarrer l'environnement de production
- Voir le statut des services
- Consulter les logs
- Nettoyer le système

---

## SUPPORT ET RESSOURCES

### Documentation officielle

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Spring Boot avec Docker](https://spring.io/guides/topicals/spring-boot-docker/)

### Fichiers de référence du projet

- `ARCHITECTURE-DOCKER.md` : Documentation complète de l'architecture
- `docker-compose.dev.yml` : Configuration développement
- `docker-compose.prod.yml` : Configuration production
- `.env.example` : Template des variables d'environnement
- `start-docker.sh` : Script de démarrage automatisé

Pour toute question ou problème, consultez en priorité la documentation d'architecture et les logs des conteneurs.
