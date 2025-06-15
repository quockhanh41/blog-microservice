@echo off
REM Batch script để reset và khởi động lại toàn bộ Docker Compose stack
REM Đảm bảo không có dữ liệu nào được lưu lại từ lần chạy trước

echo 🔄 Stopping and removing all containers...
docker-compose down --volumes --remove-orphans

echo 🧹 Cleaning up Docker system...
docker system prune -f

echo 🗑️ Removing any remaining volumes...
docker volume prune -f

echo 🚀 Starting fresh containers...
docker-compose up --build --force-recreate

echo ✅ All services started with fresh data!
