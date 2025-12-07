#!/bin/bash

echo "🎮 Starting Isometric RPG Development Environment..."
echo ""

# Check if .env files exist
if [ ! -f "client/.env" ]; then
  echo "⚠️  client/.env not found. Copy from client/.env.example"
fi

if [ ! -f "server/.env" ]; then
  echo "⚠️  server/.env not found. Copy from server/.env.example"
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔧 Building shared package..."
npm run build --workspace=shared

echo ""
echo "🚀 Starting development servers..."
echo "   Client: http://localhost:3000"
echo "   Server: http://localhost:2567"
echo "   Monitor: http://localhost:2567/colyseus"
echo ""

npm run dev
