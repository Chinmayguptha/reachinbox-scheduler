# ReachInbox Email Scheduler

Production-grade email scheduler service with a dashboard, built with TypeScript, Express, BullMQ, Redis, React using Vite, and Tailwind CSS.
This project implements a distributed scheduling system that persists jobs in Redis and orchestrates email sending via `nodemailer` (Ethereal).

## 🚀 Features Implemented

### Backend
- **Scheduler**: Uses **BullMQ** (Redis-based) to handle delayed jobs. No cron jobs are used, ensuring scalability.
- **Persistence**: Jobs are stored in Redis using AOF/RDB persistence logic (standard Redis). PostgreSQL is used to store high-level Job Metadata (status, history).
- **Rate Limiting**:
  - **Global Limit**: Enforces a strict limit (e.g., 100 emails / hour) using BullMQ's `limiter` configuration.
  - **Throttling**: Introduces a configurable delay (e.g., 2s) between processing each email in the worker to simulate real-world provider limits.
- **Concurrency**: Configured worker concurrency (default: 5) to process multiple jobs in parallel while respecting rate limits.
- **Fault Tolerance**:
  - System handles server restarts gracefully. BullMQ picks up pending/delayed jobs automatically upon restart.
  - **Idempotency**: Checks DB status before sending to prevent duplicate sends if a job is retried by Redis.

### Frontend
- **Authentication**: Google Login (with a "Demo Mode" bypass for easy testing).
- **Dashboard**: Tabbed view for **Scheduled** and **Sent** emails.
- **Compose**: Modal to create campaigns, supporting CSV/Text file upload for bulk recipient parsing.
- **Real-time Status**: Polls the backend to show job status updates (Pending -> Sent).

## 🛠️ Architecture Overview

1.  **Scheduling Flow**:
    - User schedules email -> API creates DB Entry (Pending) -> Adds Job to BullMQ with `delay`.
    - BullMQ holds the job in Redis until `delay` expires.
2.  **Processing Flow**:
    - Worker picks up job -> Checks DB for validity.
    - Updates Status -> Processing.
    - Waits for Rate Limit (Throttling).
    - Sends Email (Ethereal SMTP).
    - Updates Status -> Completed (or Failed).
3.  **Persistence Strategy**:
    - **Redis**: Acts as the "Timekeeper". If the Node server dies, Redis keeps the timer running. When Node comes back, it polls Redis for due jobs.
    - **PostgreSQL**: Acts as the "Source of Truth" for reporting and user history.

## 🏃 Run Instructions

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose

### Step 1: Start Infrastructure
```bash
docker compose up -d
```
*Starts Redis (6379) and PostgreSQL (5432).*
*(Note: If Docker is unavailable, the app runs in a "Demo Mock Mode" with in-memory storage for demonstration purposes).*

### Step 2: Install & Run
We use a Monorepo structure. You can run everything from the root.

```bash
npm install
npm run dev
```

### Step 3: Access
- **Frontend Dashboard**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:3000](http://localhost:3000)
- **Ethereal Mail**: Check your terminal logs for the "Preview URL" whenever an email is sent.

## 🧪 Testing the Solution

1.  **Login**: Use the **"Demo Login"** button on the login screen.
2.  **Schedule**: Click "Compose", upload a dummy CSV (or just type a body), and pick a time 1 minute in the future.
3.  **Restart Verification**:
    - Schedule an email for 5 minutes in the future.
    - Stop the server (`Ctrl+C`).
    - Restart `npm run dev` before the 5 minutes are up.
    - Wait. The email will still send at the correct time because Redis persisted the schedule.
4.  **Rate Limiting**:
    - Schedule 10 emails instantly.
    - Watch the logs; they will be processed 1-by-1 with a delay, not all at once.

## 📝 Assumptions & Trade-offs
- **Auth**: Used a Mock Login for simplicity as Google OAuth requires a verified cloud project. Real OAuth logic is implemented but bypassed for the demo.
- **Queues**: Used standard BullMQ. For complex multi-tenant rate limiting (per-user specific limits), we would typically use **BullMQ Groups** (Pro feature) or dynamic queue instantiation. Here, we implemented a Global Limit + Worker Throttling which satisfies the assignment constraints efficiently.
- **Docker**: The codebase is designed for Docker. If run locally without Docker, it falls back to a limited "Safe Mode" to ensure the UI can still be reviewed.
