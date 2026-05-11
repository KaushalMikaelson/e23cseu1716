# Notification System Design

---

## Stage 1 — REST API Design

### Endpoints

#### GET `/api/notifications`

Fetches a paginated list of notifications with optional filtering.

**Query Parameters**

| Param               | Type                              | Default |
|---------------------|-----------------------------------|---------|
| `page`              | `number`                          | `1`     |
| `limit`             | `number`                          | `10`    |
| `notification_type` | `Event` \| `Result` \| `Placement` | —      |

**Request**
```
GET /api/notifications?page=1&limit=5&notification_type=Placement
```

**Response — 200**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "1",
        "type": "Placement",
        "message": "TCS hiring drive scheduled for 15th May.",
        "isRead": false,
        "createdAt": "2024-05-10T08:00:00Z"
      }
    ],
    "meta": {
      "page": 1,
      "limit": 5,
      "total": 4,
      "totalPages": 1
    }
  }
}
```

---

#### GET `/api/notifications/:id`

Returns a single notification by ID.

**Response — 200**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "type": "Placement",
    "message": "TCS hiring drive scheduled for 15th May.",
    "isRead": false,
    "createdAt": "2024-05-10T08:00:00Z"
  }
}
```

**Response — 404**
```json
{
  "success": false,
  "message": "Notification with id \"99\" not found"
}
```

---

#### PATCH `/api/notifications/:id/read`

Marks a notification as read. Idempotent — calling it multiple times is safe.

**Response — 200**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "type": "Placement",
    "message": "TCS hiring drive scheduled for 15th May.",
    "isRead": true,
    "createdAt": "2024-05-10T08:00:00Z"
  }
}
```

---

#### GET `/api/priority-inbox`

Returns the top-n unread notifications ranked by type weight and recency.

**Query Parameters**

| Param | Type     | Default |
|-------|----------|---------|
| `n`   | `number` | `10`    |

Supported values: `10`, `15`, `20` (max `50`).

**Request**
```
GET /api/priority-inbox?n=10
```

**Response — 200**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "b283218f-ea5a-4b7c-93a9-1f2f2406d4b0",
        "type": "Placement",
        "message": "CSX Corporation hiring",
        "isRead": false,
        "createdAt": "2026-04-22T17:51:18Z"
      }
    ],
    "n": 10
  }
}
```

---

### Status Codes

| Code | Meaning                          |
|------|----------------------------------|
| 200  | OK                               |
| 400  | Bad Request (invalid query param)|
| 404  | Resource Not Found               |
| 500  | Internal Server Error            |
| 502  | Bad Gateway (external API fail)  |

---

### Pagination Strategy

Offset-based pagination is used: `OFFSET = (page - 1) * limit`.

The response always includes a `meta` object with `page`, `limit`, `total`, and `totalPages` so the client can render pagination controls without an extra count query.

---

### Mark as Read Flow

```
Client                  Backend
  |                        |
  |-- PATCH /notif/:id/read -->|
  |                        |-- find by id (in-memory / DB)
  |                        |-- set isRead = true
  |                        |-- return updated notification
  |<-- 200 updated notif --|
  |                        |
```

---

### Realtime Mechanism — WebSockets / SSE

For realtime notification delivery without polling:

**Server-Sent Events (SSE)** is the simpler choice for one-way push (server → client):

```
Client                          Server
  |--- GET /api/stream ---------->|
  |                               |-- keeps connection open
  |<-- event: new_notification ---|  (on each new notification created)
  |<-- event: mark_read      -----|  (on read state change)
```

SSE works over plain HTTP, needs no special library, and is easy to reconnect on network drop. For two-way communication (e.g., a student sending a reply), **WebSockets** would be the right choice instead.

---

## Stage 2 — Database Design (PostgreSQL)

### Why PostgreSQL

PostgreSQL is a natural fit for this system:

- **ACID compliance** — marking a notification as read must be consistent even under concurrent requests.
- **Row-level locking** — safe concurrent updates to `isRead` per student.
- **Indexing flexibility** — composite indexes for filtering by `studentId + type + isRead` are straightforward.
- **JSON support** — notification metadata (if needed) can be stored in `jsonb` columns without a schema change.

---

### Schema

```sql
CREATE TABLE students (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(150)        NOT NULL,
  email       VARCHAR(255) UNIQUE NOT NULL,
  department  VARCHAR(100)        NOT NULL,
  year        SMALLINT            NOT NULL,
  created_at  TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

CREATE TYPE notification_type AS ENUM ('Event', 'Result', 'Placement');

CREATE TABLE notifications (
  id          SERIAL PRIMARY KEY,
  student_id  INT                 NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  type        notification_type   NOT NULL,
  message     TEXT                NOT NULL,
  is_read     BOOLEAN             NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);
```

---

### Indexing

```sql
-- Speeds up: WHERE student_id = ? AND is_read = false ORDER BY created_at DESC
CREATE INDEX idx_notifications_student_unread_recent
  ON notifications (student_id, is_read, created_at DESC);

-- Speeds up: WHERE student_id = ? AND type = ?
CREATE INDEX idx_notifications_student_type
  ON notifications (student_id, type);
```

