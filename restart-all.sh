#!/bin/bash

echo "🛑 Stopping all services..."
pkill -f "vite" 2>/dev/null
pkill -f "tsx" 2>/dev/null
pkill -f "npm run dev" 2>/dev/null
sleep 2

echo "🧹 Cleaning up..."
rm -f /tmp/client.log /tmp/server.log

echo "🚀 Starting client on port 3000..."
cd /workspaces/game/client && npm run dev > /tmp/client.log 2>&1 &
CLIENT_PID=$!

echo "🚀 Starting server on port 2567..."
cd /workspaces/game/server && npm run dev > /tmp/server.log 2>&1 &
SERVER_PID=$!

echo "⏳ Waiting for services to start..."
sleep 8

echo ""
echo "📊 Status:"
if lsof -i :3000 > /dev/null 2>&1; then
  echo "✅ Client running on port 3000"
else
  echo "❌ Client failed to start"
  echo "Client logs:"
  tail -10 /tmp/client.log
fi

if lsof -i :2567 > /dev/null 2>&1; then
  echo "✅ Server running on port 2567"
else
  echo "❌ Server failed to start"
  echo "Server logs:"
  tail -10 /tmp/server.log
fi

echo ""
echo "📝 View logs:"
echo "   tail -f /tmp/client.log"
echo "   tail -f /tmp/server.log"
echo ""
echo "🌐 Access via Ports panel in Gitpod/VS Code"
