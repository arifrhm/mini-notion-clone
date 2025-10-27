# Docker Deployment Guide

## Prerequisites
- Docker installed
- Docker Compose installed

## Quick Start with Makefile

### Development Mode
```bash
# Start development environment with hot reload
make dev

# Or run in background
make dev-up

# View logs
make dev-logs

# Stop development
make dev-down
```

### Production Mode
```bash
# Start production environment
make prod

# Or run in background
make prod-up

# View logs
make prod-logs

# Stop production
make prod-down
```

### Other Commands
```bash
# Install dependencies
make install

# Reset database (dev only)
make db-reset

# Clean all containers and volumes
make clean

# View all available commands
make help
```

## Manual Docker Compose Commands

### Development
```bash
# Build and run
docker-compose -f docker-compose.dev.yml up

# Run in background
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f app

# Stop services
docker-compose -f docker-compose.dev.yml down
```

### Production
```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## Services

### Backend API
- Port: 3001
- URL: http://localhost:3001
- **API Documentation (Swagger)**: http://localhost:3001/api/docs

### PostgreSQL Database
- Port: 5432
- Database: mini_notion
- Username: postgres
- Password: postgres

## Development vs Production

### Development Mode (docker-compose.dev.yml)
- Hot reload enabled (watches file changes)
- Source code mounted as volume
- NODE_ENV: development
- Uses Dockerfile.dev
- Faster iteration for development

### Production Mode (docker-compose.yml)
- Optimized multistage build
- No file watching
- NODE_ENV: production
- Uses Dockerfile
- Smaller image size (~200MB)

## Environment Variables

Edit `docker-compose.yml` to customize:
- `JWT_SECRET`: Your JWT secret key
- `JWT_EXPIRES_IN`: Token expiration time
- `CORS_ORIGIN`: Frontend URL
- Database credentials

## Build Only
```bash
docker build -t mini-notion-backend .
```

## Run Without Docker Compose
```bash
docker run -p 3001:3001 \
  -e DB_HOST=host.docker.internal \
  -e DB_PORT=5432 \
  -e DB_USERNAME=postgres \
  -e DB_PASSWORD=postgres \
  -e DB_NAME=mini_notion \
  mini-notion-backend
```
