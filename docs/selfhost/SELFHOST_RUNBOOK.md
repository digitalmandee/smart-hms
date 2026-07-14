# HealthOS 24 — Self-Host Runbook (Node.js + Postgres)

End-to-end deployment of the self-hosted stack: **NestJS API + Postgres 16 + PgBouncer + Redis + MinIO + Nginx** on a single VPS (scales horizontally later). Companion to `BRAIN.md`, `HEALTHOS.md`, and the `healthos-api.zip` scaffold.

Estimated time: **1–2 engineer-days** for a clean install, **3–5 days** including data cutover from Supabase.

---

## 0. Prerequisites

**Hardware (pilot / single-hospital)**
- 8 vCPU, 32 GB RAM, 500 GB NVMe SSD
- Ubuntu 22.04 LTS or 24.04 LTS
- Public IPv4 + reverse-DNS for TLS

**Accounts / access**
- Root SSH to the VPS (key-based, password login disabled)
- Domain (e.g. `api.healthos24.com`, `app.healthos24.com`, `s3.healthos24.com`)
- Copy of the existing Supabase project (SQL dump + storage export + auth users export)
- KSA integration credentials: NPHIES, ZATCA CSID, Wasfaty, Nafath, Tatmeen, WhatsApp Cloud, Twilio/SMS, ElevenLabs, DeepSeek

**Local tooling on the ops laptop**
- `ssh`, `rsync`, `psql` ≥ 16, `docker` ≥ 24, `docker compose` ≥ 2.20, `pg_dump`, `openssl`, `node` ≥ 20, `bun` ≥ 1.1

---

## 1. Harden the VPS

```bash
# as root
apt update && apt -y upgrade
apt -y install ufw fail2ban unattended-upgrades curl git ca-certificates gnupg jq htop
dpkg-reconfigure -plow unattended-upgrades

# create ops user
adduser --disabled-password --gecos "" ops
usermod -aG sudo ops
mkdir -p /home/ops/.ssh && cp ~/.ssh/authorized_keys /home/ops/.ssh/
chown -R ops:ops /home/ops/.ssh && chmod 700 /home/ops/.ssh

# ssh hardening
sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart ssh

# firewall
ufw default deny incoming && ufw default allow outgoing
ufw allow 22/tcp && ufw allow 80/tcp && ufw allow 443/tcp
ufw --force enable

# time sync (needed for ZATCA hash chaining)
timedatectl set-timezone Asia/Riyadh
timedatectl set-ntp true
```

## 2. Install Docker

```bash
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" \
  > /etc/apt/sources.list.d/docker.list
apt update && apt -y install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
usermod -aG docker ops
```

## 3. Clone the scaffold and lay out directories

```bash
sudo -iu ops
mkdir -p /opt/healthos && cd /opt/healthos
unzip ~/healthos-api.zip -d .        # scaffold delivered earlier
mkdir -p data/{postgres,redis,minio,backups} logs nginx/certs
```

Repo layout after unzip:

```
/opt/healthos
├── api/                     # NestJS source
├── db/000_supabase_compat.sql
├── db/migrations/           # schema pulled from Supabase
├── docker-compose.yml
├── nginx/nginx.conf
└── .env.example
```

## 4. Configure secrets

```bash
cp .env.example .env
openssl rand -hex 32   # → JWT_SECRET
openssl rand -hex 32   # → SESSION_SECRET
openssl rand -hex 24   # → MINIO_ROOT_PASSWORD
openssl rand -hex 24   # → POSTGRES_PASSWORD
```

Fill `.env`:

