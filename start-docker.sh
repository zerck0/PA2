#!/bin/bash

# Script de démarrage rapide pour EcoDeli Docker
# Auteur: Tom Georgin
# Projet: EcoDeli PA2 ESGI 2024-2025

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonctions utilitaires
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo -e "${GREEN}"
    echo "🐳 ======================================="
    echo "   EcoDeli - Conteneurisation Docker"
    echo "   Projet PA2 ESGI 2024-2025"
    echo "=======================================${NC}"
    echo ""
}

# Vérification des prérequis
check_requirements() {
    print_info "Vérification des prérequis..."
    
    # Vérifier Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker n'est pas installé. Veuillez l'installer d'abord."
        exit 1
    fi
    
    # Vérifier Docker Compose
    if ! command -v docker &> /dev/null || ! docker compose version &> /dev/null; then
        print_error "Docker Compose n'est pas disponible. Veuillez l'installer."
        exit 1
    fi
    
    print_success "Prérequis validés"
}

# Création des répertoires nécessaires
create_directories() {
    print_info "Création des répertoires de volumes..."
    
    mkdir -p docker-volumes/postgres-logs
    mkdir -p docker-volumes/backend-logs
    
    print_success "Répertoires créés"
}

# Configuration de l'environnement
setup_environment() {
    if [ ! -f ".env" ]; then
        print_warning "Fichier .env non trouvé. Création depuis .env.example..."
        cp .env.example .env
        print_info "Éditez le fichier .env pour adapter la configuration à votre environnement"
        print_warning "IMPORTANT: Changez le mot de passe PostgreSQL en production!"
    else
        print_success "Fichier .env trouvé"
    fi
}

# Affichage du menu
show_menu() {
    echo ""
    print_info "Choisissez l'environnement à démarrer:"
    echo "1) 🔧 Développement (avec hot reload)"
    echo "2) 🚀 Production (optimisé)"
    echo "3) 🛑 Arrêter tous les services"
    echo "4) 🧹 Nettoyer (containers, images, volumes)"
    echo "5) 📊 Voir le statut des services"
    echo "6) 📋 Voir les logs"
    echo "7) ❓ Aide"
    echo "8) 🚪 Quitter"
    echo ""
}

# Démarrage en développement
start_development() {
    print_info "Démarrage de l'environnement de développement..."
    
    # Arrêt des services existants
    docker compose -f docker-compose.dev.yml down 2>/dev/null || true
    
    # Démarrage des services
    docker compose -f docker-compose.dev.yml up -d
    
    echo ""
    print_success "Services démarrés en mode développement!"
    echo ""
    echo "🌐 URLs d'accès:"
    echo "   • Frontend Frontoffice: http://localhost:3000"
    echo "   • Frontend Backoffice:  http://localhost:3001"
    echo "   • API Backend:          http://localhost:8080"
    echo "   • Base de données:      localhost:5432"
    echo ""
    print_info "Pour voir les logs: docker compose -f docker-compose.dev.yml logs -f"
}

# Démarrage en production
start_production() {
    print_info "Démarrage de l'environnement de production..."
    
    # Arrêt des services existants
    docker compose -f docker-compose.prod.yml down 2>/dev/null || true
    
    # Construction et démarrage des services
    docker compose -f docker-compose.prod.yml up -d --build
    
    echo ""
    print_success "Services démarrés en mode production!"
    echo ""
    echo "🌐 URLs d'accès:"
    echo "   • Frontend Frontoffice: http://localhost:3000"
    echo "   • Frontend Backoffice:  http://localhost:3001"
    echo "   • API Backend:          http://localhost:8080"
    echo ""
    print_info "Pour voir les logs: docker compose -f docker-compose.prod.yml logs -f"
}

# Arrêt des services
stop_services() {
    print_info "Arrêt de tous les services..."
    
    docker compose -f docker-compose.dev.yml down 2>/dev/null || true
    docker compose -f docker-compose.prod.yml down 2>/dev/null || true
    
    print_success "Tous les services ont été arrêtés"
}

# Nettoyage
cleanup() {
    print_warning "⚠️  ATTENTION: Cette action va supprimer tous les conteneurs, images et volumes Docker!"
    echo "Cela inclut TOUTES les données de la base de données."
    echo ""
    read -p "Êtes-vous sûr de vouloir continuer? (y/N): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Nettoyage en cours..."
        
        # Arrêt des services
        stop_services
        
        # Suppression des ressources spécifiques au projet
        docker volume ls -q | grep ecodeli | xargs -r docker volume rm
        docker network ls -q | grep ecodeli | xargs -r docker network rm
        
        # Nettoyage général
        docker system prune -a --volumes -f
        
        print_success "Nettoyage terminé"
    else
        print_info "Nettoyage annulé"
    fi
}

# Statut des services
show_status() {
    print_info "Statut des services:"
    echo ""
    
    echo "🔧 Développement:"
    docker compose -f docker-compose.dev.yml ps 2>/dev/null || echo "   Aucun service en cours d'exécution"
    
    echo ""
    echo "🚀 Production:"
    docker compose -f docker-compose.prod.yml ps 2>/dev/null || echo "   Aucun service en cours d'exécution"
}

# Logs des services
show_logs() {
    echo ""
    print_info "Choisissez l'environnement pour voir les logs:"
    echo "1) Développement"
    echo "2) Production"
    echo ""
    read -p "Votre choix (1-2): " log_choice
    
    case $log_choice in
        1)
            print_info "Logs de développement (Ctrl+C pour quitter):"
            docker compose -f docker-compose.dev.yml logs -f
            ;;
        2)
            print_info "Logs de production (Ctrl+C pour quitter):"
            docker compose -f docker-compose.prod.yml logs -f
            ;;
        *)
            print_error "Choix invalide"
            ;;
    esac
}

# Affichage de l'aide
show_help() {
    echo ""
    print_info "Aide - Commandes Docker utiles:"
    echo ""
    echo "📋 Commandes de base:"
    echo "   docker compose -f docker-compose.dev.yml up -d     # Démarrer en développement"
    echo "   docker compose -f docker-compose.prod.yml up -d    # Démarrer en production"
    echo "   docker compose -f docker-compose.dev.yml down      # Arrêter les services"
    echo ""
    echo "🔍 Monitoring:"
    echo "   docker compose ps                                  # Statut des conteneurs"
    echo "   docker compose logs -f [service]                   # Logs en temps réel"
    echo "   docker stats                                       # Statistiques des conteneurs"
    echo ""
    echo "🛠️  Maintenance:"
    echo "   docker compose up --build                          # Reconstruire les images"
    echo "   docker system prune -a                             # Nettoyer le système"
    echo ""
    print_info "Pour plus d'informations, consultez DOCKER-README.md"
}

# Programme principal
main() {
    print_header
    
    # Vérifications initiales
    check_requirements
    create_directories
    setup_environment
    
    # Boucle du menu principal
    while true; do
        show_menu
        read -p "Votre choix (1-8): " choice
        
        case $choice in
            1)
                start_development
                ;;
            2)
                start_production
                ;;
            3)
                stop_services
                ;;
            4)
                cleanup
                ;;
            5)
                show_status
                ;;
            6)
                show_logs
                ;;
            7)
                show_help
                ;;
            8)
                print_success "Au revoir!"
                exit 0
                ;;
            *)
                print_error "Choix invalide. Veuillez choisir entre 1 et 8."
                ;;
        esac
        
        echo ""
        read -p "Appuyez sur Entrée pour continuer..."
    done
}

# Exécution du script
main "$@"
