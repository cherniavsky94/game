#!/bin/bash

# Kill existing processes
pkill -f "vite --host" 2>/dev/null
pkill -f "tsx watch" 2>/dev/null
sleep 2

# Start server
cd /workspaces/game/server
npm run dev > /tmp/server.log 2>&1 &
echo "Server starting on port 2567..."

# Start client
cd /workspaces/game/client
npm run dev > /tmp/client.log 2>&1 &
echo "Client starting on port 3000..."

sleep 5

# Check status
if lsof -i :2567 > /dev/null 2>&1; then
  echo "✅ Server running"
else
  echo "❌ Server failed"
fi

if lsof -i :3000 > /dev/null 2>&1; then
  echo "✅ Client running"
else
  echo "❌ Client failed"
fi

echo ""
echo "Logs: tail -f /tmp/server.log /tmp/client.log"
