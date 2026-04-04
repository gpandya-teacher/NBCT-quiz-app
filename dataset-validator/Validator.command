#!/bin/bash

cd "$(dirname "$0")"

echo "Starting Dataset Validator..."

# Kill old Vite servers (optional but recommended)
pkill -f vite 2>/dev/null

# Start dev server and capture output
npm run dev > vite.log 2>&1 &

# Wait for server to start
sleep 3

# Extract actual port from log
PORT=$(grep -o "http://localhost:[0-9]*" vite.log | head -n 1)

echo "Opening $PORT"

# Open correct port
open "$PORT"

wait