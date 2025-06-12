#!/bin/bash


echo "EcoDeli - Conteneurisation Docker"


show_menu() {
    echo ""
    echo "Choisissez une option:"
    echo "1) Démarrer en développement"
    echo "2) Démarrer en production"
    echo "3) Arrêter les services"
    echo "4) Voir les logs"
    echo "5) Quitter"
    echo ""
}

start_dev() {
    echo "[INFO] Démarrage de l'environnement de développement..."
    docker compose -f docker-compose.dev.yml up -d
    echo ""
    echo "Services démarrés !"
    echo "URLs d'accès:"
    echo "  Frontend Frontoffice: http://localhost:3000"
    echo "  Frontend Backoffice:  http://localhost:3001"
    echo "  API Backend:          http://localhost:8080"
    echo ""
}

start_prod() {
    echo "[INFO] Démarrage de l'environnement de production..."
    docker compose -f docker-compose.prod.yml up -d
    echo ""
    echo "Services démarrés en production !"
    echo "URLs d'accès:"
    echo "  Frontend Frontoffice: http://localhost:3000"
    echo "  Frontend Backoffice:  http://localhost:3001"
    echo "  API Backend:          http://localhost:8080"
    echo ""
}

stop_services() {
    echo "[INFO] Arrêt de tous les services..."
    docker compose -f docker-compose.dev.yml down 2>/dev/null
    docker compose -f docker-compose.prod.yml down 2>/dev/null
    echo "Services arrêtés."
}

show_logs() {
    echo ""
    echo "Choisir l'environnement:"
    echo "1) Développement"
    echo "2) Production"
    echo ""
    read -p "Votre choix (1-2): " log_choice
    
    case $log_choice in
        1)
            echo "Logs de développement (Ctrl+C pour quitter):"
            docker compose -f docker-compose.dev.yml logs -f
            ;;
        2)
            echo "Logs de production (Ctrl+C pour quitter):"
            docker compose -f docker-compose.prod.yml logs -f
            ;;
        *)
            echo "Choix invalide"
            ;;
    esac
}

while true; do
    show_menu
    read -p "Votre choix (1-5): " choice
    
    case $choice in
        1)
            start_dev
            ;;
        2)
            start_prod
            ;;
        3)
            stop_services
            ;;
        4)
            show_logs
            ;;
        5)
            echo "Au revoir!"
            exit 0
            ;;
        *)
            echo "Choix invalide. Veuillez choisir entre 1 et 5."
            ;;
    esac
    
    echo ""
    read -p "Appuyez sur Entrée pour continuer..."
done
