#!/bin/bash

# ============================================
# SNAKE MCQ CHALLENGE - SETUP SCRIPT FOR LINUX
# ============================================

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     🐍 SNAKE MCQ CHALLENGE - SETUP SCRIPT FOR LINUX        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if running on Linux
if [[ ! "$OSTYPE" == "linux"* ]]; then
    echo -e "${RED}Error: This script is designed for Linux systems.${NC}"
    exit 1
fi

# Function to print colored messages
print_status() {
    echo -e "${BLUE}[*]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Step 1: Check and install Node.js
print_status "Checking Node.js installation..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    print_success "Node.js is installed: $NODE_VERSION"
else
    print_warning "Node.js not found. Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    print_success "Node.js installed"
fi

# Step 2: Check and install PostgreSQL
print_status "Checking PostgreSQL installation..."
if command -v psql &> /dev/null; then
    PG_VERSION=$(psql --version)
    print_success "PostgreSQL is installed: $PG_VERSION"
else
    print_warning "PostgreSQL not found. Installing PostgreSQL..."
    sudo apt-get update
    sudo apt-get install -y postgresql postgresql-contrib
    print_success "PostgreSQL installed"
fi

# Step 3: Check and install npm packages
print_status "Installing npm dependencies..."
cd backend
npm install
print_success "Backend dependencies installed"
cd ..

# Step 4: Create .env file from example
if [ ! -f backend/.env ]; then
    print_status "Creating .env file from template..."
    cp backend/.env.example backend/.env
    print_warning "Please edit backend/.env with your database credentials"
else
    print_success ".env file already exists"
fi

# Step 5: Create PostgreSQL database
print_status "Setting up PostgreSQL database..."

# Start PostgreSQL if not running
sudo service postgresql start 2>/dev/null || true
sleep 2

# Create database and user
print_status "Creating database and running schema..."

# Check if database exists
DB_EXISTS=$(sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -w snake_mcq | wc -l)

if [ $DB_EXISTS -eq 0 ]; then
    print_status "Creating snake_mcq database..."
    
    # Create database
    sudo -u postgres psql -c "CREATE DATABASE snake_mcq;" 2>/dev/null || print_warning "Database might already exist"
    
    # Run schema
    sudo -u postgres psql -d snake_mcq -f database/schema.sql
    print_success "Database schema created"
    
    # Add sample questions
    sudo -u postgres psql -d snake_mcq -f database/sample-questions.sql
    print_success "Sample questions loaded"
else
    print_warning "Database snake_mcq already exists. Skipping creation."
fi

# Step 6: Create necessary directories
print_status "Creating necessary directories..."
mkdir -p backend/logs
mkdir -p frontend/assets
print_success "Directories created"

# Step 7: Check ports availability
print_status "Checking port availability..."

for port in 3000 3001 8080; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        print_warning "Port $port is already in use"
    else
        print_success "Port $port is available"
    fi
done

# Step 8: Display final instructions
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║           ✓ SETUP COMPLETED SUCCESSFULLY! ✓               ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}Next Steps:${NC}"
echo ""
echo "1. ${YELLOW}Edit Configuration:${NC}"
echo "   cd backend"
echo "   nano .env"
echo "   (Update DB_PASSWORD and JWT_SECRET)"
echo ""
echo "2. ${YELLOW}Start Backend Server (Terminal 1):${NC}"
echo "   cd backend"
echo "   npm start"
echo "   (Server will run on http://localhost:3000)"
echo ""
echo "3. ${YELLOW}Start Frontend Server (Terminal 2):${NC}"
echo "   cd frontend"
echo "   npx http-server -p 8080"
echo "   (Frontend will be available at http://localhost:8080)"
echo ""
echo "4. ${YELLOW}Access Application:${NC}"
echo "   Player:  http://localhost:8080"
echo "   Admin:   http://localhost:8080/admin-login.html"
echo ""
echo "5. ${YELLOW}Test Database Connection:${NC}"
echo "   psql -U postgres -d snake_mcq -c \"SELECT COUNT(*) FROM questions;\""
echo ""
echo -e "${GREEN}Useful Commands:${NC}"
echo ""
echo "Start PostgreSQL:"
echo "   sudo service postgresql start"
echo ""
echo "Check PostgreSQL status:"
echo "   sudo service postgresql status"
echo ""
echo "View backend logs:"
echo "   tail -f backend/logs/app.log"
echo ""
echo "Kill process on port 3000:"
echo "   kill \$(lsof -t -i:3000)"
echo ""
echo "Kill process on port 8080:"
echo "   kill \$(lsof -t -i:8080)"
echo ""
echo "Reset database:"
echo "   sudo -u postgres psql -d snake_mcq -f database/schema.sql"
echo ""
echo -e "${GREEN}Documentation:${NC}"
echo "   See README.md for more information"
echo ""
print_success "Setup script completed!"