```env
# core
NODE_ENV=production
API_PORT=3000
PUBLIC_API_URL=https://api.healthos24.com
PUBLIC_APP_URL=https://app.healthos24.com

# postgres
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=healthos
POSTGRES_USER=healthos
POSTGRES_PASSWORD=***
DATABASE_URL=postgresql://healthos:***@pgbouncer:6432/healthos?schema=public

# auth
JWT_SECRET=***
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=30d
BCRYPT_ROUNDS=10
SESSION_SECRET=***

# redis
REDIS_URL=redis://redis:6379

# object storage
S3_ENDPOINT=https://s3.healthos24.com
S3_REGION=me-south-1
S3_ACCESS_KEY=healthos
S3_SECRET_KEY=***
S3_BUCKET_UPLOADS=uploads
S3_BUCKET_INVOICES=invoices
S3_BUCKET_LAB=lab-results
S3_BUCKET_RADIOLOGY=radiology
S3_BUCKET_PATIENT_DOCS=patient-docs

# KSA integrations
NPHIES_BASE_URL=...
NPHIES_CLIENT_ID=...
NPHIES_CLIENT_SECRET=...
ZATCA_CSID=...
ZATCA_PRIVATE_KEY_PEM=...
WASFATY_API_KEY=...
NAFATH_APP_ID=...
NAFATH_SECRET=...
TATMEEN_API_KEY=...

# comms
WHATSAPP_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
SMTP_HOST=...
SMTP_USER=...
SMTP_PASS=...

# AI
DEEPSEEK_API_KEY=...
ELEVENLABS_API_KEY=...
HEYGEN_API_KEY=...
```

Lock it: `chmod 600 .env`.

## 5. TLS certificates

```bash
sudo apt -y install certbot
sudo certbot certonly --standalone \
  -d api.healthos24.com -d app.healthos24.com -d s3.healthos24.com \
  --agree-tos -m ops@healthos24.com -n
sudo cp /etc/letsencrypt/live/api.healthos24.com/{fullchain,privkey}.pem /opt/healthos/nginx/certs/
sudo chown ops:ops /opt/healthos/nginx/certs/*
```

Add `/etc/cron.d/certbot-renew`:
```
0 3 * * * root certbot renew --quiet --deploy-hook "docker exec healthos-nginx nginx -s reload"
```

## 6. Bring up the stack

```bash
cd /opt/healthos
docker compose pull
docker compose up -d postgres redis minio
docker compose logs -f postgres | grep "ready to accept"
```

Create MinIO buckets:
```bash
docker exec -it healthos-minio mc alias set local http://localhost:9000 healthos "$MINIO_ROOT_PASSWORD"
for b in uploads invoices lab-results radiology patient-docs; do
  docker exec healthos-minio mc mb -p local/$b
  docker exec healthos-minio mc anonymous set download local/$b   # for public read where needed
done
```

## 7. Initialise the database

```bash
# 7.1 compat shim + extensions
docker exec -i healthos-postgres psql -U healthos -d healthos < db/000_supabase_compat.sql

# 7.2 schema (dumped from Supabase, schema-only)
pg_dump --schema-only --no-owner --no-privileges \
  "postgresql://postgres:***@db.wxafzwlodzohrwdwkuzy.supabase.co:5432/postgres" \
  > db/schema.sql
# hand-edit: strip auth.*, storage.*, realtime.*, supabase_* schemas; keep public.*
docker exec -i healthos-postgres psql -U healthos -d healthos < db/schema.sql

# 7.3 seed reference data (KSA COA, medical codes, service types)
docker exec -i healthos-postgres psql -U healthos -d healthos < db/seeds/ksa-coa.sql
docker exec -i healthos-postgres psql -U healthos -d healthos < db/seeds/medical-codes.sql
```

Bring up PgBouncer + API + Nginx:
```bash
docker compose up -d pgbouncer api nginx
docker compose ps
curl -sf https://api.healthos24.com/health   # → {"status":"ok"}
```

## 8. Data migration from Supabase

Cutover window: freeze writes on Supabase → dump → restore → verify → flip DNS.

