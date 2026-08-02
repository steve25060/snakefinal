#!/bin/bash

# Snake MCQ Challenge - Startup Script
# This script starts the game server

echo "🐍 Snake MCQ Challenge - Starting Server..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Kill any existing processes on port 3000
echo "🔍 Checking for existing processes..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Port 3000 is in use. Killing existing process..."
    pkill -f "node.*server/index.js" || true
    sleep 2
fi

# Start the server
echo "🚀 Starting server..."
echo ""
npm start
