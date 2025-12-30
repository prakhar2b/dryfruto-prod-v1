# DryFruto Deployment Guide

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Domain pointed to your server IP
- Ports 80, 443, and 9001 open on firewall

### Development (HTTP only - Port 9001)
```bash
chmod +x deploy.sh
./deploy.sh dev
```
Access at: `http://localhost:9001`

### Production (HTTP + HTTPS)
```bash
chmod +x deploy.sh
./deploy.sh prod
```

---

## Hostinger VPS Setup for statellmarketing.com

### Step 1: Connect to Your VPS
```bash
ssh root@your-vps-ip
```

### Step 2: Install Docker
```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose -y

# Verify installation
docker --version
docker-compose --version
```

### Step 3: Clone/Upload Your Code
```bash
# Option A: Clone from GitHub
git clone https://github.com/your-repo/dryfruto.git
cd dryfruto

# Option B: Upload via SCP
scp -r /local/path/to/app root@your-vps-ip:/root/dryfruto
```

### Step 4: Configure Firewall
```bash
# Allow required ports
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 9001/tcp  # App HTTP port
ufw enable
ufw status
```

### Step 5: Configure Domain in Hostinger

1. **Login to Hostinger Control Panel**
   - Go to https://hpanel.hostinger.com

2. **Navigate to DNS Settings**
   - Click on "Domains" → Select "statellmarketing.com"
   - Click "DNS / Nameservers"

3. **Add DNS Records**
   
   | Type | Name | Points to | TTL |
   |------|------|-----------|-----|
   | A | @ | YOUR_VPS_IP | 14400 |
   | A | www | YOUR_VPS_IP | 14400 |
   | A | api | YOUR_VPS_IP | 14400 |

   Replace `YOUR_VPS_IP` with your actual Hostinger VPS IP address.

4. **Wait for DNS Propagation**
   - DNS changes can take 5 minutes to 48 hours
   - Check propagation: https://dnschecker.org

### Step 6: Deploy the Application
```bash
cd /root/dryfruto

# Make deploy script executable
chmod +x deploy.sh

# Deploy in production mode
./deploy.sh prod
```

### Step 7: Verify Deployment
```bash
# Check all containers are running
docker-compose ps

# Check logs
docker-compose logs -f

# Test endpoints
curl http://localhost:9001
curl http://localhost:9001/api/health
```

---

## Access URLs After Deployment

| URL | Description |
|-----|-------------|
| http://statellmarketing.com:9001 | HTTP Access |
| https://statellmarketing.com | HTTPS Access |
| http://statellmarketing.com:9001/admin | Admin Panel |
| http://statellmarketing.com:9001/api/health | API Health Check |

---

## SSL Certificate Management

### Initial Setup (Automatic with deploy.sh prod)
SSL certificates are automatically obtained from Let's Encrypt.

### Manual Certificate Renewal
```bash
docker-compose run --rm certbot renew
docker-compose restart nginx
```

### Check Certificate Status
```bash
docker-compose run --rm certbot certificates
```

---

## Useful Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx
```

### Restart Services
```bash
# All services
docker-compose restart

# Specific service
docker-compose restart backend
```

### Stop/Start
```bash
# Stop all
docker-compose down

# Start all
docker-compose up -d
```

### Rebuild After Code Changes
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Database Backup
```bash
# Backup MongoDB
docker exec dryfruto-mongodb mongodump --out /data/backup
docker cp dryfruto-mongodb:/data/backup ./backup

# Restore
docker cp ./backup dryfruto-mongodb:/data/backup
docker exec dryfruto-mongodb mongorestore /data/backup
```

---

## Troubleshooting

### Container not starting
```bash
docker-compose logs [service_name]
```

### Port already in use
```bash
sudo lsof -i :9001
sudo kill -9 [PID]
```

### SSL Certificate Issues
```bash
# Check certificate files exist
ls -la certbot/conf/live/statellmarketing.com/

# Manually obtain certificate
docker-compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    -d statellmarketing.com \
    -d www.statellmarketing.com
```

### MongoDB Connection Issues
```bash
# Check MongoDB is running
docker-compose ps mongodb

# Access MongoDB shell
docker exec -it dryfruto-mongodb mongosh
```

---

## Environment Variables

The following environment variables are configured in docker-compose.yml:

| Variable | Description | Default |
|----------|-------------|---------|
| MONGO_URL | MongoDB connection string | mongodb://mongodb:27017 |
| DB_NAME | Database name | dryfruto |
| REACT_APP_BACKEND_URL | Backend API URL | https://statellmarketing.com |

---

## Architecture

```
                    ┌─────────────────┐
                    │   Internet      │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │         Port 9001 (HTTP)    │
              │         Port 443 (HTTPS)    │
              └──────────────┬──────────────┘
                             │
                    ┌────────┴────────┐
                    │     Nginx       │
                    │  (Reverse Proxy)│
                    └────────┬────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
     ┌──────┴──────┐  ┌──────┴──────┐  ┌──────┴──────┐
     │  Frontend   │  │   Backend   │  │   MongoDB   │
     │  (React)    │  │  (FastAPI)  │  │  (Database) │
     │   :80       │  │   :8001     │  │   :27017    │
     └─────────────┘  └─────────────┘  └─────────────┘
```

---

## Support

For issues or questions:
- Check Docker logs: `docker-compose logs -f`
- Hostinger Support: https://support.hostinger.com
- MongoDB Docs: https://docs.mongodb.com