```bash
# 8.1 data-only dump (public schema)
pg_dump --data-only --no-owner --disable-triggers \
  --schema=public \
  "postgresql://postgres:***@db.wxafzwlodzohrwdwkuzy.supabase.co:5432/postgres" \
  > /tmp/data.sql

# 8.2 restore (triggers off during load, re-enabled after)
docker exec -i healthos-postgres psql -U healthos -d healthos -c "SET session_replication_role='replica';"
docker exec -i healthos-postgres psql -U healthos -d healthos < /tmp/data.sql
docker exec -i healthos-postgres psql -U healthos -d healthos -c "SET session_replication_role='origin';"

# 8.3 auth users → local users table (preserve bcrypt hashes)
psql "postgresql://postgres:***@db.wxafzwlodzohrwdwkuzy.supabase.co:5432/postgres" -c "\
  COPY (SELECT id, email, encrypted_password, raw_user_meta_data, created_at \
        FROM auth.users) TO STDOUT WITH CSV HEADER" > /tmp/auth_users.csv
docker exec -i healthos-postgres psql -U healthos -d healthos -c "\
  \\copy public.users(id,email,password_hash,metadata,created_at) FROM STDIN WITH CSV HEADER" \
  < /tmp/auth_users.csv

# 8.4 storage objects → MinIO
rclone copy supabase-storage:uploads minio:uploads --transfers=16
rclone copy supabase-storage:invoices minio:invoices --transfers=16
# ... repeat per bucket
```

Row-count reconciliation:
```bash
docker exec healthos-postgres psql -U healthos -d healthos -tAc "\
  SELECT relname, n_live_tup FROM pg_stat_user_tables ORDER BY n_live_tup DESC LIMIT 30;"
```
Compare against the same query on Supabase; discrepancies must be zero on transactional tables (`invoices`, `payments`, `journals`, `patients`).

## 9. Point the frontend at the new API

In the React app (Lovable or self-built bundle):

```env
VITE_API_BASE_URL=https://api.healthos24.com
VITE_S3_BASE_URL=https://s3.healthos24.com
```

The Supabase-client compat shim (`src/integrations/supabase/client.ts`) is swapped for the local shim shipped in `healthos-api.zip → frontend-shim/`. Rebuild and deploy:

```bash
bun install && bun run build
rsync -az dist/ ops@vps:/opt/healthos/web/
```

Nginx serves `/opt/healthos/web` at `app.healthos24.com` with SPA fallback (`try_files $uri /index.html`).

## 10. Smoke tests (must all pass before DNS flip)

| # | Check | Command / URL |
|---|---|---|
| 1 | Health | `curl https://api.healthos24.com/health` |
| 2 | Auth | log in as a real user, verify JWT round-trip |
| 3 | RLS | log in as a different org, confirm no cross-tenant rows |
| 4 | Invoice → journal | create invoice, verify `journal_entries` row appears |
| 5 | Pharmacy POS | ring a sale, confirm COGS + inventory move |
| 6 | Lab lifecycle | order → collect → result → publish |
| 7 | IPD discharge | admit → charge → discharge invoice reconciles |
| 8 | ZATCA | issue invoice, confirm hash chain continuity |
| 9 | NPHIES | submit eligibility, receive 200 |
| 10 | Realtime | open two browsers, verify queue updates via Socket.IO |
| 11 | Storage | upload a lab PDF, download via presigned URL |
| 12 | Offline sync | CoW van tablet in airplane mode → back online → outbox drains |

## 11. Backups

Nightly `pg_dump` + weekly base backup + MinIO versioning:

```cron
# /etc/cron.d/healthos-backups
15 2 * * * ops docker exec healthos-postgres pg_dump -U healthos -Fc healthos \
  | gzip > /opt/healthos/data/backups/db-$(date +\%F).dump.gz
30 2 * * 0 ops docker exec healthos-postgres pg_basebackup -U healthos -D - -Ft -z \
  > /opt/healthos/data/backups/base-$(date +\%F).tgz
0 3 * * * ops rclone sync /opt/healthos/data/backups b2:healthos-backups
```

