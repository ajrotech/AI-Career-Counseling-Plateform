#!/bin/bash

echo "===================================="
echo "Career Counseling Platform Startup"
echo "===================================="

echo ""
echo "Checking for existing processes..."

# Kill any existing processes on ports 3000 and 3001
echo "Stopping any existing processes..."

# Find and kill processes on port 3001
PORT_3001_PID=$(lsof -ti:3001)
if [ ! -z "$PORT_3001_PID" ]; then
    echo "Killing process on port 3001: $PORT_3001_PID"
    kill -9 $PORT_3001_PID
fi

# Find and kill processes on port 3000
PORT_3000_PID=$(lsof -ti:3000)
if [ ! -z "$PORT_3000_PID" ]; then
    echo "Killing process on port 3000: $PORT_3000_PID"
    kill -9 $PORT_3000_PID
fi

echo ""
echo "Starting Career Counseling Platform..."

# Get the directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Start backend in background
echo "Starting Backend API on port 3001..."
cd "$DIR/backend"
npm start &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend in background
echo "Starting Frontend on port 3000..."
cd "$DIR/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "===================================="
echo "Platform is running!"
echo "===================================="
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:3001"
echo "API Docs: http://localhost:3001/api/docs"
echo "===================================="
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user to stop
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
wait