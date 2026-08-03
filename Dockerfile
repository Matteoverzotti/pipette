# syntax=docker/dockerfile:1

FROM node:24-alpine AS assets
WORKDIR /app

ARG VITE_APP_NAME="Pipette - Feedback Cursuri UniBuc"
ENV VITE_APP_NAME="${VITE_APP_NAME}"

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM composer:2 AS vendor
WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-interaction \
    --no-progress \
    --no-scripts \
    --optimize-autoloader \
    --prefer-dist

FROM php:8.3-apache AS app
WORKDIR /var/www/html

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libicu-dev \
        libonig-dev \
        libxml2-dev \
        libzip-dev \
        unzip \
    && docker-php-ext-install -j"$(nproc)" \
        bcmath \
        dom \
        intl \
        mbstring \
        opcache \
        pcntl \
        pdo_mysql \
        zip \
    && a2enmod headers remoteip rewrite \
    && rm -rf /var/lib/apt/lists/*

COPY docker/apache-vhost.conf /etc/apache2/sites-available/000-default.conf
RUN printf "ServerName localhost\n" > /etc/apache2/conf-available/server-name.conf \
    && a2enconf server-name

COPY . .
COPY --from=vendor /app/vendor ./vendor
COPY --from=assets /app/public/build ./public/build
COPY docker/entrypoint.sh /usr/local/bin/docker-entrypoint

RUN php artisan package:discover --ansi \
    && chmod +x /usr/local/bin/docker-entrypoint \
    && mkdir -p \
        bootstrap/cache \
        storage/app/public \
        storage/framework/cache/data \
        storage/framework/sessions \
        storage/framework/views \
        storage/logs \
        /var/log/worker \
    && chown -R www-data:www-data bootstrap/cache storage /var/log/apache2 /var/log/worker

ENTRYPOINT ["docker-entrypoint"]
CMD ["apache2-foreground"]
