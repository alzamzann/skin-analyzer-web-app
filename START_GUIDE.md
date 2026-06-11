# Dermalyzer Start Guide

Run commands from the repository root:

```bash
cd /home/alzamzann/skin-analyzer/skin-analyzer-web-app
```

## First-Time Setup

```bash
# Backend dependencies and environment
conda activate skin-backend
cd backend
python -m pip install -r requirements.txt
cp .env.example .env
cd ..

# Frontend dependencies
cd frontend
npm install
cd ..

# Database
docker compose up -d db
conda activate skin-backend
cd backend
python -m alembic upgrade head
python scripts/import_catalog.py
cd ..
```

## Start The Application

Use three terminals.

### 1. Database

```bash
docker compose up -d db
```

### 2. Backend

```bash
conda activate skin-backend
cd backend
python -m uvicorn app.main:app --reload
```

Backend API: <http://127.0.0.1:8000/docs>

### 3. Frontend

```bash
cd frontend
npm run dev
```

Frontend: <http://localhost:3000>

If the backend uses another port:

```bash
DERMALYZER_API_BASE_URL=http://127.0.0.1:8001 npm run dev
```

## Refresh Dataset

After editing either CSV:

```bash
conda activate skin-backend
cd backend
python scripts/import_catalog.py
python scripts/compare_catalogs.py
```

Restart the backend afterward.

## Stop

Stop frontend/backend with `Ctrl+C`, then:

```bash
docker compose stop db
```

Delete the local database and start clean:

```bash
docker compose down -v
```
