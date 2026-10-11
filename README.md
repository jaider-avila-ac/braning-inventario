# Sys Comercial — stack Docker

Monorepo con todo el sistema en un solo `docker compose`:

| Servicio   | Qué es                                   | Imagen                |
|------------|------------------------------------------|-----------------------|
| `frontend` | React (build de Vite) servido por Nginx  | `nginx:1.27-alpine`   |
| `backend`  | API Laravel 12                           | `php:8.4-apache`      |
| `db`       | Base de datos                            | `mariadb:11.8`        |

Solo se expone **un puerto** (`APP_PORT`, por defecto 80). Nginx sirve el front y reenvía
`/api`, `/sanctum` y `/storage` al backend, así que todo va por el mismo dominio (sin CORS).

```
backend/            API Laravel + Dockerfile
frontend/           React + Dockerfile + nginx.conf
database/init/      Volcado SQL que se importa la PRIMERA vez (no se sube a git)
docker-compose.yml
.env.example
```

## Desplegar en el VPS

1. Instalar Docker (Ubuntu/Debian):
   ```bash
   curl -fsSL https://get.docker.com | sh
   ```

2. Clonar el repo:
   ```bash
   git clone <URL_DEL_REPO> sys-comercial && cd sys-comercial
   ```

3. Subir el volcado de la base de datos **desde tu PC** (no va en git porque tiene datos reales):
   ```bash
   scp u358751360_comercial.sql usuario@IP_VPS:~/sys-comercial/database/init/01-comercial.sql
   ```

4. Crear el `.env`:
   ```bash
   cp .env.example .env
   docker run --rm php:8.4-cli php -r "echo 'base64:'.base64_encode(random_bytes(32)).PHP_EOL;"
   nano .env   # pegar APP_KEY, poner APP_URL=http://IP_VPS y cambiar las claves de BD
   ```

5. Levantar:
   ```bash
   docker compose up -d --build
   docker compose logs -f      # la primera vez la BD tarda ~1 min importando el volcado
   ```

6. Entrar a `http://IP_VPS`.

## Comandos útiles

```bash
docker compose ps                          # estado
docker compose logs -f backend             # logs de Laravel
docker compose exec backend php artisan …  # artisan
docker compose exec db mariadb -u root -p  # consola SQL

# Actualizar tras un git pull
git pull && docker compose up -d --build

# Backup de la base de datos
mkdir -p backups
docker compose exec db sh -c 'mariadb-dump -uroot -p"$MARIADB_ROOT_PASSWORD" "$MARIADB_DATABASE"' > backups/backup_$(date +%F).sql
```

## Notas importantes

- **El volcado solo se importa una vez**, cuando el volumen `db_data` está vacío. Para reimportar
  desde cero: `docker compose down -v` (⚠️ borra la BD y los archivos subidos) y `up -d` de nuevo.
- **Archivos subidos** (logos, comprobantes, fotos de items) viven en el volumen `storage_data`.
  Los del servidor actual (Hostinger) no vienen en el volcado; para traerlos, copiar la carpeta
  `storage/app/public` del servidor viejo y luego:
  ```bash
  docker compose cp ./public/. backend:/var/www/html/storage/app/public/
  docker compose exec backend chown -R www-data:www-data storage/app/public
  ```
- **Sesiones**: un usuario puede tener varias sesiones abiertas a la vez; cada una expira tras
  5 min de inactividad.
- **HTTPS**: cuando haya dominio, poner un proxy con certificado delante (Caddy, Nginx Proxy
  Manager o Traefik) y cambiar `APP_URL=https://…` y `SESSION_SECURE_COOKIE=true`.
- Las migraciones **no** se ejecutan solas (el volcado ya trae el esquema). Si se agrega una
  migración nueva: `docker compose exec backend php artisan migrate --force`.
