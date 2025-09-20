#!/bin/bash

# Career Counseling Platform - Production Deployment Script
# This script handles complete production deployment

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="career-counseling-platform"
DOCKER_COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_requirements() {
    log_info "Checking system requirements..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if .env file exists
    if [ ! -f "$ENV_FILE" ]; then
        log_warning ".env file not found. Creating from .env.example..."
        if [ -f ".env.example" ]; then
            cp .env.example .env
            log_warning "Please update .env file with your production values before continuing."
            read -p "Press Enter after updating .env file to continue..."
        else
            log_error ".env.example file not found. Please create .env file manually."
            exit 1
        fi
    fi
    
    log_success "All requirements met."
}

backup_database() {
    log_info "Creating database backup..."
    
    BACKUP_DIR="./backups"
    BACKUP_FILE="${BACKUP_DIR}/backup_$(date +%Y%m%d_%H%M%S).sql"
    
    mkdir -p "$BACKUP_DIR"
    
    # Only backup if containers are running
    if docker-compose ps | grep -q "career_counseling_db"; then
        docker-compose exec -T postgres pg_dump -U postgres career_counseling > "$BACKUP_FILE"
        log_success "Database backup created: $BACKUP_FILE"
    else
        log_info "Database container not running, skipping backup."
    fi
}

build_and_deploy() {
    log_info "Building and deploying $PROJECT_NAME..."
    
    # Set environment to production
    export NODE_ENV=production
    
    # Pull latest images
    log_info "Pulling latest base images..."
    docker-compose pull
    
    # Build services
    log_info "Building services..."
    docker-compose build --no-cache --parallel
    
    # Stop existing containers
    log_info "Stopping existing containers..."
    docker-compose down
    
    # Start services
    log_info "Starting services..."
    docker-compose up -d
    
    # Wait for services to be healthy
    log_info "Waiting for services to be healthy..."
    timeout 300 bash -c 'until docker-compose ps | grep -q "healthy"; do sleep 5; done'
    
    log_success "Deployment completed successfully!"
}

run_migrations() {
    log_info "Running database migrations..."
    
    # Wait for database to be ready
    sleep 10
    
    # Run migrations
    docker-compose exec backend npm run migration:run
    
    log_success "Database migrations completed."
}

health_check() {
    log_info "Performing health checks..."
    
    # Check backend health
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        log_success "Backend is healthy"
    else
        log_error "Backend health check failed"
        return 1
    fi
    
    # Check frontend health
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        log_success "Frontend is healthy"
    else
        log_error "Frontend health check failed"
        return 1
    fi
    
    # Check database health
    if docker-compose exec postgres pg_isready -U postgres > /dev/null 2>&1; then
        log_success "Database is healthy"
    else
        log_error "Database health check failed"
        return 1
    fi
    
    log_success "All health checks passed!"
}

show_status() {
    log_info "Current deployment status:"
    echo ""
    docker-compose ps
    echo ""
    docker-compose logs --tail=5
}

cleanup() {
    log_info "Cleaning up unused Docker resources..."
    docker system prune -f
    docker volume prune -f
    log_success "Cleanup completed."
}

# Main deployment process
main() {
    log_info "Starting production deployment for $PROJECT_NAME"
    echo "======================================================"
    
    check_requirements
    backup_database
    build_and_deploy
    run_migrations
    
    # Wait a bit for services to fully start
    sleep 15
    
    if health_check; then
        show_status
        cleanup
        
        echo ""
        log_success "🚀 Production deployment completed successfully!"
        log_info "Services are running at:"
        log_info "  Frontend: http://localhost:3000"
        log_info "  Backend API: http://localhost:3001"
        log_info "  Database: localhost:5432"
        echo ""
        log_info "To view logs: docker-compose logs -f"
        log_info "To stop services: docker-compose down"
    else
        log_error "❌ Deployment failed health checks!"
        log_info "Check logs with: docker-compose logs"
        exit 1
    fi
}

# Handle script arguments
case "${1:-deploy}" in
    deploy)
        main
        ;;
    health)
        health_check
        ;;
    status)
        show_status
        ;;
    backup)
        backup_database
        ;;
    cleanup)
        cleanup
        ;;
    *)
        echo "Usage: $0 {deploy|health|status|backup|cleanup}"
        echo ""
        echo "Commands:"
        echo "  deploy   - Full production deployment (default)"
        echo "  health   - Run health checks"
        echo "  status   - Show current status"
        echo "  backup   - Create database backup"
        echo "  cleanup  - Clean up Docker resources"
        exit 1
        ;;
esac