Test the restore quarterly against a scratch VPS. An untested backup is not a backup.

## 12. Monitoring & alerting

- **Metrics** — `docker compose up -d prometheus grafana node-exporter postgres-exporter`
- **Logs** — Loki + Promtail; retain 30 days
- **Uptime** — external UptimeRobot pings `/health` every 60 s
- **Alerts** — Grafana → WhatsApp/Slack for: API 5xx > 1 %/5 min, DB connections > 80 %, disk > 80 %, ZATCA submission failures, NPHIES timeouts

## 13. DNS cutover

```
api.healthos24.com   A   <vps-ip>   TTL 60
app.healthos24.com   A   <vps-ip>   TTL 60
s3.healthos24.com    A   <vps-ip>   TTL 60
```

Watch API logs for 15 minutes. Rollback: revert DNS to Supabase-fronted endpoint; frontend continues to work because the compat shim speaks both dialects.

## 14. Day-2 operations

| Task | Frequency | Command |
|---|---|---|
| Rotate JWT secret | 90 days | update `.env`, `docker compose up -d api` |
| Rotate DB password | 90 days | `ALTER USER healthos WITH PASSWORD`; update `.env` |
| Vacuum/analyze | weekly | `VACUUM ANALYZE;` |
| Reindex heavy tables | monthly | `REINDEX TABLE CONCURRENTLY invoices;` |
| Certbot renew | auto | cron |
| OS patches | monthly | `apt upgrade && reboot` (during maintenance window) |
| Backup restore drill | quarterly | restore to scratch VPS, run smoke tests |
| Security scan | monthly | `trivy image healthos/api:latest` |

## 15. Scaling checkpoints

- **> 50 concurrent users** — separate API container to its own 4-vCPU node behind Nginx
- **> 200 concurrent users** — move Postgres to a managed / dedicated 16-vCPU node with streaming replica
- **> 5 hospitals** — add read replica for reports; move MinIO to a 3-node cluster
- **> 20 hospitals** — Kubernetes (k3s), Patroni for Postgres HA, MinIO distributed mode

---

## Appendix A — docker-compose.yml services

```
postgres      : postgres:16-alpine        # 5432 internal only
pgbouncer     : edoburu/pgbouncer:1.22    # 6432 internal only
redis         : redis:7-alpine
minio         : minio/minio:latest        # 9000 (api), 9001 (console)
api           : healthos/api:latest       # NestJS, 3000 internal
nginx         : nginx:1.27-alpine         # 80/443 public
prometheus    : prom/prometheus
grafana       : grafana/grafana
loki          : grafana/loki
```

## Appendix B — Rollback plan

1. Flip DNS back to Supabase-fronted endpoint (TTL 60 s)
2. `docker compose stop api`
3. Preserve `/opt/healthos/data` for forensics
4. File incident report; schedule post-mortem within 48 h

## Appendix C — Common failures

| Symptom | Likely cause | Fix |
|---|---|---|
| `permission denied for table X` | missing `GRANT` after schema restore | run `GRANT SELECT,INSERT,UPDATE,DELETE ON public.X TO authenticated;` |
| RLS returns 0 rows for admin | `app.current_org` GUC not set | ensure middleware sets it per request |
| ZATCA hash mismatch | server clock drift | `timedatectl set-ntp true` |
| Realtime disconnects | Nginx `proxy_read_timeout` too low | raise to 3600s for `/socket.io/` |
| Slow `invoices` list | missing composite index | `CREATE INDEX CONCURRENTLY ON invoices(org_id, created_at DESC);` |
| MinIO 403 on presigned URL | clock skew between API and MinIO | sync NTP on both |

---

**Owner:** DevOps · **Reviewed by:** CTO · **Version:** 1.0 · **Companion docs:** `BRAIN.md`, `HEALTHOS.md`, `healthos-api.zip`
