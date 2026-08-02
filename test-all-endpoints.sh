#!/bin/bash

echo "🧪 TESTING ALL SNAKE MCQ API ENDPOINTS"
echo "========================================="

BASE_URL="http://localhost:3000"
PASS=0
FAIL=0

test_endpoint() {
    local name="$1"
    local method="$2"
    local url="$3"
    local headers="$4"
    local data="$5"
    local expected_key="$6"

    echo -n "Testing $name ($method $url)... "
    
    if [ "$method" = "GET" ]; then
        if [ -n "$headers" ]; then
            res=$(curl -s -X GET "$BASE_URL$url" -H "$headers")
        else
            res=$(curl -s -X GET "$BASE_URL$url")
        fi
    elif [ "$method" = "POST" ]; then
        if [ -n "$headers" ]; then
            res=$(curl -s -X POST "$BASE_URL$url" -H "Content-Type: application/json" -H "$headers" -d "$data")
        else
            res=$(curl -s -X POST "$BASE_URL$url" -H "Content-Type: application/json" -d "$data")
        fi
    elif [ "$method" = "PUT" ]; then
        if [ -n "$headers" ]; then
            res=$(curl -s -X PUT "$BASE_URL$url" -H "Content-Type: application/json" -H "$headers" -d "$data")
        else
            res=$(curl -s -X PUT "$BASE_URL$url" -H "Content-Type: application/json" -d "$data")
        fi
    elif [ "$method" = "DELETE" ]; then
        if [ -n "$headers" ]; then
            res=$(curl -s -X DELETE "$BASE_URL$url" -H "$headers")
        else
            res=$(curl -s -X DELETE "$BASE_URL$url")
        fi
    fi

    if echo "$res" | grep -q "$expected_key"; then
        echo "✅ PASS"
        ((PASS++))
    else
        echo "❌ FAIL - Output: $res"
        ((FAIL++))
    fi
}

# 1. Health
test_endpoint "Health Check" "GET" "/api/health" "" "" "Server is running"

# 2. Register Player
REG_ROLL="ROLL_$(date +%s)"
REG_RES=$(curl -s -X POST "$BASE_URL/api/auth/register" -H "Content-Type: application/json" -d "{\"name\":\"AutoTester\",\"rollNumber\":\"$REG_ROLL\"}")
TOKEN=$(echo "$REG_RES" | jq -r '.sessionToken // .data.sessionToken')
USER_ID=$(echo "$REG_RES" | jq -r '.userId // .data.userId')

if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
    echo "✅ PASS (Register Player - Token: $TOKEN, UserID: $USER_ID)"
    ((PASS++))
else
    echo "❌ FAIL (Register Player - Response: $REG_RES)"
    ((FAIL++))
fi

# 3. Auth Me
test_endpoint "Auth Me" "GET" "/api/auth/me" "X-Session-Token: $TOKEN" "" "AutoTester"

# 4. Auth Login
LOGIN_RES=$(curl -s -X POST "$BASE_URL/api/auth/login" -H "Content-Type: application/json" -d "{\"rollNumber\":\"$REG_ROLL\"}")
TOKEN=$(echo "$LOGIN_RES" | jq -r '.sessionToken // .data.sessionToken')

if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
    echo "✅ PASS (Auth Login - Updated Token: $TOKEN)"
    ((PASS++))
else
    echo "❌ FAIL (Auth Login - Response: $LOGIN_RES)"
    ((FAIL++))
fi

# 5. Quiz Questions List
test_endpoint "Quiz Questions List" "GET" "/api/quiz/questions" "" "" "questions"

# 6. Single Question
Q_RES=$(curl -s -X GET "$BASE_URL/api/quiz/question/1" -H "X-Session-Token: $TOKEN")
Q_ID=$(echo "$Q_RES" | jq -r '.data.question.id // empty')
if [ -n "$Q_ID" ] && [ "$Q_ID" != "null" ]; then
    echo "✅ PASS (Get Question 1 - Q_ID: $Q_ID)"
    ((PASS++))
else
    echo "❌ FAIL (Get Question 1 - Response: $Q_RES)"
    ((FAIL++))
