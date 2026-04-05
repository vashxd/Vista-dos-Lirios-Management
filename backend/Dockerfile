FROM php:8.4-fpm-alpine

# Instalar extensões necessárias
RUN apk add --no-cache \
    nginx \
    supervisor \
    postgresql-dev \
    libpng-dev \
    oniguruma-dev \
    libzip-dev \
    curl \
    unzip \
    && docker-php-ext-install pdo pdo_pgsql mbstring gd zip opcache

# Instalar Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copiar e instalar dependências
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

COPY . .

# Permissões
RUN chown -R www-data:www-data /app/storage /app/bootstrap/cache \
    && chmod -R 775 /app/storage /app/bootstrap/cache

# Configurar nginx
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 8080

COPY docker/start.sh /start.sh
RUN chmod +x /start.sh

CMD ["/start.sh"]
