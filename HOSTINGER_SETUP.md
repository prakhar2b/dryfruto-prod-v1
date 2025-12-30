# DryFruto - Hostinger Docker Manager Setup

## Domain: statellmarketing.com

## Container Names

| Service | Container Name |
|---------|----------------|
| MongoDB | dryfruto_db |
| Backend API | dryfruto_backend |
| Frontend | dryfruto_frontend |
| Nginx Proxy | dryfruto_proxy |
| Certbot SSL | dryfruto_certbot |

---

## Port Configuration

| Service | Internal Port | External Port |
|---------|---------------|---------------|
| MongoDB | 27017 | (internal only) |
| Backend | 8001 | (internal only) |
| Frontend | 80 | (internal only) |
| Nginx HTTP | 80 | 8080 |
| Nginx HTTPS | 443 | 8443 |

**Note:** Only Nginx exposes external ports. All other services communicate internally via Docker network.

---

## Auto-Seeded Data

When you first deploy, the database will **automatically be populated** with default data:
- **12 Products** (almonds, cashews, walnuts, etc.)
- **6 Categories** (Nuts & Dry Fruits, Dates, Seeds, etc.)
- **3 Hero Slides**
- **6 Testimonials**
- **6 Gift Boxes**
- **Site Settings** (business name, contact info, etc.)

No manual seeding required! The backend auto-seeds on startup when the database is empty.

---

## Access URLs

| Protocol | Port | URL |
|----------|------|-----|
| HTTP | 8080 | `http://statellmarketing.com:8080` |
| HTTPS | 8443 | `https://statellmarketing.com:8443` |
| Admin | 8080 | `http://statellmarketing.com:8080/admin` |

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

### 3. Test HTTP First

After deployment, test HTTP access:
```
http://statellmarketing.com:8080
```

The website should load with all products and data already populated!

If HTTP works, proceed to SSL setup.

---

## SSL/HTTPS Configuration (Port 8443)

### Why HTTPS shows error initially?
HTTPS requires SSL certificates. Without certificates, nginx cannot start the HTTPS server, causing connection errors on port 8443.

### Step-by-Step SSL Setup:

#### Step 1: SSH into your Hostinger VPS
```bash
ssh root@YOUR_VPS_IP
```

#### Step 2: Navigate to project directory
```bash
cd /docker/dryfruto-vikram
# OR find your project:
ls /docker/
```

#### Step 3: Create certbot directories
```bash
mkdir -p certbot/conf certbot/www
```

#### Step 4: Get SSL Certificate from Let's Encrypt
```bash
# Stop nginx temporarily (it's blocking port 80 needed for verification)
docker-compose stop nginx

# Run certbot to get certificate
docker run -it --rm \
  -v $(pwd)/certbot/conf:/etc/letsencrypt \
  -v $(pwd)/certbot/www:/var/www/certbot \
  -p 80:80 \
  certbot/certbot certonly \
  --standalone \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email \
  -d statellmarketing.com \
  -d www.statellmarketing.com
```

#### Step 5: Verify certificate was created
```bash
ls certbot/conf/live/statellmarketing.com/
# Should show: fullchain.pem, privkey.pem, cert.pem, chain.pem
```

#### Step 6: Restart nginx with SSL
```bash
docker-compose up -d nginx
```

#### Step 7: Test HTTPS
```
https://statellmarketing.com:8443
```

---

## Architecture

```
Internet
    │
    ├─── Port 8080 (HTTP)
    │
    └─── Port 8443 (HTTPS)
         │
         ▼
┌─────────────────────────────────────┐
│      dryfruto_proxy (Nginx)         │
│   statellmarketing.com              │
└─────────────────┬───────────────────┘
                  │
    ┌─────────────┼───────────────┐
    ▼             ▼               ▼
┌────────┐  ┌──────────┐  ┌───────────┐
│dryfruto│  │ dryfruto │  │ dryfruto  │
│frontend│  │ backend  │  │ db        │
│Frontend│  │ Backend  │  │ MongoDB   │
│ :3000  │  │  :8001   │  │ :27017    │
│React   │  │ FastAPI  │  │           │
└────────┘  └──────────┘  └───────────┘
                │
                ▼
         Auto-seeds data
         on first startup
```

---

## Startup Sequence

1. **MongoDB** starts first and becomes healthy
2. **Backend** starts after MongoDB is healthy
   - Checks if database is empty
   - If empty, auto-seeds default data (products, categories, etc.)
   - Logs: "Auto-seed completed successfully!"
3. **Frontend** starts after Backend is healthy
4. **Nginx** starts and routes traffic

---

## Useful Commands

```bash
# View all logs
docker-compose logs -f

# View backend logs (check for auto-seed messages)
docker logs dryfruto_backend

# View nginx logs only
docker logs dryfruto_proxy

# Restart all services
docker-compose restart

# Rebuild and redeploy
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Check container status
docker ps

# Access MongoDB
docker exec -it dryfruto_db mongosh

# Check if data was seeded
docker exec -it dryfruto_db mongosh dryfruto --eval "db.products.countDocuments()"
```

---

## Troubleshooting

### Data not showing on website?

**Option 1: Check if auto-seed ran**
```bash
docker logs dryfruto_backend | grep -i seed
```

You should see:
```
MongoDB connection successful
Database is empty, auto-seeding with default data...
Seeded 6 categories
Seeded 12 products
...
Auto-seed completed successfully!
```

**Option 2: Manually trigger seed via Admin Panel**
1. Go to `http://statellmarketing.com:8080/admin`
2. Click "Seed Initial Data" button
3. Confirm the action
4. Wait for success message

**Option 3: Manually trigger seed via API**
```bash
curl -X POST http://statellmarketing.com:8080/api/seed-data
```

Expected response:
```json
{"message":"Data seeded successfully","categories":6,"products":12,"heroSlides":3,"testimonials":6,"giftBoxes":6}
```

### Backend not starting?
```bash
docker logs dryfruto_backend
```

### MongoDB connection issues?
```bash
# Check if MongoDB is running
docker ps | grep mongodb

# Check MongoDB logs
docker logs dryfruto_db

# Test MongoDB connection from backend container
docker exec -it dryfruto_backend python -c "from motor.motor_asyncio import AsyncIOMotorClient; c = AsyncIOMotorClient('mongodb://mongodb:27017'); print('Connected!')"
```

### Import error for seed_data?
The seed_data.py file should be in /app/ inside the backend container:
```bash
docker exec -it dryfruto_backend ls -la /app/
# Should show seed_data.py
```

---

## Firewall Configuration

Make sure these ports are open on your VPS:

```bash
# Check firewall status
ufw status

# Open required ports
ufw allow 8080/tcp   # HTTP
ufw allow 8443/tcp   # HTTPS
ufw allow 22/tcp     # SSH

# Enable firewall
ufw enable
```