fi

# 7. Answer Question
test_endpoint "Submit Answer" "POST" "/api/quiz/answer" "X-Session-Token: $TOKEN" "{\"questionId\":$Q_ID,\"selectedOption\":\"A\",\"timeTaken\":5}" "success"

# 8. Skip Question (use another valid question ID)
Q2_RES=$(curl -s -X GET "$BASE_URL/api/quiz/question/2" -H "X-Session-Token: $TOKEN")
Q2_ID=$(echo "$Q2_RES" | jq -r '.data.question.id // empty')
test_endpoint "Skip Question" "POST" "/api/quiz/skip" "X-Session-Token: $TOKEN" "{\"questionId\":$Q2_ID}" "Question skipped"

# 9. Quiz Stats
test_endpoint "Quiz Stats" "GET" "/api/quiz/stats" "X-Session-Token: $TOKEN" "" "questionsAnswered"

# 10. Complete Quiz
test_endpoint "Complete Quiz" "POST" "/api/quiz/complete" "X-Session-Token: $TOKEN" "" "Game completed"

# 11. Auth Logout
test_endpoint "Auth Logout" "POST" "/api/auth/logout" "X-Session-Token: $TOKEN" "" "Logged out"

# 12. Leaderboard
test_endpoint "Leaderboard List" "GET" "/api/leaderboard" "" "" "data"

# 13. Leaderboard Top 10
test_endpoint "Leaderboard Top 10" "GET" "/api/leaderboard/top/10" "" "" "players"

# 14. Leaderboard Stats
test_endpoint "Leaderboard Stats" "GET" "/api/leaderboard/stats" "" "" "totalPlayers"

# 15. Leaderboard Player Rank
test_endpoint "Leaderboard Player" "GET" "/api/leaderboard/player/$USER_ID" "" "" "rank"

# 16. Admin Login
test_endpoint "Admin Login" "POST" "/api/admin/login" "" "{\"username\":\"admin\",\"password\":\"admin123\"}" "admin"

# 17. Admin Stats
test_endpoint "Admin Stats" "GET" "/api/admin/stats" "" "" "participantStats"

# 18. Admin Dashboard
test_endpoint "Admin Dashboard" "GET" "/api/admin/dashboard" "" "" "topScorers"

# 19. Admin Questions
test_endpoint "Admin Questions" "GET" "/api/admin/questions" "" "" "questions"

# 20. Admin Add Question
ADD_Q_RES=$(curl -s -X POST "$BASE_URL/api/admin/questions" -H "Content-Type: application/json" -d '{"language":"python","questionText":"Test Question?","optionA":"1","optionB":"2","optionC":"3","optionD":"4","correctOption":"A"}')
NEW_Q_ID=$(echo "$ADD_Q_RES" | jq -r '.questionId')
if [ -n "$NEW_Q_ID" ] && [ "$NEW_Q_ID" != "null" ]; then
    echo "✅ PASS (Admin Add Question - ID: $NEW_Q_ID)"
    ((PASS++))
else
    echo "❌ FAIL (Admin Add Question - Response: $ADD_Q_RES)"
    ((FAIL++))
fi

# 21. Admin Update Question
test_endpoint "Admin Update Question" "PUT" "/api/admin/questions/$NEW_Q_ID" "" '{"language":"python","questionText":"Updated Question?","optionA":"1","optionB":"2","optionC":"3","optionD":"4","correctOption":"B","isActive":true}' "successfully"

# 22. Admin Delete Question
test_endpoint "Admin Delete Question" "DELETE" "/api/admin/questions/$NEW_Q_ID" "" "" "successfully"

# 23. Admin Players List
test_endpoint "Admin Players" "GET" "/api/admin/players" "" "" "players"

# 24. Admin Participants List
test_endpoint "Admin Participants" "GET" "/api/admin/participants" "" "" "participants"

# 25. Admin Delete Player
test_endpoint "Admin Delete Player" "DELETE" "/api/admin/players/$USER_ID" "" "" "successfully"

echo ""
echo "========================================="
echo "RESULTS: $PASS PASSED, $FAIL FAILED"
echo "========================================="

