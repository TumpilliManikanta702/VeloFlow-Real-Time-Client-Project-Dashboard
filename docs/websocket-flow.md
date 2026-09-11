# VeloFlow Real-Time WebSocket Architecture

## 1. WebSocket Authentication Handshake

```
Client (Browser)                           Socket.IO Gateway                           PostgreSQL / Auth
       │                                           │                                           │
       │─── Handshake with JWT in auth.token ─────>│                                           │
       │                                           │─── Verify JWT Access Token ──────────────>│
       │                                           │<── Valid Payload (sub, role, name) ───────│
       │                                           │                                           │
       │                                           │─── Join room "user:{userId}"              │
       │                                           │─── If ADMIN, join "global:admin"          │
       │                                           │─── Update Presence (isOnline = true) ────>│
       │<── Connection Established ────────────────│                                           │
```

1. **Transport Selection**: Socket.IO initializes with `['websocket', 'polling']` to guarantee zero-latency bi-directional push while supporting network fallbacks.
2. **Handshake Verification**: Handshake middleware inspects `socket.handshake.auth.token`. If missing, invalid, or expired, connection is rejected immediately.
3. **Session Identification**: `socket.data.user` stores the authenticated identity.

---

## 2. Room Authorization & Security Matrix

Clients cannot arbitrarily subscribe to rooms. When a client emits `join_room`, the server enforces strict DB checks before executing `socket.join(room)`:

| Room Pattern | Allowed Users | Server-Side Validation Rule |
|---|---|---|
| `user:{userId}` | Only the authenticated user | Checked in handshake; `user.sub === userId` |
| `global:admin` | Admins only | `user.role === 'ADMIN'` verified |
| `global:activity` | Admins only | `user.role === 'ADMIN'` verified |
| `project:{projectId}` | Admins, Project PM, Assigned Devs | Admin allowed; PM allowed if `project.createdById === user.sub`; Dev allowed only if developer has an assigned task in that project |

---

## 3. Real-Time Task Status Change Flow (Transaction Guarantee)

```
[Developer / PM]
       │
       │ 1. PATCH /api/tasks/:id/status
       ▼
[Express Controller & Middleware]
       │
       │ 2. Authenticate & Enforce Task Access
       ▼
[Task Service: Prisma $transaction]
       │
       │ 3. Atomic DB Write:
       │    - UPDATE Task status
       │    - INSERT ActivityLog record
       │    - INSERT Notification (if moving to IN_REVIEW)
       ▼
[Transaction Committed Successfully]
       │
       │ 4. Emit Events via Socket.IO
       ├───────────────────────────────────────────────┐
       ▼                                               ▼
To: `project:{projectId}`                     To: `global:admin`
(Project Manager & Assigned Devs)             (Admin Live Overview)
       │                                               │
       ▼                                               ▼
To: `user:{pmId}`
(If IN_REVIEW, pushes notification + unread badge count)
```

**Zero Ghost Events Guarantee**: Events are dispatched **ONLY** after the PostgreSQL transaction has committed successfully. If a database error occurs, no socket events are emitted, preventing UI desynchronization.

---

## 4. Multi-Tab Online Presence Tracking

To prevent false offline state transitions when a user closes one browser tab while another remains open:
1. `PresenceManager` maintains an in-memory `Map<userId, Set<socketId>>`.
2. On connection:
   - If `Set` was empty, user transitioned from offline to online. Updates PostgreSQL `User.isOnline = true` and emits `presence:update` to `global:admin`.
3. On disconnection:
   - Removes `socketId` from `Set`.
   - Only when `Set.size === 0` is the user considered offline. Updates PostgreSQL `User.isOnline = false` and sets `lastSeenAt = new Date()`.

---

## 5. Offline Recovery & Missed Event Catchup

When a client reconnects after network disruption or browser reload:
1. Socket client reconnects and authenticates.
2. Frontend triggers `GET /api/activity/recent`.
3. Backend executes a role-scoped SQL query on PostgreSQL:
   - **Admin**: `SELECT * FROM ActivityLog ORDER BY createdAt DESC LIMIT 20;`
   - **PM**: `SELECT * FROM ActivityLog WHERE projectId IN (SELECT id FROM Project WHERE createdById = user.id) ORDER BY createdAt DESC LIMIT 20;`
   - **Developer**: `SELECT * FROM ActivityLog WHERE taskId IN (SELECT id FROM Task WHERE assignedDeveloperId = user.id) ORDER BY createdAt DESC LIMIT 20;`
4. This guarantees zero data loss without depending on in-memory buffers or external caching layers.
