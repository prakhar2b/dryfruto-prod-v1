# Backend Dockerfile - Python FastAPI with Auto-Seed
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code (including seed_data.py for auto-seeding)
COPY . ./

# Create uploads directory
RUN mkdir -p /app/uploads

EXPOSE 8001

# Health check - verifies API is responding
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:8001/api/health || exit 1

# Start the server - auto-seed happens on startup when DB is empty
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
