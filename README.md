# 🚀 QueueFlow — Distributed Job Queue System

A scalable, asynchronous job processing system built with **Node.js, TypeScript, Express, BullMQ, Redis, and PostgreSQL**. QueueFlow accepts jobs through a REST API, processes them in background workers, and tracks their status with persistent database storage.

## 📌 Overview

QueueFlow is designed to handle long-running tasks without making API clients wait for processing to finish. Jobs are added to a queue and processed asynchronously by background workers.

The system includes job status tracking, automatic retries, exponential backoff, configurable worker concurrency, and Docker-based deployment.

## ✨ Key Features

- **Asynchronous Job Processing:** Accept jobs instantly and process them in the background.
- **REST API:** Submit jobs and retrieve their current status through HTTP endpoints.
- **Persistent Job Tracking:** Store job information and processing results in PostgreSQL.
- **Automatic Retries:** Retry failed jobs with exponential backoff.
- **Concurrent Processing:** Process multiple jobs simultaneously using BullMQ workers.
- **Scalable Workers:** Run multiple worker instances to increase processing capacity.
- **Redis Queue Management:** Manage job queues and background processing using Redis.
- **Dockerized Deployment:** Run the API, workers, Redis, and PostgreSQL using Docker Compose.

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| Node.js | Backend runtime |
| TypeScript | Type-safe application development |
| Express.js | REST API |
| BullMQ | Background job queue and retry management |
| Redis | Queue storage and job coordination |
| PostgreSQL | Persistent job status and metadata |
| Docker | Containerization |
| Docker Compose | Multi-service orchestration |

## 🏗️ System Architecture

```text
             Client Application
                     |
                     v
              Express REST API
                     |
            +--------+--------+
            |                 |
            v                 v
        Redis Queue       PostgreSQL
            |
            v
      Background Workers
            |
            v
      Job Execution
            |
            v
    Update Job Status
      in PostgreSQL
```

### How It Works

1. A client submits a new job through the REST API.
2. The API creates a job record in PostgreSQL and queues the job in Redis.
3. A background worker retrieves the job from BullMQ.
4. The worker processes the job asynchronously.
5. The job status is updated in PostgreSQL.
6. If processing fails, the configured retry policy attempts the job again.
7. The client can check the latest job status using the job ID.

## ⚙️ Getting Started

### Prerequisites

Install the following tools:

- [Node.js](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/QueueFlow.git
cd QueueFlow
```

Replace `YOUR-USERNAME` with your GitHub username.

### 2. Start the Application

Make sure Docker Desktop is running, then execute:

```bash
docker compose up --build
```

This starts the API server, Redis, PostgreSQL, and background worker service.

The API will be available at:

`http://localhost:3000`

### 3. Stop the Application

```bash
docker compose down
```

## 🔌 API Endpoints

### Create a Job

**Endpoint:** `POST /jobs`

Submit a new job for asynchronous processing.

```bash
curl -X POST http://localhost:3000/jobs
```

Example response:

```json
{
  "id": "your-job-uuid"
}
```

The returned ID can be used to track the job.

### Get Job Status

**Endpoint:** `GET /jobs/:id`

Retrieve the status and metadata of a job.

```bash
curl http://localhost:3000/jobs/your-job-uuid
```

Example response:

```json
{
  "id": "your-job-uuid",
  "status": "processing",
  "attempts": 0,
  "last_error": null,
  "created_at": "...",
  "updated_at": "..."
}
```

The actual status and metadata depend on the job's current state.

## 🔄 Job Processing and Reliability

QueueFlow is configured to demonstrate several background processing concepts:

- **Job lifecycle:** Jobs move through states such as `queued`, `processing`, `succeeded`, and `failed`.
- **Retries:** Failed jobs can be retried up to five attempts, according to the configured BullMQ policy.
- **Exponential backoff:** Retry delays increase between attempts.
- **Concurrency:** Workers can process multiple jobs concurrently, with a configured concurrency of five.
- **Failure simulation:** The worker includes a simulated failure rate to demonstrate retry handling.

## 📂 Project Structure

```text
QueueFlow/
├── src/
│   ├── server.ts          # Express API server
│   ├── worker.ts          # Background job worker
│   ├── queue.ts           # Queue configuration
│   ├── db.ts              # PostgreSQL connection
│   └── scripts/
│       └── seed.ts        # Job seeding script
├── init.sql               # Database initialization
├── Dockerfile             # Docker image configuration
├── docker-compose.yml     # Service orchestration
├── package.json           # Dependencies and scripts
├── package-lock.json      # Dependency lockfile
├── tsconfig.json          # TypeScript configuration
├── .env.example           # Example environment variables
├── .gitignore             # Git exclusions
└── README.md              # Project documentation
```

## 🧪 Build and Development

To install dependencies and compile the TypeScript application locally:

```bash
npm install
npm run build
```

Start the API locally:

```bash
npm start
```

Run the worker locally:

```bash
npm run worker
```

These local commands require Redis and PostgreSQL to be available with the appropriate configuration.

### Seed Jobs

To run the configured seed script after building:

```bash
npm run seed
```

This command runs the project's seed script, which is intended for generating jobs for testing. Run it in an environment where the required services are accessible.

## 🎯 Use Cases

QueueFlow demonstrates concepts useful for applications that need reliable background processing, including:

- Sending emails and notifications
- Processing uploaded files
- Generating reports
- Running scheduled or resource-intensive tasks
- Handling asynchronous API workflows
- Performing batch processing

These are potential applications of the architecture, not additional features implemented in the current project.

