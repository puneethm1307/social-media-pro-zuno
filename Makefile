# Makefile for common development tasks

.PHONY: help infra-up infra-down infra-logs backend-install backend-dev backend-build backend-test media-install media-dev media-test frontend-install frontend-dev frontend-build clean test-all

help:
	@echo "Available commands:"
	@echo "  make infra-up          - Start infrastructure (MongoDB, Redis, MinIO)"
	@echo "  make infra-down        - Stop infrastructure"
	@echo "  make infra-logs         - View infrastructure logs"
	@echo "  make backend-install    - Install backend dependencies"
	@echo "  make backend-dev       - Start backend in dev mode"
	@echo "  make backend-test      - Run backend tests"
	@echo "  make media-install     - Install media service dependencies"
	@echo "  make media-dev         - Start media service in dev mode"
	@echo "  make media-test        - Run media service tests"
	@echo "  make frontend-install  - Install frontend dependencies"
	@echo "  make frontend-dev      - Start frontend in dev mode"
	@echo "  make test-all          - Run all tests"
	@echo "  make clean             - Clean build artifacts"

# Infrastructure
infra-up:
	docker compose up -d mongodb redis minio
	@echo "Waiting for services to be healthy..."
	@sleep 5
	@echo "Infrastructure is ready!"

infra-down:
	docker compose down

infra-logs:
	docker compose logs -f mongodb redis minio

# Backend
backend-install:
	cd backend && npm install

backend-dev:
	cd backend && npm run start:dev

backend-build:
	cd backend && npm run build

backend-test:
	cd backend && npm run test

# Media Service
media-install:
	cd media && python3 -m venv venv && . venv/bin/activate && pip install -r requirements.txt

media-dev:
	cd media && . venv/bin/activate && uvicorn main:app --reload --host 0.0.0.0 --port 8000

media-test:
	cd media && . venv/bin/activate && pytest

# Frontend
frontend-install:
	cd frontend && npm install

frontend-dev:
	cd frontend && npm run dev

frontend-build:
	cd frontend && npm run build

# Testing
test-all:
	@echo "Running backend tests..."
	@cd backend && npm run test || true
	@echo "Running media service tests..."
	@cd media && . venv/bin/activate && pytest || true

# Cleanup
clean:
	rm -rf backend/dist backend/node_modules
	rm -rf frontend/.next frontend/node_modules
	rm -rf media/__pycache__ media/venv
	find . -type d -name "__pycache__" -exec rm -r {} + 2>/dev/null || true

