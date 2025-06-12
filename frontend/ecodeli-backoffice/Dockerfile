# On commence par la construction de l'interface d'administration
FROM node:20-alpine AS build

# Quelques infos sur notre image
LABEL description="EcoDeli Backoffice - React/Vite"
LABEL version="1.0.0"

# Notre dossier de travail
WORKDIR /app

# On commence par les dépendances
COPY package*.json ./

# Installation de tout ce dont on a besoin
RUN npm ci

# TypeScript est nécessaire pour compiler
RUN npm install -g typescript

# Maintenant on copie tout notre code source
COPY . .

# Et on construit notre application pour la prod
RUN npm run build

# Passons à notre environnement de développement
FROM node:20-alpine AS development

# Info sur cette version
LABEL description="EcoDeli Backoffice - Development Server"

# Pour nos vérifications de santé
RUN apk add --no-cache wget

# On garde le même dossier de travail
WORKDIR /app

# On n'a besoin que des informations de dépendances
COPY package*.json ./

# Installation complète pour le développement
RUN npm ci

# Nos variables d'environnement pour le dev
ENV NODE_ENV=development
ENV VITE_API_URL=http://localhost:8080

# Le port de développement de Vite
EXPOSE 5173

# On vérifie régulièrement que tout fonctionne
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5173/ || exit 1

# Comment lancer en mode développement
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Et maintenant notre version de production
FROM nginx:alpine AS production

# Info sur l'image finale
LABEL description="EcoDeli Backoffice - Production Optimized"
LABEL version="1.0.0"

# Création d'un utilisateur dédié pour la sécurité
RUN addgroup -g 1002 -S ecodeli && \
    adduser -S ecodeli -u 1002

# On récupère les fichiers compilés de l'étape de build
COPY --from=build /app/dist /usr/share/nginx/html

# Configuration de nginx pour notre backoffice
RUN echo 'server { \
    listen 80; \
    listen [::]:80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html index.htm; \
    \
    # Pour que React Router fonctionne bien \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    \
    # Optimisation du cache pour les fichiers statiques \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
    \
    # Un peu de sécurité supplémentaire \
    add_header X-Frame-Options "SAMEORIGIN" always; \
    add_header X-Content-Type-Options "nosniff" always; \
    add_header Referrer-Policy "no-referrer-when-downgrade" always; \
    add_header Content-Security-Policy "default-src '\''self'\'' http: https: data: blob: '\''unsafe-inline'\''" always; \
    \
    # On peut restreindre l'\''accès si nécessaire \
    # location /admin { \
    #     allow 192.168.0.0/16; \
    #     allow 10.0.0.0/8; \
    #     deny all; \
    # } \
}' > /etc/nginx/conf.d/default.conf

# Ajustement des permissions pour notre utilisateur
RUN chown -R ecodeli:ecodeli /usr/share/nginx/html && \
    chown -R ecodeli:ecodeli /var/cache/nginx && \
    chown -R ecodeli:ecodeli /var/log/nginx && \
    chown -R ecodeli:ecodeli /etc/nginx/conf.d

# Préparation pour nginx
RUN touch /var/run/nginx.pid && \
    chown -R ecodeli:ecodeli /var/run/nginx.pid

# On est en production
ENV NODE_ENV=production

# Le port standard du web
EXPOSE 80

# On utilise notre utilisateur non-root
USER ecodeli

# Vérification régulière du bon fonctionnement
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Comment démarrer nginx
CMD ["nginx", "-g", "daemon off;"]
