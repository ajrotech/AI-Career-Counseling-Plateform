#!/bin/bash

# Database initialization script for Career Counseling Platform
# This script sets up the PostgreSQL database with schema and seed data

set -e

# Database configuration
DB_NAME="career_counseling"
DB_USER="postgres" 
DB_PASSWORD="postgres"
DB_HOST="localhost"
DB_PORT="5432"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Setting up Career Counseling Platform Database${NC}"

# Check if PostgreSQL is running
if ! pg_isready -h $DB_HOST -p $DB_PORT > /dev/null 2>&1; then
    echo -e "${RED}❌ PostgreSQL is not running on $DB_HOST:$DB_PORT${NC}"
    echo -e "${YELLOW}Please start PostgreSQL and try again${NC}"
    exit 1
fi

echo -e "${GREEN}✅ PostgreSQL is running${NC}"

# Create database if it doesn't exist
echo -e "${YELLOW}📊 Creating database if it doesn't exist...${NC}"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME"

echo -e "${GREEN}✅ Database '$DB_NAME' is ready${NC}"

# Run schema creation
echo -e "${YELLOW}🏗️  Creating database schema...${NC}"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f schema.sql

echo -e "${GREEN}✅ Schema created successfully${NC}"

# Run seed data
echo -e "${YELLOW}🌱 Inserting seed data...${NC}"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f seed.sql

echo -e "${GREEN}✅ Seed data inserted successfully${NC}"

# Verify setup
echo -e "${YELLOW}🔍 Verifying database setup...${NC}"
TABLE_COUNT=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
echo -e "${GREEN}✅ Created $TABLE_COUNT tables${NC}"

USER_COUNT=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM users;")
echo -e "${GREEN}✅ Inserted $USER_COUNT initial users${NC}"

ASSESSMENT_COUNT=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM assessments;")
echo -e "${GREEN}✅ Inserted $ASSESSMENT_COUNT assessments${NC}"

echo -e "${GREEN}🎉 Database setup completed successfully!${NC}"
echo -e "${YELLOW}Database Details:${NC}"
echo -e "  Host: $DB_HOST"
echo -e "  Port: $DB_PORT"
echo -e "  Database: $DB_NAME"
echo -e "  User: $DB_USER"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Update your .env file with database connection details"
echo -e "  2. Start the backend server: npm run start:dev"
echo -e "  3. Access API documentation at: http://localhost:3001/api/docs"