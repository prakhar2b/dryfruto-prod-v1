#!/bin/bash

#===========================================
# DryFruto - Docker Update Script
# Pull latest changes and rebuild containers
#===========================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

APP_DIR="/var/www/dryfruto"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  DryFruto - Docker Update Script${NC}"
echo -e "${GREEN}========================================${NC}"

# Navigate to app directory
cd $APP_DIR

# Pull latest changes
echo -e "${YELLOW}Pulling latest changes from GitHub...${NC}"
git pull origin main

# Get domain from .env
DOMAIN=$(grep SITE_URL .env | cut -d '=' -f2 | sed 's|http://||' | sed 's|https://||')

# Rebuild frontend if changed
if git diff HEAD~1 --name-only | grep -q "frontend/"; then
  echo -e "${YELLOW}Frontend changed. Rebuilding...${NC}"
  cd frontend
  npm install --legacy-peer-deps
  npm run build
  cd ..
fi

# Check if Docker files changed
if git diff HEAD~1 --name-only | grep -qE "Dockerfile|docker-compose"; then
  echo -e "${YELLOW}Docker configuration changed. Rebuilding containers...${NC}"
  docker-compose -f docker-compose.prod.yml build --no-cache
fi

# Restart containers
echo -e "${YELLOW}Restarting containers...${NC}"
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d

# Wait for services
sleep 5

# Show status
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Update Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
docker-compose -f docker-compose.prod.yml ps
