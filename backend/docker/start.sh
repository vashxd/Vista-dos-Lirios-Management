#!/bin/sh
set -e

echo "==> Rodando migrations..."
php artisan migrate --force

echo "==> Rodando seed (apenas se banco vazio)..."
php artisan db:seed --force 2>/dev/null || true

echo "==> Limpando cache..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "==> Storage link..."
php artisan storage:link 2>/dev/null || true

echo "==> Iniciando serviços..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
