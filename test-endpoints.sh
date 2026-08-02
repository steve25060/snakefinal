#!/bin/bash

echo "🧪 Testing Snake MCQ Challenge API Endpoints"
echo "=============================================="
echo ""

BASE_URL="http://localhost:3000"

echo "1️⃣  Health Check"
curl -s $BASE_URL/api/health | jq . 2>/dev/null || echo "Failed"
echo ""

echo "2️⃣  Player Registration"
REGISTER=$(curl -s -X POST $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Player '$(date +%s)'","rollNumber":"TESTID'$(date +%s%N | tail -c 4)'"}')
echo "$REGISTER" | jq .
SESSION_TOKEN=$(echo "$REGISTER" | jq -r '.sessionToken')
echo "Session Token: $SESSION_TOKEN"
echo ""

echo "3️⃣  Admin Login"
ADMIN_LOGIN=$(curl -s -X POST $BASE_URL/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')
echo "$ADMIN_LOGIN" | jq .
echo ""

echo "4️⃣  Get Questions"
curl -s -H "Cookie: session=$SESSION_TOKEN" $BASE_URL/api/quiz/questions | jq '.questions | length'
echo ""

echo "5️⃣  Get Top Leaderboard"
curl -s $BASE_URL/api/leaderboard/top/10 | jq '.players | length'
echo ""

echo "6️⃣  Get Admin Stats"
curl -s -H "Cookie: session=$SESSION_TOKEN" $BASE_URL/api/admin/stats | jq . 2>/dev/null || echo "Admin auth required"
echo ""

echo "✅ Test Complete!"
