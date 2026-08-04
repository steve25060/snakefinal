#!/bin/bash

# SNAKE MCQ CHALLENGE - QUICK START GUIDE

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     🐍 SNAKE MCQ CHALLENGE - QUICK START GUIDE            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

echo "📋 SYSTEM STATUS CHECK"
echo "====================="
echo ""

# Check Backend
echo -n "Backend Server... "
curl -s http://localhost:3000/health > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Running on port 3000"
else
    echo "❌ NOT RUNNING"
    echo "   Start with: cd ~/snake-mcq-challenge/backend && npm start"
fi

# Check Frontend
echo -n "Frontend Server... "
curl -s http://localhost:8080/ > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Running on port 8080"
else
    echo "❌ NOT RUNNING"
    echo "   Start with: cd ~/snake-mcq-challenge/frontend && npx http-server -p 8080"
fi

# Check Database
echo -n "Database... "
psql -h localhost -U postgres -d snake_mcq_game -c "SELECT 1" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    count=$(psql -h localhost -U postgres -d snake_mcq_game -c "SELECT COUNT(*) FROM users;" 2>/dev/null | tail -1 | xargs)
    echo "✅ Connected ($count users)"
else
    echo "❌ NOT CONNECTED"
    echo "   Start PostgreSQL: sudo service postgresql start"
fi

echo ""
echo "🎮 QUICK ACCESS LINKS"
echo "====================="
echo ""
echo "1. Home Page:        http://localhost:8080/"
echo "2. Login Page:       http://localhost:8080/login.html"
echo "3. Leaderboard:      http://localhost:8080/leaderboard.html"
echo "4. Admin Login:      http://localhost:8080/admin-login.html"
echo ""

echo "👤 CREATE NEW USER"
echo "=================="
echo ""
read -p "Enter player name: " name
read -p "Enter roll number: " roll_num

response=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"$name\",\"roll_number\":\"$roll_num\"}")

success=$(echo $response | grep -c '"success":true')

if [ $success -gt 0 ]; then
    user_id=$(echo $response | grep -o '"userId":[0-9]*' | cut -d':' -f2)
    echo ""
    echo "✅ User created successfully!"
    echo "   User ID: $user_id"
    echo "   Name: $name"
    echo "   Roll Number: $roll_num"
    echo ""
    echo "🔗 Now go to: http://localhost:8080/login.html"
    echo "   Enter Name: $name"
    echo "   Enter Roll Number: $roll_num"
    echo "   Click START CHALLENGE"
else
    echo ""
    echo "❌ Error creating user"
    echo "Response: $response"
fi

echo ""
