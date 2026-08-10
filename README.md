# Pipette

<p align="center">
    <img src="https://tenor.com/bT0w6.gif" alt="Walter White Cooking GIF">
</p>

<p align="center">

<img src="https://img.shields.io/badge/live-pipette.matteoverz.xyz-2ea44f" alt="deployment pipette.matteoverz.xyz">
<img src="https://img.shields.io/badge/PHP-8.3%2B-777BB4?logo=php&logoColor=white" alt="PHP 8.3+">
<img src="https://img.shields.io/badge/Laravel-13-FF2D20?logo=laravel&logoColor=white" alt="Laravel 13">
<img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=0B1020" alt="React 19">
<img src="https://img.shields.io/badge/license-MIT-green" alt="MIT License">
</p>

Pipette is a UniBuc course feedback app developed by the need to choose which optional courses I should pick in the next year. The purpose of the app is not to replace the anonymous student feedback, but to reduce the burden of asking the ducks for guidance.

Students sign in with their institutional email, browse courses, leave anonymous course feedback, vote on useful reviews, and report content that needs moderation. Admins can manage the course catalog and moderate feedback.

>[!IMPORTANT]
> The website, although anonymous to regular users, is moderated. Any content considered damaging to the University or its staff will be removed, and the user will be banned. More details can be found on the [rules page](https://pipette.matteoverz.xyz/rules).


For any problems you encounter, please open an issue or contact me via the email address on the website.

## Local Setup

Install PHP, Composer, Node.js, and npm, then install dependencies:

```bash
composer install
npm install
```

Create the environment file and app key:

```bash
cp .env.example .env
php artisan key:generate
```

For a quick local SQLite setup, create the database file and set `DB_CONNECTION=sqlite` in `.env`:

```bash
touch database/database.sqlite
```

Run migrations and seed demo data:

```bash
php artisan migrate --seed
```

Start the backend and frontend in separate terminals:

```bash
php artisan serve
npm run dev
```

The app will be available at `http://127.0.0.1:8000`.

## Docker

The repository includes a production-oriented Docker Compose setup:

- `app`: Apache + Laravel, exposed on `127.0.0.1:${APP_PORT:-8080}`.
- `worker`: database queue worker.
- `db`: MySQL 8.4 backed by the `mysql-data` volume.

Create a Docker environment file:

```bash
cp .env.production.example .env
```

Fill in `APP_URL`, `APP_KEY`, database passwords, SMTP credentials, and `UNIBUC_ADMIN_EMAILS`. To generate an app key:

```bash
docker compose run --rm app php artisan key:generate --show
```

Create the mounted runtime directories:

```bash
mkdir -p runtime/logs/laravel runtime/logs/apache runtime/logs/worker runtime/storage/app/public
```

Build and start the stack:

```bash
docker compose build
docker compose up -d
docker compose run --rm app php artisan migrate --force
docker compose run --rm app php artisan storage:link
```

By default, Docker serves the app at `http://127.0.0.1:8080`. Change `APP_PORT` in `.env` to use another host port. For more information about production builds, check [DEPLOYMENT.md](DEPLOYMENT.md).

## Email Login

Local mail defaults to the log driver. When you request a login code, read it from:

```bash
tail -f storage/logs/laravel.log
```

Useful environment variables:

```env
UNIBUC_ADMIN_EMAILS="admin@s.unibuc.ro"
UNIBUC_LOGIN_CODE_MINUTES=10
```

Only `s.unibuc.ro` email addresses are accepted.

## Quality Checks

Run the test suite:

```bash
php artisan test
```

Build production assets:

```bash
npm run build
```

## License

Pipette is open-sourced under the [MIT license](LICENSE).

## FAQ

### Why the name Pipette?

It's an instrument used to pick things meticulously. Like... _courses_. Also I couldn't stop thinking about the Walter White meme.

### Why PHP?

Because I can. Show some love to the second year course. $$$ for the win.

### Were AI tools involved in the building of this project?

Yes.

### What faculties are included?

Currently only FMI. I'm planning on adding others if I get good feedback and don't get sued by the University. [_Or worse, expelled._](https://www.youtube.com/watch?v=P76rU-C4pXg)