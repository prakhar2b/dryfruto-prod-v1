#!/bin/bash

# DryFruto Deployment Script
# Usage: ./deploy.sh [dev|prod]

set -e

MODE=${1:-prod}
DOMAIN="statellmarketing.com"

echo "==========================================="
echo "  DryFruto Deployment Script"
echo "  Mode: $MODE"
echo "==========================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Function to setup SSL with Let's Encrypt
setup_ssl() {
    echo "Setting up SSL certificates for $DOMAIN..."
    
    # Create directories
    mkdir -p certbot/conf certbot/www
    
    # Initial certificate request
    docker-compose run --rm certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email admin@$DOMAIN \
        --agree-tos \
        --no-eff-email \
        -d $DOMAIN \
        -d www.$DOMAIN
    
    echo "SSL certificates created successfully!"
}

# Development deployment
if [ "$MODE" == "dev" ]; then
    echo "Starting development environment on port 9001..."
    docker-compose -f docker-compose.dev.yml down
    docker-compose -f docker-compose.dev.yml build
    docker-compose -f docker-compose.dev.yml up -d
    echo ""
    echo "Development server running at: http://localhost:9001"
    echo ""
    
# Production deployment
elif [ "$MODE" == "prod" ]; then
    echo "Starting production environment..."
    
    # Check if SSL certificates exist
    if [ ! -d "certbot/conf/live/$DOMAIN" ]; then
        echo "SSL certificates not found. Setting up Let's Encrypt..."
        
        # Start nginx temporarily for certificate validation
        docker-compose up -d nginx
        sleep 5
        
        setup_ssl
        
        # Restart all services
        docker-compose down
    fi
    
    docker-compose down
    docker-compose build
    docker-compose up -d
    
    echo ""
    echo "Production server running!"
    echo "HTTP:  http://$DOMAIN:9001"
    echo "HTTPS: https://$DOMAIN"
    echo ""
    
# SSL setup only
elif [ "$MODE" == "ssl" ]; then
    setup_ssl
    
else
    echo "Usage: ./deploy.sh [dev|prod|ssl]"
    echo "  dev  - Development mode (HTTP only, port 9001)"
    echo "  prod - Production mode (HTTP + HTTPS)"
    echo "  ssl  - Setup SSL certificates only"
    exit 1
fi

# Show container status
echo ""
echo "Container Status:"
docker-compose ps

echo ""
echo "Deployment complete!"
