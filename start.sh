#!/bin/bash

echo "🎴 Starting Trading Card App..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start services
echo "Starting services with Docker Compose..."
docker-compose up -d

echo ""
echo "✅ Services started successfully!"
echo ""
echo "📍 Access the application:"
echo "   - Frontend: http://localhost:5173"
echo "   - Backend API: http://localhost:3000"
echo "   - API Docs: http://localhost:3000/api"
echo ""
echo "📝 Check logs with: docker-compose logs -f"
echo "🛑 Stop with: docker-compose down"
echo ""
echo "Happy trading! 🎴"
