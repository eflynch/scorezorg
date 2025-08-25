#!/bin/bash

# PostgreSQL Setup Script for macOS
# This script will help you set up PostgreSQL for your Scorezorg app

echo "🏈 Setting up PostgreSQL for Scorezorg..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "PostgreSQL not found. Installing via Homebrew..."
    
    # Check if Homebrew is installed
    if ! command -v brew &> /dev/null; then
        echo "Homebrew not found. Please install Homebrew first:"
        echo "Visit: https://brew.sh/"
        exit 1
    fi
    
    # Install PostgreSQL
    brew install postgresql@15
    brew services start postgresql@15
else
    echo "✅ PostgreSQL is already installed"
fi

# Create database
echo "Creating scorezorg database..."
createdb scorezorg 2>/dev/null || echo "Database 'scorezorg' might already exist"

# Run schema
echo "Setting up database schema..."
psql -d scorezorg -f database/schema.sql

echo "🎉 Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Update your .env.local file with your database credentials"
echo "2. Make sure your database is running: brew services start postgresql@15"
echo "3. Test your API: npm run dev and visit http://localhost:3000/api/league/premier-league"
echo ""
echo "Database connection details:"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  Database: scorezorg"
echo "  Username: $(whoami)"
