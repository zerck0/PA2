# Dockerfile Frontend Frontoffice EcoDeli - Multi-staging Simple
# Version simplifiée pour développement et production

# ===========================================
# STAGE 1: BASE - Dépendances partagées
# ===========================================
FROM node:20-alpine AS base

LABEL description="EcoDeli Frontoffice - Base Stage"

# Installation des outils nécessaires
RUN apk add --no-cache wget

WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances
RUN npm ci

# ===========================================
# STAGE 2: DEVELOPMENT - Hot Reload
# ===========================================
FROM base AS development

LABEL description="EcoDeli Frontoffice - Development with Hot Reload"

# Copie des fichiers de configuration essentiels
COPY index.html vite.config.ts tsconfig*.json ./
COPY public ./public
COPY src ./src

# Variables d'environnement pour le développement
ENV NODE_ENV=development
ENV VITE_API_URL=http://localhost:8080

# Port d'exposition
EXPOSE 5173

# Health check simple
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5173/ || exit 1

# Commande de développement avec hot reload
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ===========================================
# STAGE 3: BUILD - Construction production
# ===========================================
FROM base AS build

LABEL description="EcoDeli Frontoffice - Build Stage"

# Copie du code source complet
COPY . .

# Construction de l'application
RUN npm run build

# ===========================================
# STAGE 4: PRODUCTION - Nginx optimisé
# ===========================================
FROM nginx:alpine AS production

LABEL description="EcoDeli Frontoffice - Production"
LABEL version="1.0.0"

# Utilisateur non-root
RUN addgroup -g 1001 -S ecodeli && \
    adduser -S ecodeli -u 1001

# Copie des fichiers buildés
COPY --from=build /app/dist /usr/share/nginx/html

# Configuration nginx pour React Router
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
    \
    add_header X-Frame-Options "SAMEORIGIN" always; \
    add_header X-Content-Type-Options "nosniff" always; \
}' > /etc/nginx/conf.d/default.conf

# Permissions
RUN chown -R ecodeli:ecodeli /usr/share/nginx/html && \
    chown -R ecodeli:ecodeli /var/cache/nginx && \
    chown -R ecodeli:ecodeli /var/log/nginx && \
    chown -R ecodeli:ecodeli /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R ecodeli:ecodeli /var/run/nginx.pid

# Variables d'environnement
ENV NODE_ENV=production

# Port d'exposition
EXPOSE 80

# Utilisateur non-root
USER ecodeli

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Commande de démarrage
CMD ["nginx", "-g", "daemon off;"]
