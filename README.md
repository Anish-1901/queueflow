# Minimal Job Queue System

A backend-only job queue system built with Node.js, TypeScript, Express, Redis (BullMQ), and PostgreSQL.

## Tech Stack
- **Node.js + TypeScript**: Backend runtime and language
- **Express**: HTTP API
- **BullMQ + Redis**: Distributed job queue
- **PostgreSQL**: Durable job state storage
- **Docker**: Containerization

## Prerequisites
- Docker & Docker Compose

## Setup & Run

1. **Start the system**
   ```bash
   docker compose up --build
   ```
   This will start:
   - Redis (port 6379)
   - Postgres (port 5432)
   - API Server (port 3000)
   - Workers (2 instances by default)

2. **Scale Workers**
   You can scale workers dynamically:
   ```bash
   docker compose up --scale worker=4
   ```

## Usage

### 1. Enqueue a Job
```bash
curl -X POST http://localhost:3000/jobs
```
Response: `{"id":"<uuid>"}`

### 2. Check Job Status
```bash
curl http://localhost:3000/jobs/<uuid>
```
Response:
```json
{
  "id": "<uuid>",
  "status": "processing",
  "attempts": 0,
  "last_error": null,
  "created_at": "...",
  "updated_at": "..."
}
```

### 3. Seed 1000 Jobs
To stress test the system and verify concurrency:
```bash
# Enter the API container
docker compose exec api sh

# Run the seed script
npm run seed
```
Or locally if you have dependencies installed:
```bash
npm install
npm run build
npm run seed
```

## Verification of Requirements

1. **Queue long-running tasks instantly**: 
   - `POST /jobs` returns immediately (only enqueues to Redis and inserts initial DB record).
   - Processing happens asynchronously in background workers.

2. **Job State Persistence**:
   - Jobs are stored in PostgreSQL with statuses: `queued`, `processing`, `succeeded`, `failed`.
   - `GET /jobs/:id` retrieves real-time status from DB.

3. **Retries & Backoff**:
   - Workers simulate a 20% failure rate.
   - Failed jobs are retried up to 5 times with exponential backoff (BullMQ configuration).
   - Failed attempts are recorded in the DB `attempts` column.

4. **Concurrency**:
   - `docker-compose.yml` defines multiple worker replicas.
   - BullMQ worker is configured with `concurrency: 5`.

5. **Dockerizaion**:
   - Entire stack is Dockerized.
   - `docker-compose.yml` orchestrates all services.
