# DryFruto - Hostinger Docker Manager Deployment Guide

## Overview
This guide explains how to deploy the DryFruto dry fruits e-commerce website using Hostinger's Docker Manager.

---

## Prerequisites

1. **Hostinger VPS** with Docker template (KVM 2 or higher recommended - min 2GB RAM)
2. **Domain name** pointed to your VPS IP address
3. **GitHub repository** with your code (or upload files directly)

---

## Method 1: Deploy via GitHub URL (Recommended)

### Step 1: Prepare Your GitHub Repository

1. Create a GitHub repository
2. Upload all project files including:
   - `docker-compose.yml`
   - `nginx-proxy.conf`
   - `backend/` folder (with Dockerfile)
   - `frontend/` folder (with Dockerfile and nginx.conf)

### Step 2: Access Hostinger Docker Manager

1. Log in to **Hostinger hPanel**
2. Go to **VPS** → Select your VPS → **Manage**
3. Click **Docker Manager** in the left sidebar

### Step 3: Deploy from GitHub

1. Click **"Deploy from GitHub"** or **"Compose from URL"**
2. Enter your GitHub repository URL:
   ```
   https://github.com/yourusername/dryfruto
   ```
3. Docker Manager will automatically detect `docker-compose.yml`
4. Set environment variables:
   - `MONGO_PASSWORD`: Your secure MongoDB password
   - `DOMAIN_URL`: https://yourdomain.com
5. Click **Deploy**

### Step 4: Wait for Deployment

- Docker Manager will:
  - Pull/build all images
  - Create containers
  - Start services
- This takes 2-5 minutes

---

## Method 2: Manual Compose via Docker Manager

### Step 1: Access Docker Manager

1. Log in to Hostinger hPanel → VPS → Manage → **Docker Manager**

### Step 2: Create New Compose

1. Click **"Create"** or **"New Compose"**
2. Choose **"YAML Editor"**

### Step 3: Paste Docker Compose Configuration

Copy and paste this into the editor:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    container_name: dryfruto-mongodb
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: dryfruto_admin
      MONGO_INITDB_ROOT_PASSWORD: YourSecurePassword123
      MONGO_INITDB_DATABASE: dryfruto
    volumes:
      - mongodb_data:/data/db
    networks:
      - dryfruto-network

  backend:
    image: ghcr.io/yourusername/dryfruto-backend:latest
    container_name: dryfruto-backend
    restart: unless-stopped
    environment:
      MONGO_URL: mongodb://dryfruto_admin:YourSecurePassword123@mongodb:27017/dryfruto?authSource=admin
      DB_NAME: dryfruto
    depends_on:
      - mongodb
    networks:
      - dryfruto-network

  frontend:
    image: ghcr.io/yourusername/dryfruto-frontend:latest
    container_name: dryfruto-frontend
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - dryfruto-network

volumes:
  mongodb_data:

networks:
  dryfruto-network:
    driver: bridge
```

### Step 4: Deploy

1. Click **Deploy**
2. Monitor the deployment progress

---

## Method 3: SSH + Docker Compose (Manual)

### Step 1: SSH into VPS

```bash
ssh root@your-vps-ip
```

### Step 2: Create Project Directory

```bash
mkdir -p /opt/dryfruto
cd /opt/dryfruto
```

### Step 3: Upload Files

Use SFTP (FileZilla) to upload:
- `docker-compose.yml`
- `nginx-proxy.conf`
- `backend/` folder
- `frontend/` folder

Or clone from Git:
```bash
git clone https://github.com/yourusername/dryfruto.git .
```

### Step 4: Create Environment File

```bash
nano .env
```

Add:
```env
MONGO_PASSWORD=YourSecurePassword123
DOMAIN_URL=https://yourdomain.com
```

### Step 5: Build and Start

```bash
docker-compose up -d --build
```

### Step 6: Verify Deployment

```bash
docker-compose ps
docker-compose logs -f
```

---

## Post-Deployment Setup

### 1. Seed Initial Data

Visit `http://your-vps-ip/admin` and click **"Seed Initial Data"**

Or via command:
```bash
curl -X POST http://your-vps-ip/api/seed-data
```

### 2. Setup SSL (HTTPS)

**Option A: Using Certbot in Container**

Add this service to docker-compose.yml:
```yaml
  certbot:
    image: certbot/certbot
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    command: certonly --webroot -w /var/www/certbot -d yourdomain.com --email your@email.com --agree-tos --no-eff-email
```

**Option B: Using Hostinger SSL**

1. Go to hPanel → SSL
2. Enable SSL for your domain
3. Update nginx-proxy.conf for HTTPS

### 3. Point Domain to VPS

1. Go to your domain registrar
2. Update DNS A record:
   - **Name**: @ (or www)
   - **Type**: A
   - **Value**: Your VPS IP address
   - **TTL**: 3600

---

## Docker Manager Features

### View Logs
- Click on container → **Logs** tab
- Real-time log streaming

### Monitor Resources
- CPU, RAM, Network usage
- Container health status

### Terminal Access
- Click **Terminal** to access container shell
- Run commands inside containers

### Update Containers
- Edit docker-compose.yml
- Click **Redeploy**

### Scale Services
- Modify replica count in compose file
- Redeploy

---

## Useful Commands (via SSH)

```bash
# View all containers
docker ps -a

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb

# Restart services
docker-compose restart

# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v

# Rebuild and restart
docker-compose up -d --build

# Check container health
docker inspect dryfruto-backend | grep Health

# Access MongoDB shell
docker exec -it dryfruto-mongodb mongosh -u dryfruto_admin -p

# Access backend container
docker exec -it dryfruto-backend /bin/bash
```

---

## Troubleshooting

### Container won't start
```bash
docker-compose logs <service-name>
```

### MongoDB connection error
- Check MONGO_URL environment variable
- Ensure password matches in all services
- Verify MongoDB container is healthy:
  ```bash
  docker-compose ps mongodb
  ```

### Frontend shows "Network Error"
- Check backend is running: `docker-compose ps backend`
- Verify nginx-proxy.conf has correct proxy settings
- Check backend logs: `docker-compose logs backend`

### 502 Bad Gateway
- Backend not ready yet (wait 30 seconds)
- Check backend health: `curl http://localhost:8001/api/`

### Out of memory
- Upgrade VPS plan
- Reduce worker count in backend Dockerfile

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Hostinger VPS                      │
│  ┌─────────────────────────────────────────────┐    │
│  │              Docker Network                  │    │
│  │                                              │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐   │    │
│  │  │ Frontend │  │ Backend  │  │ MongoDB  │   │    │
│  │  │ (Nginx)  │─▶│ (FastAPI)│─▶│ (Mongo)  │   │    │
│  │  │ Port 80  │  │ Port 8001│  │ Port27017│   │    │
│  │  └──────────┘  └──────────┘  └──────────┘   │    │
│  │       │                            │        │    │
│  └───────│────────────────────────────│────────┘    │
│          │                            │             │
│          ▼                            ▼             │
│    Internet                    mongodb_data         │
│    (Port 80/443)               (Volume)             │
└─────────────────────────────────────────────────────┘
```

---

## Security Checklist

- [ ] Change default MongoDB password
- [ ] Enable firewall (ufw)
- [ ] Setup SSL/HTTPS
- [ ] Use environment variables for secrets
- [ ] Regular backups of MongoDB volume
- [ ] Keep Docker images updated

---

## Support

- **Hostinger Docker Manager**: https://support.hostinger.com/en/articles/8556713
- **Docker Documentation**: https://docs.docker.com/
- **MongoDB Docker**: https://hub.docker.com/_/mongo
