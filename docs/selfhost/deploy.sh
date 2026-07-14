#!/usr/bin/env bash
# HealthOS 24 — one-command self-host bootstrap
# Usage:  sudo bash deploy.sh              # interactive (prompts for domain/email)
#         sudo DOMAIN=healthos24.com EMAIL=ops@healthos24.com bash deploy.sh
#
# What it does, in order:
#   1. Hardens the VPS (ufw, fail2ban, unattended-upgrades, ssh)
#   2. Installs Docker + Compose plugin
#   3. Lays out /opt/healthos, unpacks healthos-api.zip if present
#   4. Generates .env with strong random secrets
#   5. Issues Let's Encrypt certs for api/app/s3 subdomains
#   6. Renders docker-compose.yml + nginx.conf if missing
#   7. Brings up postgres, pgbouncer, redis, minio, api, nginx
#   8. Applies compat shim + schema + seeds
#   9. Creates MinIO buckets
#  10. Runs a health-check and prints next steps
#
# Idempotent: rerunning skips work already done.
set -Eeuo pipefail
trap 'echo "[deploy] FAILED at line $LINENO"; exit 1' ERR

log()  { printf "\e[1;36m[deploy]\e[0m %s\n" "$*"; }
warn() { printf "\e[1;33m[deploy]\e[0m %s\n" "$*"; }
need_root() { [[ $EUID -eq 0 ]] || { echo "run with sudo"; exit 1; }; }

need_root

# ─── 0. Inputs ────────────────────────────────────────────────────────────────
: "${DOMAIN:=}"; : "${EMAIL:=}"; : "${TIMEZONE:=Asia/Riyadh}"
: "${INSTALL_DIR:=/opt/healthos}"
: "${SCAFFOLD_ZIP:=/root/healthos-api.zip}"
: "${SKIP_TLS:=0}"          # set 1 for staging / IP-only installs
: "${POSTGRES_VERSION:=16-alpine}"

if [[ -z "$DOMAIN" ]]; then read -rp "Root domain (e.g. healthos24.com): " DOMAIN; fi
if [[ -z "$EMAIL"  ]]; then read -rp "Ops email for Let's Encrypt: "        EMAIL;  fi

API_HOST="api.${DOMAIN}"
APP_HOST="app.${DOMAIN}"
S3_HOST="s3.${DOMAIN}"

log "domain=$DOMAIN  api=$API_HOST  app=$APP_HOST  s3=$S3_HOST  tz=$TIMEZONE"

# ─── 1. Harden ────────────────────────────────────────────────────────────────
log "step 1/10 — hardening OS"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get -y -qq upgrade
apt-get -y -qq install ufw fail2ban unattended-upgrades curl git ca-certificates \
  gnupg jq htop unzip openssl rsync cron
timedatectl set-timezone "$TIMEZONE" || true
timedatectl set-ntp true || true

ufw --force reset >/dev/null
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp && ufw allow 80/tcp && ufw allow 443/tcp
ufw --force enable

sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config
sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/'   /etc/ssh/sshd_config
systemctl restart ssh || systemctl restart sshd || true
systemctl enable --now fail2ban unattended-upgrades

# ─── 2. Docker ────────────────────────────────────────────────────────────────
if ! command -v docker >/dev/null 2>&1; then
  log "step 2/10 — installing Docker"
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
  . /etc/os-release
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
    https://download.docker.com/linux/ubuntu ${VERSION_CODENAME} stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -qq
  apt-get -y -qq install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
else
  log "step 2/10 — Docker already installed ($(docker --version))"
fi
systemctl enable --now docker

# ─── 3. Layout ────────────────────────────────────────────────────────────────
log "step 3/10 — laying out $INSTALL_DIR"
mkdir -p "$INSTALL_DIR"/{data/postgres,data/redis,data/minio,data/backups,logs,nginx/certs,db/seeds,web}
cd "$INSTALL_DIR"

