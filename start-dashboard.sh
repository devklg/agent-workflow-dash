#!/bin/bash

echo "🚀 Prometheus Agent Dashboard - Quick Start"
echo "==========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✓ Node.js detected: $(node --version)"
echo ""

# Navigate to client directory
cd client

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔄 Copying Claude Dashboard components..."
npm run copy-claude-components

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the dashboard:"
echo "  cd client"
echo "  npm start"
echo ""
echo "Dashboard will be available at http://localhost:3000"
echo ""
echo "Make sure your Docker services are running:"
echo "  docker-compose up -d"
echo ""
echo "Services should be available at:"
echo "  - MongoDB: localhost:27018"
echo "  - Redis: localhost:6379"
echo "  - RabbitMQ: localhost:15672"
echo "  - Backend API: localhost:5000"
echo "  - Grafana: localhost:3000 (if configured)"
