# Dockerfile Backend EcoDeli - Multi-staging Simple
# Version simplifiée pour développement et production

# ===========================================
# STAGE 1: BASE - Dépendances partagées
# ===========================================
FROM eclipse-temurin:21-jdk AS base

LABEL description="EcoDeli Backend - Base Stage"

WORKDIR /app

# Copie des fichiers de configuration Maven
COPY pom.xml mvnw ./
COPY .mvn .mvn

# Téléchargement des dépendances (cache Docker)
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# ===========================================
# STAGE 2: DEVELOPMENT - Hot Reload
# ===========================================
FROM base AS development

LABEL description="EcoDeli Backend - Development with Hot Reload"

# Installation de curl pour health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copie du code source (sera overridé par volume en dev)
COPY src ./src

# Variables d'environnement pour le développement
ENV SPRING_PROFILES_ACTIVE=docker
ENV MAVEN_OPTS="-Xmx512m"

# Port d'exposition
EXPOSE 8080

# Health check simple
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# Commande de développement avec hot reload
CMD ["./mvnw", "spring-boot:run", "-Dspring-boot.run.jvmArguments=-Xmx512m"]

# ===========================================
# STAGE 3: BUILD - Construction production
# ===========================================
FROM base AS build

LABEL description="EcoDeli Backend - Build Stage"

# Copie du code source complet
COPY src ./src

# Construction du JAR
RUN ./mvnw clean package -DskipTests -B

# ===========================================
# STAGE 4: PRODUCTION - Runtime optimisé
# ===========================================
FROM eclipse-temurin:21-jre AS production

LABEL description="EcoDeli Backend - Production Runtime"
LABEL version="1.0.0"

# Utilisateur non-root pour la sécurité
RUN groupadd -r ecodeli && useradd -r -g ecodeli ecodeli

# Installation des outils essentiels
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copie du JAR depuis le stage build
COPY --from=build /app/target/*.jar app.jar

# Création des dossiers nécessaires
RUN mkdir -p logs uploads && chown -R ecodeli:ecodeli /app

# Variables d'environnement production
ENV SPRING_PROFILES_ACTIVE=docker
ENV JAVA_OPTS="-Xmx1g -XX:+UseContainerSupport"

# Port d'exposition
EXPOSE 8080

# Utilisateur non-root
USER ecodeli

# Health check optimisé
HEALTHCHECK --interval=60s --timeout=15s --start-period=120s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# Point d'entrée production
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
