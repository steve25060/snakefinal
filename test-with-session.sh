#!/bin/bash

BASE_URL="http://localhost:3000"
COOKIES="/tmp/cookies.txt"

echo "🧪 Testing with Session Cookies"
echo "=================================="
echo ""

# Register player
echo "1️⃣ Register Player"
REGISTER=$(curl -s -c $COOKIES -b $COOKIES -X POST $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"SessionTest","rollNumber":"SESSION'$(date +%s%N | tail -c 8)'"}')
echo "$REGISTER" | jq .
echo ""

# Get questions
echo "2️⃣ Get Questions"
QUESTIONS=$(curl -s -c $COOKIES -b $COOKIES $BASE_URL/api/quiz/questions)
echo "$QUESTIONS" | jq '.questions | length' && echo "Questions retrieved!"
echo ""

# Show first question
echo "3️⃣ First Question:"
echo "$QUESTIONS" | jq '.questions[0]' 2>/dev/null || echo "No questions"
echo ""

# Get leaderboard
echo "4️⃣ Get Leaderboard (Top 10)"
curl -s $BASE_URL/api/leaderboard/top/10 | jq '.players | length'
echo ""

echo "✅ Session Tests Complete!"