if [[ -f "$SCAFFOLD_ZIP" && ! -d "$INSTALL_DIR/api" ]]; then
  log "unpacking scaffold $SCAFFOLD_ZIP"
  unzip -q "$SCAFFOLD_ZIP" -d "$INSTALL_DIR"
fi

# ─── 4. .env ──────────────────────────────────────────────────────────────────
if [[ ! -f "$INSTALL_DIR/.env" ]]; then
  log "step 4/10 — generating .env with random secrets"
  JWT_SECRET=$(openssl rand -hex 32)
  SESSION_SECRET=$(openssl rand -hex 32)
  POSTGRES_PASSWORD=$(openssl rand -hex 24)
  MINIO_ROOT_PASSWORD=$(openssl rand -hex 24)
  S3_SECRET_KEY=$(openssl rand -hex 24)

  cat > "$INSTALL_DIR/.env" <<EOF
NODE_ENV=production
API_PORT=3000
PUBLIC_API_URL=https://${API_HOST}
PUBLIC_APP_URL=https://${APP_HOST}

POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=healthos
POSTGRES_USER=healthos
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
DATABASE_URL=postgresql://healthos:${POSTGRES_PASSWORD}@pgbouncer:6432/healthos?schema=public
DIRECT_URL=postgresql://healthos:${POSTGRES_PASSWORD}@postgres:5432/healthos

JWT_SECRET=${JWT_SECRET}
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=30d
BCRYPT_ROUNDS=10
SESSION_SECRET=${SESSION_SECRET}

REDIS_URL=redis://redis:6379

S3_ENDPOINT=https://${S3_HOST}
S3_REGION=me-south-1
S3_ACCESS_KEY=healthos
S3_SECRET_KEY=${S3_SECRET_KEY}
MINIO_ROOT_USER=healthos
MINIO_ROOT_PASSWORD=${MINIO_ROOT_PASSWORD}
S3_BUCKET_UPLOADS=uploads
S3_BUCKET_INVOICES=invoices
S3_BUCKET_LAB=lab-results
S3_BUCKET_RADIOLOGY=radiology
S3_BUCKET_PATIENT_DOCS=patient-docs

# Fill in before go-live:
NPHIES_BASE_URL=
NPHIES_CLIENT_ID=
NPHIES_CLIENT_SECRET=
ZATCA_CSID=
ZATCA_PRIVATE_KEY_PEM=
WASFATY_API_KEY=
NAFATH_APP_ID=
NAFATH_SECRET=
TATMEEN_API_KEY=
WHATSAPP_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
SMTP_HOST=
SMTP_USER=
SMTP_PASS=
DEEPSEEK_API_KEY=
ELEVENLABS_API_KEY=
HEYGEN_API_KEY=
EOF
  chmod 600 "$INSTALL_DIR/.env"
else
  log "step 4/10 — reusing existing .env"
fi
set -a; . "$INSTALL_DIR/.env"; set +a

# ─── 5. TLS ───────────────────────────────────────────────────────────────────
if [[ "$SKIP_TLS" != "1" ]]; then
  log "step 5/10 — issuing Let's Encrypt certs"
  apt-get -y -qq install certbot
  if [[ ! -f /etc/letsencrypt/live/${API_HOST}/fullchain.pem ]]; then
    # Free 80/443 briefly
    docker stop healthos-nginx 2>/dev/null || true
    certbot certonly --standalone --non-interactive --agree-tos -m "$EMAIL" \
      -d "$API_HOST" -d "$APP_HOST" -d "$S3_HOST"
  fi
  cp -L /etc/letsencrypt/live/${API_HOST}/fullchain.pem "$INSTALL_DIR/nginx/certs/fullchain.pem"
  cp -L /etc/letsencrypt/live/${API_HOST}/privkey.pem   "$INSTALL_DIR/nginx/certs/privkey.pem"

  cat > /etc/cron.d/certbot-healthos <<EOF
