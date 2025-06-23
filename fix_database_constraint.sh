#!/bin/bash

echo "🔧 Correction de la contrainte documents_type_check pour supporter PHOTO_ANNONCE"
echo "=================================================================="

# Variables par défaut de l'environnement de développement
CONTAINER_NAME="ecodeli-db-dev"
DB_NAME="${POSTGRES_DB:-ecodeli_db}"
DB_USER="${POSTGRES_USER:-postgres}"

echo "📋 Configuration détectée:"
echo "   - Conteneur: $CONTAINER_NAME"
echo "   - Base de données: $DB_NAME"
echo "   - Utilisateur: $DB_USER"
echo ""

# Vérifier si le conteneur existe et fonctionne
echo "🔍 Vérification du conteneur..."
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo "❌ Le conteneur $CONTAINER_NAME n'est pas en cours d'exécution."
    echo "   Vérifiez que Docker Compose est démarré avec:"
    echo "   docker compose -f docker-compose.dev.yml up -d"
    exit 1
fi

echo "✅ Conteneur trouvé et en cours d'exécution"
echo ""

# Copier le script SQL dans le conteneur
echo "📄 Copie du script SQL dans le conteneur..."
docker cp backend/src/main/resources/fix_documents_constraint.sql $CONTAINER_NAME:/tmp/fix_constraint.sql

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de la copie du script SQL"
    exit 1
fi

echo "✅ Script copié avec succès"
echo ""

# Exécuter le script SQL
echo "⚡ Exécution de la correction de la contrainte..."
docker exec -it $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME -f /tmp/fix_constraint.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Correction appliquée avec succès !"
    echo "   La contrainte documents_type_check inclut maintenant PHOTO_ANNONCE"
    echo ""
    echo "💡 Vous pouvez maintenant:"
    echo "   - Uploader des photos dans les annonces"
    echo "   - Les photos seront correctement sauvegardées en base"
    echo ""
    
    # Nettoyer le fichier temporaire
    docker exec $CONTAINER_NAME rm /tmp/fix_constraint.sql
    
else
    echo ""
    echo "❌ Erreur lors de l'exécution du script SQL"
    echo "   Vérifiez les logs du conteneur:"
    echo "   docker logs $CONTAINER_NAME"
    exit 1
fi

echo "🧹 Nettoyage terminé"
echo "=================================================================="
