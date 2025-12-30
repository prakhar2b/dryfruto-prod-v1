# DryFruto - Hostinger Docker Manager Setup

## Domain: statellmarketing.com

## Container Names

| Service | Container Name |
|---------|----------------|
| MongoDB | sm2024db01 |
| Backend API | sm2024api01 |
| Frontend | sm2024web01 |
| Nginx Proxy | sm2024proxy01 |
| Certbot SSL | sm2024ssl01 |

---

## Quick Setup Steps

### 1. DNS Configuration in Hostinger

Login to [Hostinger Control Panel](https://hpanel.hostinger.com):

1. Go to **Domains** → **statellmarketing.com**
2. Click **DNS / Nameservers**
3. Add these A records:

| Type | Name | Points To | TTL |
|------|------|-----------|-----|
| A | @ | YOUR_VPS_IP | 14400 |
| A | www | YOUR_VPS_IP | 14400 |

### 2. Deploy via Docker Manager

1. In Hostinger panel, go to **VPS** → **Docker Manager**
2. Click **Create New Project**
3. Connect your GitHub repository
4. Select `docker-compose.yml`
5. Click **Deploy**

### 3. SSL Certificate Setup (First Time)

After initial deployment, SSH into your VPS and run:

```bash
# Create certbot directories
mkdir -p certbot/conf certbot/www

# Get SSL certificate
docker-compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email your-email@example.com \
    --agree-tos \
    --no-eff-email \
    -d statellmarketing.com \
    -d www.statellmarketing.com

# Restart nginx to apply SSL
docker-compose restart nginx
```

---

## Access URLs

| URL | Description |
|-----|-------------|
| http://statellmarketing.com | HTTP Access |
| https://statellmarketing.com | HTTPS Access (SSL) |
| https://statellmarketing.com/admin | Admin Panel |
| https://statellmarketing.com/api/health | API Health Check |

---

## Architecture

```
Internet
    │
    ▼
┌─────────────────────────────────────┐
│   sm2024proxy01 (Port 80 & 443)     │
│   statellmarketing.com              │
└─────────────────┬───────────────────┘
                  │
    ┌─────────────┼───────────────┐
    ▼             ▼               ▼
┌────────┐  ┌──────────┐  ┌───────────┐
│sm2024  │  │ sm2024   │  │ sm2024    │
│web01   │  │ api01    │  │ db01      │
│Frontend│  │ Backend  │  │ MongoDB   │
│ :80    │  │  :8001   │  │ :27017    │
│Node 14 │  │ FastAPI  │  │           │
└────────┘  └──────────┘  └───────────┘
```

---

## Useful Commands

```bash
# View logs
docker-compose logs -f

# View specific container logs
docker logs sm2024api01
docker logs sm2024web01
docker logs sm2024proxy01

# Restart services
docker-compose restart

# Rebuild and deploy
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Check SSL certificate
docker-compose run --rm certbot certificates

# Renew SSL certificate
docker-compose run --rm certbot renew

# Access MongoDB shell
docker exec -it sm2024db01 mongosh
```

---

## Changing Container Names in Future

When you need to change container names, follow these steps:

### Files to Update:

1. **docker-compose.yml** - Change all `container_name` values:
   ```yaml
   container_name: NEW_NAME_HERE
   ```

2. **HOSTINGER_SETUP.md** - Update the container names table and all references

### Manual Changes Required:

| Action | Old Command | New Command |
|--------|-------------|-------------|
| View logs | `docker logs sm2024api01` | `docker logs NEW_NAME` |
| MongoDB shell | `docker exec -it sm2024db01 mongosh` | `docker exec -it NEW_DB_NAME mongosh` |
| Restart container | `docker restart sm2024web01` | `docker restart NEW_NAME` |

### Steps to Apply Changes:

```bash
# 1. Stop all containers
docker-compose down

# 2. Remove old containers (if any conflicts)
docker rm sm2024db01 sm2024api01 sm2024web01 sm2024proxy01 sm2024ssl01 2>/dev/null

# 3. Start with new names
docker-compose up -d

# 4. Verify new container names
docker ps --format "table {{.Names}}\t{{.Status}}"
```

### Important Notes:

- **Volumes are NOT affected** - Data persists even when container names change
- **Networks are NOT affected** - Internal service communication uses service names (mongodb, backend, frontend), not container names
- **nginx.conf does NOT need changes** - It uses service names, not container names
- **SSL certificates are NOT affected** - Stored in `certbot/conf` volume

---

## Troubleshooting

### SSL Certificate Issues
```bash
# Check if certificate exists
ls -la certbot/conf/live/statellmarketing.com/

# Force certificate renewal
docker-compose run --rm certbot certonly --force-renewal \
    --webroot --webroot-path=/var/www/certbot \
    -d statellmarketing.com -d www.statellmarketing.com
```

### Container Not Starting
```bash
# Check logs
docker logs sm2024api01
docker logs sm2024web01
docker logs sm2024proxy01
```

### Database Issues
```bash
# Access MongoDB shell
docker exec -it sm2024db01 mongosh

# Check database
use dryfruto
db.products.countDocuments()
```

### Port Conflicts
```bash
# Check what's using ports 80/443
sudo lsof -i :80
sudo lsof -i :443

# Kill conflicting process
sudo kill -9 PID
```