0 3 * * * root certbot renew --quiet --deploy-hook "cp -L /etc/letsencrypt/live/${API_HOST}/fullchain.pem ${INSTALL_DIR}/nginx/certs/fullchain.pem && cp -L /etc/letsencrypt/live/${API_HOST}/privkey.pem ${INSTALL_DIR}/nginx/certs/privkey.pem && docker exec healthos-nginx nginx -s reload"
EOF
else
  log "step 5/10 — TLS skipped (SKIP_TLS=1); generating self-signed"
  if [[ ! -f "$INSTALL_DIR/nginx/certs/fullchain.pem" ]]; then
    openssl req -x509 -nodes -newkey rsa:2048 -days 365 \
      -keyout "$INSTALL_DIR/nginx/certs/privkey.pem" \
      -out    "$INSTALL_DIR/nginx/certs/fullchain.pem" \
      -subj "/CN=${API_HOST}"
  fi
fi

# ─── 6. docker-compose.yml + nginx.conf (only if scaffold didn't ship them) ───
if [[ ! -f "$INSTALL_DIR/docker-compose.yml" ]]; then
  log "step 6/10 — writing default docker-compose.yml"
  cat > "$INSTALL_DIR/docker-compose.yml" <<'YAML'
name: healthos
services:
  postgres:
    image: postgres:16-alpine
    container_name: healthos-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - ./data/postgres:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 5s
      timeout: 5s
      retries: 20

  pgbouncer:
    image: edoburu/pgbouncer:1.23.1
    container_name: healthos-pgbouncer
    restart: unless-stopped
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USER: ${POSTGRES_USER}
      DB_PASSWORD: ${POSTGRES_PASSWORD}
      DB_NAME: ${POSTGRES_DB}
      POOL_MODE: transaction
      MAX_CLIENT_CONN: 500
      DEFAULT_POOL_SIZE: 25
      AUTH_TYPE: scram-sha-256
    depends_on:
      postgres:
        condition: service_healthy

  redis:
    image: redis:7-alpine
    container_name: healthos-redis
    restart: unless-stopped
    volumes:
      - ./data/redis:/data

  minio:
    image: minio/minio:latest
    container_name: healthos-minio
    restart: unless-stopped
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD}
    volumes:
      - ./data/minio:/data
    healthcheck:
      test: ["CMD", "curl", "-fsS", "http://localhost:9000/minio/health/ready"]
      interval: 10s
      timeout: 5s
      retries: 10

  api:
    image: healthos/api:latest
    container_name: healthos-api
    restart: unless-stopped
    env_file: .env
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
      minio:
        condition: service_healthy
    build:
      context: ./api

  nginx:
    image: nginx:1.27-alpine
    container_name: healthos-nginx
    restart: unless-stopped
    ports: ["80:80", "443:443"]
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/certs:/etc/nginx/certs:ro
      - ./web:/var/www/app:ro
    depends_on: [api, minio]
YAML
fi

if [[ ! -f "$INSTALL_DIR/nginx/nginx.conf" ]]; then
  cat > "$INSTALL_DIR/nginx/nginx.conf" <<NGINX
worker_processes auto;
events { worker_connections 4096; }
http {
  sendfile on; server_tokens off; client_max_body_size 50m;
  gzip on; gzip_types application/json text/css application/javascript;

  ssl_certificate     /etc/nginx/certs/fullchain.pem;
  ssl_certificate_key /etc/nginx/certs/privkey.pem;
  ssl_protocols TLSv1.2 TLSv1.3;

  # API
  server {
    listen 443 ssl http2; server_name ${API_HOST};
    location / {
      proxy_pass http://api:3000;
      proxy_set_header Host \$host;
      proxy_set_header X-Real-IP \$remote_addr;
      proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto \$scheme;
    }
    location /socket.io/ {
      proxy_pass http://api:3000;
      proxy_http_version 1.1;
      proxy_set_header Upgrade \$http_upgrade;
      proxy_set_header Connection "upgrade";
      proxy_read_timeout 3600s;
    }
  }

  # Frontend SPA
  server {
    listen 443 ssl http2; server_name ${APP_HOST};
    root /var/www/app; index index.html;
    location / { try_files \$uri /index.html; }
  }

  # MinIO
  server {
    listen 443 ssl http2; server_name ${S3_HOST};
    location / {
      proxy_pass http://minio:9000;
      proxy_set_header Host \$host;
      proxy_set_header X-Real-IP \$remote_addr;
      proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto \$scheme;
    }
  }

  # HTTP → HTTPS
  server {
    listen 80 default_server;
    return 301 https://\$host\$request_uri;
  }
}
NGINX
fi

