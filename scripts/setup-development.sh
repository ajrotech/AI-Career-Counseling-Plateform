#!/bin/bash

# Career Counseling Platform - Development Setup Script
# This script sets up the development environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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
    log_info "Checking development requirements..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    # Check Node version
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Node.js version must be 18 or higher. Current version: $(node --version)"
        exit 1
    fi
    
    log_success "All requirements met."
}

setup_environment() {
    log_info "Setting up environment files..."
    
    # Create .env if it doesn't exist
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            log_success "Created .env from .env.example"
            log_warning "Please update .env file with your development values."
        else
            log_error ".env.example file not found!"
            exit 1
        fi
    else
        log_info ".env file already exists."
    fi
}

install_dependencies() {
    log_info "Installing dependencies..."
    
    # Install root dependencies
    log_info "Installing root dependencies..."
    npm install
    
    # Install backend dependencies
    log_info "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    
    # Install frontend dependencies
    log_info "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    
    log_success "All dependencies installed."
}

setup_database() {
    log_info "Setting up development database..."
    
    # Check if Docker is available for database
    if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
        log_info "Starting database with Docker..."
        export NODE_ENV=development
        docker-compose up -d postgres redis
        
        # Wait for database to be ready
        log_info "Waiting for database to be ready..."
        sleep 10
        
        # Run migrations
        log_info "Running database migrations..."
        cd backend
        npm run migration:run
        
        # Seed database
        log_info "Seeding database with initial data..."
        npm run seed
        cd ..
        
        log_success "Database setup completed."
    else
        log_warning "Docker not available. Please set up PostgreSQL manually."
        log_info "Database connection details:"
        log_info "  Host: localhost"
        log_info "  Port: 5432"
        log_info "  Database: career_counseling"
        log_info "  Username: postgres"
        log_info "  Password: postgres"
    fi
}

start_development() {
    log_info "Starting development servers..."
    
    # Start backend in background
    log_info "Starting backend server..."
    cd backend
    npm run start:dev &
    BACKEND_PID=$!
    cd ..
    
    # Wait a bit for backend to start
    sleep 5
    
    # Start frontend
    log_info "Starting frontend server..."
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    # Store PIDs for cleanup
    echo $BACKEND_PID > .backend.pid
    echo $FRONTEND_PID > .frontend.pid
    
    log_success "Development servers started!"
    log_info "Backend: http://localhost:3001"
    log_info "Frontend: http://localhost:3000"
    log_info ""
    log_info "To stop servers, run: npm run stop"
    
    # Wait for user to stop
    read -p "Press Enter to stop development servers..."
    
    # Cleanup
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    rm -f .backend.pid .frontend.pid
}

show_help() {
    echo "Career Counseling Platform - Development Setup"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  setup    - Complete development setup (default)"
    echo "  install  - Install dependencies only"
    echo "  database - Setup database only"
    echo "  start    - Start development servers"
    echo "  help     - Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 setup    # Full setup"
    echo "  $0 start    # Start servers"
}

main() {
    log_info "Career Counseling Platform - Development Setup"
    echo "=============================================="
    
    check_requirements
    setup_environment
    install_dependencies
    setup_database
    
    log_success "🎉 Development setup completed!"
    echo ""
    log_info "Next steps:"
    log_info "1. Update .env file with your configurations"
    log_info "2. Run 'npm run dev' to start development servers"
    log_info "3. Visit http://localhost:3000 to see the application"
    echo ""
    log_info "Available scripts:"
    log_info "  npm run dev          - Start both servers"
    log_info "  npm run dev:backend  - Start backend only"
    log_info "  npm run dev:frontend - Start frontend only"
    log_info "  npm run test         - Run all tests"
    log_info "  npm run build        - Build for production"
}

# Handle script arguments
case "${1:-setup}" in
    setup)
        main
        ;;
    install)
        check_requirements
        install_dependencies
        ;;
    database)
        setup_database
        ;;
    start)
        start_development
        ;;
    help)
        show_help
        ;;
    *)
        show_help
        exit 1
        ;;
esac