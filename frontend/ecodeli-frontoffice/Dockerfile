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

# Installation des dépendances (optimisation des layers Docker)
RUN npm ci --only=production

# Copie du code source
COPY . .

# Construction de l'application pour la production
RUN npm run build

# Étape 2: RUNTIME - Serveur web nginx
FROM nginx:alpine AS runtime

# Métadonnées de l'image finale
LABEL maintainer="Tom Georgin"
LABEL description="EcoDeli Frontoffice - Production"

# Création d'un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S ecodeli && \
    adduser -S ecodeli -u 1001

# Copie des fichiers buildés depuis l'étape de build
COPY --from=build /app/dist /usr/share/nginx/html

# Configuration nginx personnalisée
COPY --from=build /app/dist /usr/share/nginx/html
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