---

### Scalability Concerns & Solutions

| Concern            | Solution                                      |
|--------------------|-----------------------------------------------|
| Read-heavy load    | Read replicas — route SELECT queries there    |
| Hot rows (unread)  | Partial index: `WHERE is_read = false`        |
| Table growth       | Range partitioning by `created_at` (monthly)  |
| Repeated queries   | Redis cache on priority inbox (TTL: 60s)      |

**Partitioning** — monthly range partitions on `created_at` keep index sizes manageable. Queries for the current month only scan one partition.

**Caching** — the priority inbox is expensive (fetch external API + heap computation). Cache the result per student with a short TTL (60–120 seconds) in Redis.

---

## Stage 3 — Query Optimization

### Problematic Query

```sql
SELECT * FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt ASC;
```

**Why it is slow:**

1. **`SELECT *`** — fetches all columns including `message` (TEXT). The query planner cannot do index-only scans; it must hit the heap for every row.
2. **No index on `(studentID, isRead, createdAt)`** — PostgreSQL will do a full sequential scan of the `notifications` table, filtering row by row.
3. **Ordering after filtering** — without a proper index the sort happens in memory after the scan.

---

### Optimized Query

```sql
-- Only fetch what the application actually needs
SELECT id, type, message, created_at
FROM notifications
WHERE student_id = 1042
  AND is_read = false
ORDER BY created_at ASC;
```

---

### Composite Index

```sql
CREATE INDEX idx_notifications_student_unread_recent
  ON notifications (student_id, is_read, created_at ASC);
```

With this index, PostgreSQL can:
1. Jump directly to rows where `student_id = 1042`.
2. Filter `is_read = false` within that bucket.
3. Return rows pre-sorted by `created_at` — **no in-memory sort needed**.

**Complexity with index:** `O(log n + k)` where k is the number of matching rows.  
**Complexity without index:** `O(n)` full sequential scan.

---

### Why NOT to index every column

Each index is a separate B-tree that must be updated on every `INSERT`, `UPDATE`, and `DELETE`. Indexing every column:
- Slows down writes significantly (a campus system creates many notifications).
- Wastes disk space.
- Confuses the query planner — it may pick a suboptimal index.

Only index columns that appear in `WHERE`, `ORDER BY`, or `JOIN` clauses on hot query paths.

---

### Bonus Query — Placement Notifications in Last 7 Days

```sql
SELECT DISTINCT s.id, s.name, s.email
FROM students s
JOIN notifications n ON n.student_id = s.id
WHERE n.type = 'Placement'
  AND n.created_at >= NOW() - INTERVAL '7 days';
```

Supporting index:

```sql
CREATE INDEX idx_notifications_type_created
  ON notifications (type, created_at DESC);
```

---

## Stage 4 — Handling DB Overload

When notification reads spike (exam result day, placement season), the database becomes the bottleneck.

### Solutions

#### 1. Redis Caching
Cache the result of expensive queries (e.g., priority inbox, unread count) with a short TTL.

- **Advantage:** Eliminates repeat DB hits for the same data.
- **Tradeoff:** Stale data within the TTL window; cache invalidation complexity.

#### 2. Pagination
Limit result set size per request instead of loading all notifications at once.

- **Advantage:** Reduces memory and query cost per request.
- **Tradeoff:** Client needs to manage pages; not suitable for infinite-scroll without cursor pagination.

#### 3. Lazy Loading
Load notification details only when the user clicks a notification (not upfront).

- **Advantage:** Reduces initial load.
- **Tradeoff:** Extra round-trip on click; perceived as slower if network is slow.

#### 4. WebSockets for Realtime Updates
Push new notifications to connected clients instead of polling every N seconds.

- **Advantage:** Eliminates polling load; instant delivery.
- **Tradeoff:** Persistent connections add memory overhead on the server; needs horizontal scaling with a message broker (Redis pub/sub).

#### 5. Read Replicas
Route all `SELECT` queries to a read replica; primary DB only handles writes.

- **Advantage:** Linear read scaling — add more replicas as traffic grows.
- **Tradeoff:** Replication lag means replicas may be slightly behind the primary; acceptable for notification reads.

---

## Stage 5 — Asynchronous Notification Delivery

### Problem with Sequential `notify_all`

The original implementation proposed by the team:

```python
function notify_all(student_ids: array, message: string):
    for student_id in student_ids:
        send_email(student_id, message)
        save_to_db(student_id, message)
        push_to_app(student_id, message)
```

**Shortcomings:**
1. **Sequential and blocking** — 50,000 students means 50,000 iterations, each performing 3 I/O operations synchronously. This will time out.
2. **No failure isolation** — logs show `send_email` failed for 200 students midway. The loop stopped (or skipped silently), leaving 200 students without notification and no way to know which ones.
3. **No retry mechanism** — there is no retry on transient email failures.
4. **Tight coupling** — `save_to_db` and `send_email` happen in the same loop iteration. A slow or failed email call blocks the DB save for the next student.
5. **No partial recovery** — if the process crashes at student 25,000, there is no way to resume from where it left off.

