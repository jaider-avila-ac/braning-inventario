# ---------- Dependencias PHP ----------
FROM composer:2 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --ignore-platform-reqs
COPY . .
RUN composer dump-autoload --optimize --no-dev --no-scripts

# ---------- Imagen final: PHP 8.4 + Apache ----------
FROM php:8.4-apache

RUN apt-get update && apt-get install -y --no-install-recommends \
        libzip-dev libpng-dev libjpeg62-turbo-dev libfreetype6-dev libicu-dev unzip \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" pdo_mysql zip gd intl bcmath exif opcache \
    && a2enmod rewrite headers \
    && rm -rf /var/lib/apt/lists/*

COPY docker/php.ini /usr/local/etc/php/conf.d/zz-app.ini
COPY docker/apache.conf /etc/apache2/sites-available/000-default.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh

WORKDIR /var/www/html
COPY --from=vendor /app /var/www/html

RUN php artisan package:discover --ansi \
    && chown -R www-data:www-data storage bootstrap/cache \
    && sed -i 's/\r$//' /usr/local/bin/entrypoint.sh \
    && chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 80
ENTRYPOINT ["entrypoint.sh"]
CMD ["apache2-foreground"]
