#!/bin/sh
set -eu

mkdir -p \
    bootstrap/cache \
    storage/app/public \
    storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    /var/log/apache2 \
    /var/log/worker

chown -R www-data:www-data \
    bootstrap/cache \
    storage \
    /var/log/apache2 \
    /var/log/worker 2>/dev/null || true

chmod -R ug+rwX \
    bootstrap/cache \
    storage \
    /var/log/apache2 \
    /var/log/worker 2>/dev/null || true

exec "$@"
