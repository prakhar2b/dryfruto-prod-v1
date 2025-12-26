# DryFruto - Manual Deployment Guide for Hostinger VPS

## Prerequisites
- Hostinger VPS with SSH access
- Docker and Docker Compose installed

---

## Step 1: Connect to VPS via SSH

```bash
ssh root@srv1225994.hstgr.cloud
```

---

## Step 2: Install Docker (if not installed)

```bash
curl -fsSL https://get.docker.com | sh
sudo systemctl start docker
sudo systemctl enable docker
```

---

## Step 3: Create Project Directory

```bash
mkdir -p /home/dryfruto
cd /home/dryfruto
```

---

## Step 4: Create docker-compose.yml

```bash
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    container_name: dryfruto-mongodb
    restart: unless-stopped
    volumes:
      - mongodb_data:/data/db
    networks:
      - app-network

  backend:
    image: python:3.11-slim
    container_name: dryfruto-backend
    restart: unless-stopped
    working_dir: /app
    environment:
      - MONGO_URL=mongodb://mongodb:27017/dryfruto
      - DB_NAME=dryfruto
    command: >
      bash -c "
        apt-get update && apt-get install -y curl git &&
        git clone -b main https://github.com/prakhar2b/dryfruto.git /tmp/repo &&
        cp -r /tmp/repo/backend/* /app/ &&
        pip install --no-cache-dir -r requirements.txt &&
        uvicorn server:app --host 0.0.0.0 --port 8001
      "
    depends_on:
      - mongodb
    networks:
      - app-network

  frontend:
    image: nginx:alpine
    container_name: dryfruto-frontend
    restart: unless-stopped
    ports:
      - "80:80"
    command: >
      sh -c "
        apk add --no-cache git &&
        git clone -b main https://github.com/prakhar2b/dryfruto.git /tmp/repo &&
        cp -r /tmp/repo/frontend/build/* /usr/share/nginx/html/ &&
        echo 'server {
          listen 80;
          server_name _;
          location / {
            root /usr/share/nginx/html;
            index index.html;
            try_files \$\$uri \$\$uri/ /index.html;
          }
          location /api/ {
            proxy_pass http://backend:8001/api/;
            proxy_http_version 1.1;
            proxy_set_header Host \$\$host;
            proxy_set_header X-Real-IP \$\$remote_addr;
          }
        }' > /etc/nginx/conf.d/default.conf &&
        nginx -g 'daemon off;'
      "
    depends_on:
      - backend
    networks:
      - app-network

volumes:
  mongodb_data:

networks:
  app-network:
    driver: bridge
EOF
```

---

## Step 5: Start the Application

```bash
docker-compose up -d
```

---

## Step 6: Wait and Check Status

```bash
# Wait for containers to start
sleep 60

# Check container status
docker-compose ps

# View logs if needed
docker-compose logs -f
```

---

## Step 7: Seed the Database

```bash
curl -X POST http://localhost/api/seed-data
```

---

## Step 8: Access the Website

Open in browser:
```
http://srv1225994.hstgr.cloud
```

Admin Panel:
```
http://srv1225994.hstgr.cloud/admin
```

---

## Useful Commands

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart all services
docker-compose restart

# Stop all services
docker-compose down

# Stop and remove volumes (reset database)
docker-compose down -v

# Rebuild and restart
docker-compose down
docker-compose up -d --build

# Check container status
docker-compose ps
```

---

## Troubleshooting

### If backend fails to start:
```bash
docker logs dryfruto-backend
```

### If frontend shows 502 error:
```bash
# Check if backend is running
docker-compose ps
# Restart backend
docker-compose restart backend
```

### To completely reset:
```bash
docker-compose down -v
docker system prune -a -f
docker-compose up -d
sleep 60
curl -X POST http://localhost/api/seed-data
```

---

## Update Deployment (After GitHub Changes)

```bash
cd /home/dryfruto
docker-compose down
docker-compose up -d
```

The containers will pull the latest code from GitHub on startup.
