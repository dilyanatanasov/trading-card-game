@echo off
echo 🎴 Starting Trading Card App...
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker first.
    exit /b 1
)

REM Start services
echo Starting services with Docker Compose...
docker-compose up -d

echo.
echo ✅ Services started successfully!
echo.
echo 📍 Access the application:
echo    - Frontend: http://localhost:5173
echo    - Backend API: http://localhost:3000
echo    - API Docs: http://localhost:3000/api
echo.
echo 📝 Check logs with: docker-compose logs -f
echo 🛑 Stop with: docker-compose down
echo.
echo Happy trading! 🎴
pause