---

### Redesign Using Queues and Async Workers

```
Admin creates notification
        |
        v
   [Backend API]
        |
        |-- 1. Save notification to DB (fast, synchronous)
        |
        |-- 2. Enqueue job: { notificationId, studentIds[] }
        |           into a message queue (e.g. Bull / RabbitMQ)
        |
        v
   API responds 201 immediately

   [Worker Pool] (separate process)
        |
        | -- Dequeue job
        | -- For each studentId:
        |       send email (with retry on failure)
        |       mark delivery status in DB
```

**Revised Pseudocode**

```typescript
// API handler — fast path
async function createNotification(payload) {
  const notification = await db.notifications.create(payload);
  await queue.add('deliver_notification', {
    notificationId: notification.id,
    studentIds: await db.students.getAllIds(),
  });
  return notification;
}

// Worker — runs separately
queue.process('deliver_notification', async (job) => {
  const { notificationId, studentIds } = job.data;
  for (const studentId of studentIds) {
    await retryable(() => email.send(studentId, notificationId), { retries: 3 });
    await db.deliveryLog.upsert({ notificationId, studentId, status: 'sent' });
  }
});
```

---

### Why DB save and email send must NOT be tightly coupled

1. **Different failure modes** — the DB is local and fast; the email provider is external and can be slow or down.
2. **Different retry semantics** — DB writes are idempotent with transactions; emails must not be sent twice (idempotency key needed).
3. **Different scaling needs** — DB throughput scales with hardware; email throughput is rate-limited by the provider.
4. **Eventual consistency is acceptable** — a student receiving their email 30 seconds after the notification is created is perfectly fine.

---

### Retries and Idempotency

- Each delivery job carries a unique `notificationId + studentId` pair as an idempotency key.
- If a worker crashes mid-job, the queue redelivers it. The worker checks `deliveryLog` before sending to avoid duplicate emails.
- Exponential backoff (1s → 2s → 4s) avoids hammering a degraded email provider.

---

## Stage 6 — Priority Inbox

### Problem Statement

The product manager wants a Priority Inbox that always shows the top-n most important unread notifications first. Priority is determined by:

- **Type weight:** Placement (3) > Result (2) > Event (1)
- **Recency:** More recent notifications rank higher within the same type

### Priority Score Formula

```
priority = typeWeight / (hoursElapsed + 1)
```

A Placement notification from 1 hour ago scores `3 / 2 = 1.5`.  
An Event notification from 1 hour ago scores `1 / 2 = 0.5`.  
A Placement from 10 hours ago scores `3 / 11 ≈ 0.27` — ranked below a recent Event.

This naturally combines type importance and recency in a single comparable value.

---

### Data Source

Notifications are fetched from the evaluation service:

```
GET http://4.224.186.213/evaluation-service/notifications
Authorization: Bearer <token>
```

Example response:
```json
{
  "notifications": [
    { "ID": "uuid", "Type": "Placement", "Message": "CSX Corporation hiring", "Timestamp": "2026-04-22 17:51:18" },
    { "ID": "uuid", "Type": "Result",    "Message": "mid-sem",               "Timestamp": "2026-04-22 17:51:30" },
    { "ID": "uuid", "Type": "Event",     "Message": "farewell",              "Timestamp": "2026-04-22 17:51:06" }
  ]
}
```

All notifications from this API are treated as unread (no `isRead` field in the response).

---

### Algorithm — Min-Heap (O(n log k))

Maintaining the top-k items from a stream of n items is a classic use case for a **min-heap of size k**.

**Why not sort?**  
Sorting all n notifications is O(n log n). With a min-heap of size k, we only do O(n log k) work — significantly faster when k << n (e.g., k=10, n=50,000).

**How it works:**

```
for each notification in all_notifications:           // O(n)
    score = computePriority(notification)
    if heap.size < k:
        heap.push(notification, score)                // O(log k)
    else if score > heap.peek().score:
        heap.pop()                                    // O(log k)
        heap.push(notification, score)                // O(log k)

result = heap contents sorted descending              // O(k log k) — negligible
```

**Total complexity:** O(n log k) time, O(k) space.

---

### Maintaining Top-n as New Notifications Arrive

When a new notification comes in:
1. Compute its priority score.
2. If `score > heap.peek().score` (the current minimum in the heap), evict the minimum and insert the new notification.
3. The heap always holds exactly the top-k items.

This makes each new insertion O(log k) — constant with respect to total notification count.

---

### Implementation

The implementation lives in:

- `backend/src/utils/minHeap.ts` — generic min-heap
- `backend/src/services/priorityInboxService.ts` — fetch + rank logic
- `backend/src/controllers/priorityInboxController.ts` — HTTP handler
- `backend/src/routes/priorityInbox.routes.ts` — route registration

**API endpoint:**
```
GET /api/priority-inbox?n=10
GET /api/priority-inbox?n=15
GET /api/priority-inbox?n=20
```

