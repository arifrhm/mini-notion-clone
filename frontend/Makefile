.PHONY: help dev dev-build dev-up dev-down dev-logs prod prod-build prod-up prod-down prod-logs clean

help:
	@echo "Mini Notion Clone - Frontend Docker Commands"
	@echo ""
	@echo "Development:"
	@echo "  make dev          - Build and run development environment"
	@echo "  make dev-build    - Build development Docker image"
	@echo "  make dev-up       - Start development containers"
	@echo "  make dev-down     - Stop development containers"
	@echo "  make dev-logs     - View development logs"
	@echo ""
	@echo "Production:"
	@echo "  make prod         - Build and run production environment"
	@echo "  make prod-build   - Build production Docker image"
	@echo "  make prod-up      - Start production containers"
	@echo "  make prod-down    - Stop production containers"
	@echo "  make prod-logs    - View production logs"
	@echo ""
	@echo "Utilities:"
	@echo "  make clean        - Remove all containers, images, and volumes"

# Development commands
dev: dev-build dev-up

dev-build:
	docker-compose -f docker-compose.dev.yml build

dev-up:
	docker-compose -f docker-compose.dev.yml up -d
	@echo "Development server running at http://localhost:3000"

dev-down:
	docker-compose -f docker-compose.dev.yml down

dev-logs:
	docker-compose -f docker-compose.dev.yml logs -f

# Production commands
prod: prod-build prod-up

prod-build:
	docker-compose -f docker-compose.yml build

prod-up:
	docker-compose -f docker-compose.yml up -d
	@echo "Production server running at http://localhost:80"

prod-down:
	docker-compose -f docker-compose.yml down

prod-logs:
	docker-compose -f docker-compose.yml logs -f

# Clean up
clean:
	docker-compose -f docker-compose.dev.yml down -v --rmi all --remove-orphans
	docker-compose -f docker-compose.yml down -v --rmi all --remove-orphans
	@echo "Cleanup complete"
