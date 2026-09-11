# VeloFlow Architecture Documentation

## 1. High-Level Architectural Overview

VeloFlow is architected as an enterprise-grade, real-time client project dashboard tailored for multi-tenant internal SaaS workflows with three distinct organizational roles: **ADMIN**, **PROJECT_MANAGER**, and **DEVELOPER**.

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer (SPA)                     │
│  React 18 + Vite + TypeScript + Tailwind CSS + Lucide Icons │
│       TanStack Query v5 (Server) + Zustand (Client UI)      │
│            Axios (HTTP) + Socket.IO Client (WS)             │
└──────────────┬──────────────────────────────▲───────────────┘
               │ HTTP REST Requests           │ Real-Time Events
               │ (withCredentials: true)      │ (JWT Handshake)
               ▼                              │
┌─────────────────────────────────────────────┴───────────────┐
│                      Backend Layer                          │
│                   Node.js + Express + TS                    │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Security & Middleware                                 │  │
│  │ Helmet, CORS, CookieParser, RateLimiter               │  │
│  │ authenticate, authorize, enforceOwnership             │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────┐  ┌─────────────────────────────┐   │
│  │ REST Controllers  │  │ Real-Time Socket.IO Server   │   │
│  └─────────┬─────────┘  └──────────────┬───────────────┘   │
│            ▼                           ▼                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Service Business Logic Layer                          │  │
│  │ Auth, Project, Task, Activity, Notification, Presence │  │
│  └─────────────────────────┬─────────────────────────────┘  │
│                            │ Database Transactions          │
│                            │ ($transaction)                 │
│                            ▼                                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Data Access Layer (Prisma ORM)                        │  │
│  └─────────────────────────┬─────────────────────────────┘  │
└────────────────────────────┼────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                 Persistent Database Layer                   │
│             PostgreSQL 16 Relational Engine                 │
│         ACID Transactions, Foreign Keys, Indexes            │
└─────────────────────────────────────────────────────────────┘
```

## 2. Separation of Concerns & Clean Layering

1. **Route Layer (`backend/src/routes/`)**: Defines RESTful URL paths, maps HTTP methods, and attaches route-specific middleware.
2. **Middleware Layer (`backend/src/middleware/`)**:
   - `authenticate`: Extracts Bearer token, validates cryptographic signature and expiration.
   - `authorize(...roles)`: Verifies role permissions.
   - `enforceProjectOwnership`: Strictly verifies `project.createdById === req.user.id`.
   - `enforceTaskAccess`: Verifies `task.assignedDeveloperId === req.user.id` or `task.project.createdById === req.user.id`.
   - `validateBody / validateParams / validateQuery`: Applies Zod schema validation.
   - `errorHandler`: Converts any thrown error or `AppError` into a uniform JSON response without leaking stack traces.
3. **Controller Layer (`backend/src/controllers/`)**: Thin HTTP coordinators that parse inputs, invoke the corresponding Service method, and serialize HTTP responses.
4. **Service Layer (`backend/src/services/`)**: Houses all business rules, authorization decisions, database transaction wrapping (`prisma.$transaction`), and dispatches real-time events.
5. **Background Scheduler (`backend/src/jobs/`)**: Uses `node-cron` to execute idempotent scans for overdue tasks every 15 minutes independently of user HTTP traffic.

## 3. Threat Modeling & Mitigation Matrix

| Threat | Attack Scenario | Mitigation in VeloFlow |
|---|---|---|
| **IDOR / Resource Hijacking** | Developer passes another dev's Task ID in `GET /api/tasks/:id` or PM passes another PM's Project ID in `PATCH /api/projects/:id` | Ownership middleware & DB query scoping guarantee foreign resource access returns HTTP 403 Forbidden. |
| **Token Theft via XSS** | Attacker executes malicious JS script attempting `localStorage.getItem("token")` | Refresh tokens are strictly stored in `HttpOnly`, `SameSite=Strict`, `Path=/api/auth` cookies inaccessible to JavaScript. |
| **Replay Attack on Stolen Token** | Malicious actor captures a rotated refresh token and submits it | Database maintains `revokedAt`. If an already-rotated token is received, token reuse detection revokes all active sessions for that user. |
| **Data Leakage in Real-Time Feeds** | Connected developer client intercepts websocket broadcast containing PM project discussions | Socket.IO server verifies room membership; task status events are only dispatched to project rooms and user-specific rooms. |
| **Race Condition on Task Status** | Concurrent updates to task status leading to inconsistent activity logs or missed notifications | Prisma ACID transaction (`prisma.$transaction`) atomically updates task, writes `ActivityLog`, and creates `Notification`. |
| **Privilege Escalation** | Client submits `{ role: "ADMIN" }` or `{ createdById: "other" }` | Zod validators explicitly strip identity and ownership fields; `createdById` is taken strictly from `req.user.sub`. |
