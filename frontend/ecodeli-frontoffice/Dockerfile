# C'est parti pour construire notre application frontoffice
FROM node:20-alpine AS build

# Pour savoir ce qu'est cette image
LABEL description="EcoDeli Frontoffice - React/Vite"
LABEL version="1.0.0"

# On travaille dans ce dossier
WORKDIR /app

# D'abord les dépendances
COPY package*.json ./

# On installe tout ce qu'il faut pour la construction
RUN npm ci

# On a besoin de TypeScript aussi
RUN npm install -g typescript

# Maintenant on peut copier notre code
COPY . .

# Et construire notre application
RUN npm run build

# Passons à l'environnement de dev avec rechargement à chaud
FROM node:20-alpine AS development

# Info sur cette version
LABEL description="EcoDeli Frontoffice - Development Server"

# Pour faire des health checks
RUN apk add --no-cache wget

# On continue dans le même dossier
WORKDIR /app

# On copie juste les fichiers de dépendances
COPY package*.json ./

# Installation complète pour le développement
RUN npm ci

# Variables pour notre environnement de dev
ENV NODE_ENV=development
ENV VITE_API_URL=http://localhost:8080

# Le port de Vite
EXPOSE 5173

# Vérification que tout fonctionne
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5173/ || exit 1

# Comment démarrer en mode dev
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Et enfin la version de production avec nginx
FROM nginx:alpine AS production

# Infos sur cette version finale
LABEL description="EcoDeli Frontoffice - Production Optimized"
LABEL version="1.0.0"

# On crée un utilisateur dédié pour plus de sécurité
RUN addgroup -g 1001 -S ecodeli && \
    adduser -S ecodeli -u 1001

# On récupère les fichiers construits précédemment
COPY --from=build /app/dist /usr/share/nginx/html

# On configure nginx pour notre appli React
RUN echo 'server { \
    listen 80; \
    listen [::]:80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html index.htm; \
    \
    # Pour que React Router fonctionne correctement \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    \
    # On optimise le cache des fichiers statiques \
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
}' > /etc/nginx/conf.d/default.conf

# On ajuste les permissions pour notre utilisateur
RUN chown -R ecodeli:ecodeli /usr/share/nginx/html && \
    chown -R ecodeli:ecodeli /var/cache/nginx && \
    chown -R ecodeli:ecodeli /var/log/nginx && \
    chown -R ecodeli:ecodeli /etc/nginx/conf.d

# On prépare le fichier PID pour nginx
RUN touch /var/run/nginx.pid && \
    chown -R ecodeli:ecodeli /var/run/nginx.pid

# On est en prod
ENV NODE_ENV=production

# Le port standard pour le web
EXPOSE 80

# On utilise notre utilisateur dédié
USER ecodeli

# Vérification régulière que tout va bien
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Comment démarrer nginx
CMD ["nginx", "-g", "daemon off;"]
