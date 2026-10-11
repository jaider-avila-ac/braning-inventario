#!/bin/sh
set -e
cd /var/www/html

# Estructura de storage (el volumen puede venir vacío)
mkdir -p storage/app/public storage/app/private storage/framework/cache storage/framework/sessions storage/framework/views storage/logs
chown -R www-data:www-data storage bootstrap/cache

php artisan storage:link --force >/dev/null 2>&1 || true
php artisan config:cache
php artisan route:cache
php artisan view:cache || true

exec "$@"