# ─── 7. Start core services ───────────────────────────────────────────────────
log "step 7/10 — starting postgres, redis, minio"
cd "$INSTALL_DIR"
docker compose up -d postgres redis minio
until docker exec healthos-postgres pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" >/dev/null 2>&1; do
  sleep 2
done

# ─── 8. DB init ───────────────────────────────────────────────────────────────
log "step 8/10 — initialising database"
if [[ -f "$INSTALL_DIR/db/000_supabase_compat.sql" ]]; then
  docker exec -i healthos-postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
    < "$INSTALL_DIR/db/000_supabase_compat.sql" >/dev/null
fi
if [[ -f "$INSTALL_DIR/db/schema.sql" ]]; then
  docker exec -i healthos-postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
    -v ON_ERROR_STOP=1 < "$INSTALL_DIR/db/schema.sql" >/dev/null || \
    warn "schema.sql apply reported errors — inspect manually"
else
  warn "db/schema.sql not found — export from Supabase before go-live"
fi
for seed in "$INSTALL_DIR"/db/seeds/*.sql; do
  [[ -e "$seed" ]] || continue
  log "seeding $(basename "$seed")"
  docker exec -i healthos-postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" < "$seed" >/dev/null
done

# ─── 9. MinIO buckets ─────────────────────────────────────────────────────────
log "step 9/10 — creating MinIO buckets"
docker run --rm --network healthos_default \
  -e MC_HOST_local="http://${MINIO_ROOT_USER}:${MINIO_ROOT_PASSWORD}@minio:9000" \
  minio/mc:latest sh -c '
    for b in uploads invoices lab-results radiology patient-docs; do
      mc mb -p local/$b || true
      mc anonymous set download local/$b || true
    done
  ' >/dev/null 2>&1 || warn "MinIO bucket bootstrap skipped (network not up yet)"

# ─── 10. Bring up API + Nginx ─────────────────────────────────────────────────
log "step 10/10 — starting pgbouncer, api, nginx"
docker compose up -d pgbouncer api nginx

# ─── Backup cron ──────────────────────────────────────────────────────────────
cat > /etc/cron.d/healthos-backup <<EOF
15 2 * * * root docker exec healthos-postgres pg_dump -U ${POSTGRES_USER} -Fc ${POSTGRES_DB} | gzip > ${INSTALL_DIR}/data/backups/db-\$(date +\%F).dump.gz
EOF

# ─── Smoke ────────────────────────────────────────────────────────────────────
sleep 5
if curl -kfsS "https://localhost/health" -H "Host: ${API_HOST}" >/dev/null 2>&1 \
   || curl -kfsS "https://${API_HOST}/health" >/dev/null 2>&1; then
  log "✅ API responds on https://${API_HOST}/health"
else
  warn "API not yet responding — check: docker compose logs -f api"
fi

cat <<EOM

────────────────────────────────────────────────────────────────
  HealthOS 24 stack is up.

  API   : https://${API_HOST}
  App   : https://${APP_HOST}    (drop build into ${INSTALL_DIR}/web/)
  S3    : https://${S3_HOST}

  Next steps
    1. Point DNS A-records to this VPS
    2. Fill KSA + comms secrets in ${INSTALL_DIR}/.env
       then:  docker compose up -d api
    3. Run data migration from Supabase (see SELFHOST_RUNBOOK.md §8)
    4. Smoke-test the 12-item checklist in SELFHOST_RUNBOOK.md §10

  Ops:
    docker compose ps
    docker compose logs -f api
    docker compose restart api
────────────────────────────────────────────────────────────────
EOM
