# Docker VPS Deployment

## Server Setup

Install Docker Engine and the Compose plugin, then clone the repository:

```bash
sudo mkdir -p /opt/ubfeedback
sudo chown "$USER":"$USER" /opt/ubfeedback
git clone <repo-url> /opt/ubfeedback
cd /opt/ubfeedback
```

Create persistent runtime directories:

```bash
mkdir -p runtime/logs/laravel runtime/logs/apache runtime/logs/worker runtime/storage/app/public
```

Copy `.env.production.example` to `.env`, then fill in `APP_URL`, `APP_KEY`, database passwords, SMTP credentials, and `UNIBUC_ADMIN_EMAILS`.

For Resend SMTP on port 587, use `MAIL_SCHEME=smtp`, `MAIL_USERNAME=resend`, `MAIL_PASSWORD` as the Resend API key, and set `MAIL_FROM_ADDRESS` to an address under a domain verified in Resend. Do not use a domain you do not own, such as `noreply@pipette.com`.

For one-off validation against a different env file, set `APP_ENV_FILE`, for example:

```bash
APP_ENV_FILE=.env.production.example docker compose --env-file .env.production.example config
```

Generate an app key if you do not already have one:

```bash
docker compose run --rm app php artisan key:generate --show
```

Paste the generated value into `APP_KEY` in `.env`.

## First Deploy

```bash
docker compose build
docker compose up -d db
docker compose up -d
docker compose run --rm app php artisan migrate --force
docker compose run --rm app php artisan storage:link
docker compose exec app php artisan optimize
```

Configure the existing Cloudflare Tunnel public hostname to use:

```text
http://localhost:8080
```

The app publishes only `127.0.0.1:${APP_PORT:-8080}:80`; MySQL is not published on the host.

## Updates

```bash
git pull
docker compose build
docker compose up -d --remove-orphans
docker compose run --rm app php artisan migrate --force
docker compose exec app php artisan optimize
docker compose exec app php artisan queue:restart
```

## Logs

Logs are written under `runtime/logs` on the VPS:

```text
runtime/logs/laravel
runtime/logs/apache
runtime/logs/worker/worker.log
```

## Checks

```bash
docker compose ps
curl http://127.0.0.1:8080/up
ls -la runtime/logs/laravel runtime/logs/apache runtime/logs/worker
```

## Database Backup

Create a directory outside the Docker volume and run a dump:

```bash
mkdir -p backups
docker compose exec db sh -c 'mysqldump -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"' \
  | gzip > "backups/ubfeedback-$(date +%F-%H%M%S).sql.gz"
```

Schedule that command with cron or a systemd timer, and periodically test a restore before relying on the backups.
