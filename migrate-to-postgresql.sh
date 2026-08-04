#!/bin/bash

# PostgreSQL Migration Script for Snake MCQ Challenge
# This script migrates from SQLite to PostgreSQL

set -e

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║  🐘 POSTGRESQL MIGRATION SCRIPT                              ║"
echo "║  SQLite → PostgreSQL for Snake MCQ Challenge                 ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Configuration
DB_NAME="snake_mcq_game"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"
SQLITE_FILE="./snake_mcq.db"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "📋 Step 1: Checking prerequisites..."

# Check if SQLite database exists
if [ ! -f "$SQLITE_FILE" ]; then
    echo -e "${RED}❌ SQLite database not found: $SQLITE_FILE${NC}"
    exit 1
fi
echo -e "${GREEN}✅ SQLite database found${NC}"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ PostgreSQL installed${NC}"

echo ""
echo "📋 Step 2: Creating PostgreSQL database..."

# Create database (might fail if exists, that's okay)
psql -h $DB_HOST -U $DB_USER -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || psql -h $DB_HOST -U $DB_USER -c "CREATE DATABASE $DB_NAME"
echo -e "${GREEN}✅ PostgreSQL database ready${NC}"

echo ""
echo "📋 Step 3: Creating PostgreSQL schema..."

# Create schema
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f ./database/schema-postgresql.sql > /dev/null 2>&1
echo -e "${GREEN}✅ Schema created${NC}"

echo ""
echo "📋 Step 4: Migrating data from SQLite..."

# Export data from SQLite and import to PostgreSQL
# We'll use a Python script for this as it's more reliable

python3 << 'PYTHON_SCRIPT'
import sqlite3
import psycopg2
from psycopg2.extras import execute_values
import sys

# Database connections
sqlite_conn = sqlite3.connect('./snake_mcq.db')
sqlite_cursor = sqlite_conn.cursor()

try:
    pg_conn = psycopg2.connect(
        host="localhost",
        database="snake_mcq_game",
        user="postgres",
        password="postgres"
    )
    pg_cursor = pg_conn.cursor()
    print("✅ Connected to PostgreSQL")
except Exception as e:
    print(f"❌ Could not connect to PostgreSQL: {e}")
    print("Make sure PostgreSQL is running and credentials are correct")
    sys.exit(1)

try:
    # Migrate users
    print("Migrating users...")
    sqlite_cursor.execute("SELECT * FROM users")
    users = sqlite_cursor.fetchall()
    
    for user in users:
        pg_cursor.execute("""
            INSERT INTO users (id, name, class, roll_number, session_token, score, 
                             correct_answers, wrong_answers, skipped_answers, 
                             game_status, total_time_seconds, completed_at, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO NOTHING
        """, user)
    
    pg_conn.commit()
    print(f"✅ Migrated {len(users)} users")
    
    # Migrate questions
    print("Migrating questions...")
    sqlite_cursor.execute("SELECT * FROM questions")
    questions = sqlite_cursor.fetchall()
    
    for q in questions:
        pg_cursor.execute("""
            INSERT INTO questions (id, language, question_text, option_a, option_b, 
                                 option_c, option_d, correct_option, is_active, 
                                 difficulty_level, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO NOTHING
        """, q)
    
    pg_conn.commit()
    print(f"✅ Migrated {len(questions)} questions")
    
    # Migrate game sessions
    print("Migrating game sessions...")
    sqlite_cursor.execute("SELECT * FROM game_sessions")
    sessions = sqlite_cursor.fetchall()
    
    for session in sessions:
        pg_cursor.execute("""
            INSERT INTO game_sessions (id, user_id, session_token, current_question_number,
                                     score, correct_answers, wrong_answers, skipped_answers,
                                     game_status, started_at, completed_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO NOTHING
        """, session)
    
    pg_conn.commit()
    print(f"✅ Migrated {len(sessions)} game sessions")
    
    # Migrate player answers
    print("Migrating player answers...")
    sqlite_cursor.execute("SELECT * FROM player_answers")
    answers = sqlite_cursor.fetchall()
    
    for answer in answers:
        pg_cursor.execute("""
            INSERT INTO player_answers (id, session_id, question_id, question_number,
                                      selected_option, correct_option, is_correct, result_type,
                                      points_awarded, reading_time_taken, reading_bonus_points,
                                      snake_size_at_question, snake_speed_at_question,
                                      board_size_at_question, answered_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO NOTHING
        """, answer)
    
    pg_conn.commit()
    print(f"✅ Migrated {len(answers)} player answers")
    
    print("\n✅ All data migrated successfully!")
    
except Exception as e:
    print(f"❌ Migration error: {e}")
    pg_conn.rollback()
    sys.exit(1)

finally:
    sqlite_cursor.close()
    sqlite_conn.close()
    pg_cursor.close()
    pg_conn.close()

PYTHON_SCRIPT

echo ""
echo "📋 Step 5: Updating server configuration..."
echo "   → Update server/.env with PostgreSQL settings"
echo "   → Update database connection code"

echo ""
echo "════════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ PostgreSQL Migration Complete!${NC}"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Next steps:"
echo "1. Update server/.env:"
echo "   DB_HOST=localhost"
echo "   DB_PORT=5432"
echo "   DB_USER=postgres"
echo "   DB_PASSWORD=postgres"
echo "   DB_NAME=snake_mcq_game"
echo ""
echo "2. Install PostgreSQL package:"
echo "   npm install pg"
echo ""
echo "3. Update server/db.js to use PostgreSQL"
echo ""
echo "4. Restart the server"
echo ""
