# The T2 Call

A real-time multiplayer interactive case study app for live presentations. A presenter controls the session from a host screen; the audience joins on their phones, votes on decisions, and watches consequences unfold in real time.

---

## Setup

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free project.
2. In the **SQL Editor**, run the contents of [`supabase/schema.sql`](supabase/schema.sql). This creates the `game_sessions` table, seeds the single game row, enables Realtime, and creates the `cast_vote` RPC function.
3. Copy your **Project URL** and **anon key** from **Project Settings → API**.

### 2. Set environment variables

Create `.env.local` in the project root:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run locally

```bash
npm install
npm run dev
```

### 4. Deploy to Vercel

1. Push this repo to GitHub.
2. Import the repo at [vercel.com/new](https://vercel.com/new).
3. In **Environment Variables**, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. Click **Deploy** — Vercel auto-detects Vite.

---

## Running a session

1. Open the deployed URL and select **Start as presenter** — this is your screen (connect to the projector).
2. Share the same URL with your audience — they select **Join as participant** on their phones.
3. You control all progression via the presenter view; participants vote live and see updates within ~200ms.
4. Use **Run again** at the end to reset and replay with the same group.

---

## Architecture notes

- **One session**: a single row in `game_sessions` with `id = 'main'`. No multi-tenancy.
- **Atomic votes**: participants write via the `cast_vote` Postgres RPC to avoid race conditions under concurrent load (40+ voters).
- **Real-time**: all clients subscribe to `postgres_changes` on `game_sessions`; host writes trigger instant updates to all participants.
- **Branching**: Q3 variant (good path vs. bad path) is resolved client-side from the `choices` array — not stored separately in the DB.
