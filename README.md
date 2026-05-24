# Allo Inventory — Real-Time Reservation System

A Next.js web app that solves the e-commerce inventory reservation problem — ensuring two users can never reserve the same last item simultaneously.

**Live Demo:** https://jesvanth-allo-task-2xv6p54ez-jesvanths-projects.vercel.app/

**GitHub:** https://github.com/Jesvanth/allo-inventory

---

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Database:** PostgreSQL via Supabase (hosted)
- **ORM:** Prisma 5
- **Concurrency:** In-memory locking (per-process mutex) — Redis-ready
- **Styling:** Custom CSS with Cormorant Garamond + Montserrat fonts
- **Deployment:** Vercel

---

## Features

- Product listing with real-time stock levels
- 10-minute reservation hold with live countdown timer
- Confirm purchase or cancel/release reservation
- Auto-expiry via Vercel Cron (runs every minute)
- Concurrent reservation protection — only one user can reserve the last item

---

## How to Run Locally

### 1. Clone the repo

```bash
git clone https://github.com/Jesvanth/allo-inventory.git
cd allo-inventory
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root:

```env
DATABASE_URL="your-supabase-direct-connection-url"
UPSTASH_REDIS_REST_URL="your-upstash-url"
UPSTASH_REDIS_REST_TOKEN="your-upstash-token"
CRON_SECRET="allo-cron-secret-2025"
```

### 4. Push database schema

```bash
npx prisma db push
```

### 5. Seed sample data

```bash
node prisma/seed.js
```

### 6. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all products with stock |
| GET | `/api/warehouses` | List all warehouses |
| POST | `/api/reservations` | Create a reservation (10-min hold) |
| POST | `/api/reservations/:id/confirm` | Confirm purchase |
| POST | `/api/reservations/:id/release` | Cancel and release stock |
| GET | `/api/cron/expire` | Auto-expire stale reservations (cron) |

---

## How Reservation Expiry Works

1. When a reservation is created, `expiresAt` is set to `now + 10 minutes`
2. A Vercel Cron job hits `/api/cron/expire` every minute
3. It finds all `pending` reservations where `expiresAt < now`
4. For each expired reservation: status → `released`, stock `reserved` count decremented
5. The checkout page also has a client-side countdown — when it hits zero, it calls `/release` immediately

---

## Concurrency Handling

The core challenge: two users trying to reserve the last item simultaneously.

**Solution:** Per-product in-memory lock using a `Set<string>`.

- When a reservation request comes in, we check if a lock exists for that `productId`
- If locked → return 409 (another reservation in progress)
- If free → add lock, run DB transaction (check stock + create reservation atomically), release lock
- The DB transaction uses Prisma's `$transaction` to ensure stock decrement and reservation creation are atomic

**Trade-off noted:** In-memory locks don't work across multiple server instances. For production scale, this should be replaced with Redis distributed locks (Upstash Redis is already installed and configured — just swap the `locks` Set for `redis.set(key, '1', { nx: true, ex: 10 })`).

---

## Trade-offs & What I'd Improve

| Area | Current | Production improvement |
|------|---------|----------------------|
| Locking | In-memory Set | Redis distributed lock |
| Expiry | Vercel Cron (1 min) | Immediate via Redis TTL + pub/sub |
| Auth | None | User accounts for order history |
| Payment | Simulated confirm | Stripe integration |
| Stock | Single warehouse | Multi-warehouse aggregation |

---

> **Note:** Vercel free tier limits cron jobs to once per day. In production, this would run every minute. The client-side countdown timer handles immediate expiry on the frontend — when the timer hits zero, `/release` is called instantly regardless of the cron schedule.

## Built by

**Jesvanth S**
[linkedin.com/in/jesvanth](https://www.linkedin.com/in/jesvanth/)
