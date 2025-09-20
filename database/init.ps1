# Database initialization script for Career Counseling Platform (Windows PowerShell)
# This script sets up the PostgreSQL database with schema and seed data

param(
    [string]$DBName = "career_counseling",
    [string]$DBUser = "postgres",
    [string]$DBPassword = "postgres",
    [string]$DBHost = "localhost",
    [string]$DBPort = "5432"
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"

Write-Host "🚀 Setting up Career Counseling Platform Database" -ForegroundColor $Green

# Check if PostgreSQL is running
try {
    $null = & pg_isready -h $DBHost -p $DBPort 2>$null
    Write-Host "✅ PostgreSQL is running" -ForegroundColor $Green
} catch {
    Write-Host "❌ PostgreSQL is not running on ${DBHost}:${DBPort}" -ForegroundColor $Red
    Write-Host "Please start PostgreSQL and try again" -ForegroundColor $Yellow
    exit 1
}

# Set environment variable for password (to avoid prompt)
$env:PGPASSWORD = $DBPassword

# Create database if it doesn't exist
Write-Host "📊 Creating database if it doesn't exist..." -ForegroundColor $Yellow
$dbExists = & psql -h $DBHost -p $DBPort -U $DBUser -tc "SELECT 1 FROM pg_database WHERE datname = '$DBName'" 2>$null
if (-not $dbExists -or $dbExists.Trim() -ne "1") {
    & psql -h $DBHost -p $DBPort -U $DBUser -c "CREATE DATABASE $DBName"
}

Write-Host "✅ Database '$DBName' is ready" -ForegroundColor $Green

# Run schema creation
Write-Host "🏗️ Creating database schema..." -ForegroundColor $Yellow
& psql -h $DBHost -p $DBPort -U $DBUser -d $DBName -f "schema.sql"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Schema created successfully" -ForegroundColor $Green
} else {
    Write-Host "❌ Error creating schema" -ForegroundColor $Red
    exit 1
}

# Run seed data
Write-Host "🌱 Inserting seed data..." -ForegroundColor $Yellow
& psql -h $DBHost -p $DBPort -U $DBUser -d $DBName -f "seed.sql"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Seed data inserted successfully" -ForegroundColor $Green
} else {
    Write-Host "❌ Error inserting seed data" -ForegroundColor $Red
    exit 1
}

# Verify setup
Write-Host "🔍 Verifying database setup..." -ForegroundColor $Yellow
$tableCount = & psql -h $DBHost -p $DBPort -U $DBUser -d $DBName -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"
Write-Host "✅ Created $($tableCount.Trim()) tables" -ForegroundColor $Green

$userCount = & psql -h $DBHost -p $DBPort -U $DBUser -d $DBName -t -c "SELECT COUNT(*) FROM users;"
Write-Host "✅ Inserted $($userCount.Trim()) initial users" -ForegroundColor $Green

$assessmentCount = & psql -h $DBHost -p $DBPort -U $DBUser -d $DBName -t -c "SELECT COUNT(*) FROM assessments;"
Write-Host "✅ Inserted $($assessmentCount.Trim()) assessments" -ForegroundColor $Green

Write-Host "🎉 Database setup completed successfully!" -ForegroundColor $Green
Write-Host "Database Details:" -ForegroundColor $Yellow
Write-Host "  Host: $DBHost"
Write-Host "  Port: $DBPort"
Write-Host "  Database: $DBName"
Write-Host "  User: $DBUser"
Write-Host ""
Write-Host "Next steps:" -ForegroundColor $Yellow
Write-Host "  1. Update your .env file with database connection details"
Write-Host "  2. Start the backend server: npm run start:dev"
Write-Host "  3. Access API documentation at: http://localhost:3001/api/docs"

# Clear the password environment variable
$env:PGPASSWORD = $null