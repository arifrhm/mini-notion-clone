.PHONY: help install dev dev-build dev-up dev-down dev-logs dev-restart prod prod-build prod-up prod-down prod-logs prod-restart clean db-reset kill-port

# Default target
help:
	@echo "Available commands:"
	@echo "  make install      - Install dependencies"
	@echo "  make dev          - Start development environment"
	@echo "  make dev-build    - Build development containers"
	@echo "  make dev-up       - Start development containers (detached)"
	@echo "  make dev-down     - Stop development containers"
	@echo "  make dev-logs     - View development logs"
	@echo "  make dev-restart  - Restart development containers"
	@echo "  make prod         - Start production environment"
	@echo "  make prod-build   - Build production containers"
	@echo "  make prod-up      - Start production containers (detached)"
	@echo "  make prod-down    - Stop production containers"
	@echo "  make prod-logs    - View production logs"
	@echo "  make prod-restart - Restart production containers"
	@echo "  make clean        - Remove all containers and volumes"
	@echo "  make db-reset     - Reset database (dev)"
	@echo "  make kill-port    - Kill process on port 3001"

# Install dependencies
install:
	npm install

# Development commands
dev:
	docker-compose -f docker-compose.dev.yml up

dev-build:
	docker-compose -f docker-compose.dev.yml build

dev-up:
	docker-compose -f docker-compose.dev.yml up -d

dev-down:
	docker-compose -f docker-compose.dev.yml down

dev-logs:
	docker-compose -f docker-compose.dev.yml logs -f app

dev-restart:
	docker-compose -f docker-compose.dev.yml restart app

# Production commands
prod:
	docker-compose up

prod-build:
	docker-compose build

prod-up:
	docker-compose up -d

prod-down:
	docker-compose down

prod-logs:
	docker-compose logs -f app

prod-restart:
	docker-compose restart app

# Utilities
kill-port:
	@echo "Killing process on port 3001..."
	@lsof -ti:3001 | xargs kill -9 2>/dev/null || echo "No process found on port 3001"

# Clean up
clean:
	docker-compose -f docker-compose.dev.yml down -v
	docker-compose down -v
	@echo "All containers and volumes removed"

# Reset database (development only)
db-reset:
	docker-compose -f docker-compose.dev.yml down -v postgres
	docker-compose -f docker-compose.dev.yml up -d postgres
	@echo "Database reset complete"
