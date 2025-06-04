# Dockerfile multi-étapes pour le backend Spring Boot
# Étape 1: BUILD - Construction de l'application
FROM eclipse-temurin:21-jdk AS build

# Métadonnées de l'image
LABEL maintainer="Tom Georgin"
LABEL description="EcoDeli Backend API - Spring Boot"
LABEL version="1.0.0"

# Installation de Maven
RUN apt-get update && apt-get install -y maven && rm -rf /var/lib/apt/lists/*

# Définition du répertoire de travail
WORKDIR /app

# Copie des fichiers de configuration Maven
COPY pom.xml .
COPY mvnw .
COPY mvnw.cmd .
COPY .mvn .mvn

# Téléchargement des dépendances (optimisation des layers Docker)
RUN mvn dependency:go-offline -B

# Copie du code source
COPY src src

# Construction de l'application
RUN mvn clean package -DskipTests -B

# Étape 2: RUNTIME - Exécution de l'application
FROM eclipse-temurin:21-jre AS runtime

# Métadonnées de l'image finale
LABEL maintainer="Tom Georgin"
LABEL description="EcoDeli Backend API - Runtime"

# Création d'un utilisateur non-root pour la sécurité
RUN groupadd -r ecodeli && useradd -r -g ecodeli ecodeli

# Création du répertoire de l'application
WORKDIR /app

# Installation des dépendances système nécessaires
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copie du JAR depuis l'étape de build
COPY --from=build /app/target/*.jar app.jar

# Attribution des permissions à l'utilisateur ecodeli
RUN chown -R ecodeli:ecodeli /app

# Basculement vers l'utilisateur non-root
USER ecodeli

# Variables d'environnement
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
