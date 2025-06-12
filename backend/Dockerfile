# On commence par la construction de notre application
FROM eclipse-temurin:21-jdk AS build

# Un peu d'info sur notre image
LABEL description="EcoDeli Backend API - Spring Boot"
LABEL version="1.0.0"

# On a besoin de Maven pour compiler notre projet
RUN apt-get update && apt-get install -y maven && rm -rf /var/lib/apt/lists/*

# On se place dans le bon dossier
WORKDIR /app

# On récupère d'abord juste les dépendances Maven
COPY pom.xml .
COPY mvnw .
COPY mvnw.cmd .
COPY .mvn .mvn

# On télécharge les dépendances en avance pour gagner du temps plus tard
RUN mvn dependency:go-offline -B

# Maintenant on peut ajouter notre code
COPY src src

# Et on compile le tout !
RUN mvn clean package -DskipTests -B

# Passons à l'image de développement
FROM eclipse-temurin:21-jre AS runtime

# Quelques infos sur cette image de dev
LABEL description="EcoDeli Backend API - Runtime Development"

# Création d'un utilisateur non-root pour la sécurité
RUN groupadd -r ecodeli && useradd -r -g ecodeli ecodeli

# Création du répertoire de l'application
WORKDIR /app

# Installation des dépendances système nécessaires (avec outils de dev)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    curl \
    netcat-traditional \
    && rm -rf /var/lib/apt/lists/*

# Copie du JAR 
COPY --from=build /app/target/*.jar app.jar

# Création du dossier de logs
RUN mkdir -p /app/logs

# Attribution des permissions à l'utilisateur ecodeli
RUN chown -R ecodeli:ecodeli /app

# Basculement vers l'utilisateur non-root
USER ecodeli

# Variables d'environnement pour le développement
ENV SPRING_PROFILES_ACTIVE=docker
ENV JAVA_OPTS="-Xmx512m -Xms256m"
ENV SERVER_PORT=8080

# Exposition du port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# Point d'entrée
ENTRYPOINT exec java $JAVA_OPTS -jar app.jar

# Étape 3: PRODUCTION - Image optimisée pour la production
FROM eclipse-temurin:21-jre AS production

# Métadonnées de l'image de production
LABEL description="EcoDeli Backend API - Production"
LABEL version="1.0.0"

# Création d'un utilisateur non-root pour la sécurité
RUN groupadd -r ecodeli && useradd -r -g ecodeli ecodeli

# Création du répertoire de l'application
WORKDIR /app

# Installation minimale des dépendances (production seulement)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Copie du JAR depuis l'étape de build
COPY --from=build /app/target/*.jar app.jar

# Création du dossier de logs
RUN mkdir -p /app/logs

# Attribution des permissions à l'utilisateur ecodeli
RUN chown -R ecodeli:ecodeli /app

# Basculement vers l'utilisateur non-root
USER ecodeli

# Variables d'environnement optimisées pour la production
ENV SPRING_PROFILES_ACTIVE=docker
ENV JAVA_OPTS="-Xmx1g -Xms512m -XX:+UseG1GC -XX:+UseContainerSupport"
ENV SERVER_PORT=8080

# Exposition du port
EXPOSE 8080

# Healthcheck pour la production
HEALTHCHECK --interval=60s --timeout=15s --start-period=120s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# Point d'entrée
ENTRYPOINT exec java $JAVA_OPTS -jar app.jar
