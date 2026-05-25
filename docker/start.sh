#!/bin/bash
umask 022

echo "========================================"
echo "  FruityPOS - Starting Application"
echo "========================================"

# 1. Transform nginx config from Nixpacks template
echo "[start.sh] Configuring Nginx..."
node /assets/scripts/prestart.mjs /assets/nginx.template.conf /etc/nginx.conf

# 2. Ensure storage directories exist with correct permissions
echo "[start.sh] Setting up storage directories..."
mkdir -p /app/storage/framework/{sessions,views,cache}
mkdir -p /app/storage/logs
chmod -R 777 /app/storage /app/bootstrap/cache

# 3. Run Laravel optimizations (config/route/view caching)
echo "[start.sh] Running Laravel optimizations..."
cd /app
php artisan optimize
php artisan view:cache
php artisan event:cache

# 4. Run database migrations
echo "[start.sh] Running database migrations..."
php artisan migrate --force

# 5. Ensure storage link exists
echo "[start.sh] Recreating storage symlink..."
rm -rf /app/public/storage
php artisan storage:link


echo "[start.sh] Starting Supervisord (web + queue + nightwatch)..."

# 6. Start supervisord in foreground (PID 1)
exec supervisord -c /etc/supervisord.conf -n
