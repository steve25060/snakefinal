#!/bin/bash

# Quick User Management Script

API="http://localhost:3000/api"

echo "🐍 SNAKE MCQ CHALLENGE - Quick User Manager"
echo "==========================================="
echo ""
echo "1. Create New User"
echo "2. View All Users"
echo "3. Test Login"
echo ""

read -p "Choose option (1-3): " option

case $option in
  1)
    read -p "Enter player name: " name
    read -p "Enter roll number: " roll_number
    
    echo ""
    echo "Creating user: $name ($roll_number)"
    
    curl -s -X POST $API/auth/register \
      -H "Content-Type: application/json" \
      -d "{\"name\":\"$name\",\"roll_number\":\"$roll_number\"}" | jq '.'
    ;;
  
  2)
    echo ""
    echo "All Users:"
    psql -h localhost -U postgres -d snake_mcq -c "SELECT id, name, roll_number FROM users;" 2>/dev/null
    ;;
  
  3)
    read -p "Enter player name to login: " name
    read -p "Enter roll number: " roll_number
    
    echo ""
    echo "Logging in: $name ($roll_number)"
    
    curl -s -X POST $API/auth/login \
      -H "Content-Type: application/json" \
      -d "{\"name\":\"$name\",\"roll_number\":\"$roll_number\"}" | jq '.data | {userId, name, rollNumber, token: (.token | .[0:20] + "...")}'
    ;;
  
  *)
    echo "Invalid option"
    ;;
esac

echo ""
