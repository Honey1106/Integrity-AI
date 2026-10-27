# IntegrityAI — Assessment Integrity Review Platform

IntegrityAI is an institutional review platform for assessment operations teams, academic integrity reviewers, and administrators. It enables reviewers to inspect documented telemetry signals, review chronological observation timelines, and record accountable, reasoned determinations with an append-only audit trail.

---

## Architecture Overview

- **Frontend**: React 19, TypeScript, Vite, React Router 7.
- **Backend**: Express, TypeScript, REST API with concurrency version guards (`409 CONFLICT` on stale writes) and audit trail appending.
- **Database**: Local MongoDB (`mongodb://127.0.0.1:27017/integrityai`) with built-in transactional fallback.
- **Port Mapping**:
  - **Frontend UI**: `http://localhost:5173/`
  - **Backend API**: `http://localhost:5000/api`

---

## Quickstart & How to Run

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)
- (Optional) Local MongoDB running on default port `27017`. If MongoDB is not running, the application starts with an in-memory document store.

### 1. Installation
Install dependencies in both directories:
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 2. Running Locally

#### Run Both Services (Recommended)
From the workspace root directory:
```bash
npm run dev
```

#### Run Individually
**Terminal 1 — Backend (Express API on port 5000):**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend (Vite on port 5173):**
```bash
cd frontend
npm run dev
```

Open `http://localhost:5173/` in your browser.

---

## Configuration & Environment Variables

Default settings run with zero configuration. To customize, create a `.env` file in the `backend/` folder:

| Variable | Default Value | Description |
|---|---|---|
| `PORT` | `5000` | Port for the Express backend REST server |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/integrityai` | Connection string for local MongoDB database |

---

## Testing & Verification

Run tests from the root or individual directories:

```bash
# Run backend API integration tests (9 tests)
npm run test --prefix backend

# Run frontend unit & service tests (51 tests)
npm run test --prefix frontend

# Run frontend typecheck
npm run typecheck --prefix frontend

# Run frontend linter
npm run lint --prefix frontend

# Build production bundles
npm run build --prefix backend
npm run build --prefix frontend
```
