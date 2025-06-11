# Dockerfile multi-étapes pour le frontend Frontoffice React/Vite
# Étape 1: BUILD - Construction de l'application
FROM node:20-alpine AS build

# Métadonnées de l'image
LABEL maintainer="Tom Georgin"
LABEL description="EcoDeli Frontoffice - React/Vite"
LABEL version="1.0.0"

# Définition du répertoire de travail
WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances (y compris celles de développement nécessaires pour le build)
RUN npm ci

# Installation globale de TypeScript pour rendre tsc disponible
RUN npm install -g typescript

# Copie du code source
COPY . .

# Construction de l'application pour la production
RUN npm run build

# Étape 2: DEVELOPMENT - Serveur de développement avec hot reload
FROM node:20-alpine AS development

# Métadonnées de l'image de développement
LABEL maintainer="Tom Georgin"
LABEL description="EcoDeli Frontoffice - Development Server"

# Définition du répertoire de travail
WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances de développement
RUN npm ci

# Variables d'environnement pour le développement
ENV NODE_ENV=development
ENV VITE_API_URL=http://localhost:8080

# Exposition du port Vite
EXPOSE 5173

# Health check pour le développement
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5173/ || exit 1

# Commande par défaut pour le développement
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Étape 3: PRODUCTION - Serveur web nginx optimisé
FROM nginx:alpine AS production

# Métadonnées de l'image de production
LABEL maintainer="Tom Georgin"
LABEL description="EcoDeli Frontoffice - Production Optimized"
LABEL version="1.0.0"

# Création d'un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S ecodeli && \
    adduser -S ecodeli -u 1001

# Copie des fichiers buildés depuis l'étape de build
COPY --from=build /app/dist /usr/share/nginx/html

# Configuration nginx personnalisée
RUN echo 'server { \
    listen 80; \
    listen [::]:80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html index.htm; \
    \
    # Gestion des routes React Router \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    \
    # Cache pour les assets statiques \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
    \
    # Sécurité headers \
    add_header X-Frame-Options "SAMEORIGIN" always; \
    add_header X-Content-Type-Options "nosniff" always; \
    add_header Referrer-Policy "no-referrer-when-downgrade" always; \
    add_header Content-Security-Policy "default-src '\''self'\'' http: https: data: blob: '\''unsafe-inline'\''" always; \
}' > /etc/nginx/conf.d/default.conf

# Attribution des permissions
RUN chown -R ecodeli:ecodeli /usr/share/nginx/html && \
    chown -R ecodeli:ecodeli /var/cache/nginx && \
    chown -R ecodeli:ecodeli /var/log/nginx && \
    chown -R ecodeli:ecodeli /etc/nginx/conf.d

# Création des répertoires pour nginx
RUN touch /var/run/nginx.pid && \
    chown -R ecodeli:ecodeli /var/run/nginx.pid

# Variables d'environnement
ENV NODE_ENV=production

# Exposition du port
EXPOSE 80

# Basculement vers l'utilisateur non-root
USER ecodeli

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Point d'entrée
CMD ["nginx", "-g", "daemon off;"]
