# SparConnect

Premium sparring coordination platform for boxing gyms, coaches, and fighters. Built as an MVP with mobile-ready architecture.

## Tech Stack
- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui-style components
- Prisma ORM
- PostgreSQL (primary) with SQLite fallback for local development
- Auth.js / NextAuth (Credentials provider)

## Getting Started

1) Install dependencies
```bash
npm install
```

2) Configure env
```bash
cp .env.example .env
```

3) Run migrations (SQLite dev fallback)
```bash
npx prisma migrate dev
```

4) Seed data
```bash
npx prisma db seed
```

5) Start the app
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## PostgreSQL (Production or Local)
By default, Prisma uses the SQLite dev schema at `prisma/schema.dev.prisma` so `npx prisma migrate dev` works out of the box.

To switch to PostgreSQL:
1) Set `DATABASE_URL` to a Postgres connection string.
2) Run migrations with the Postgres schema:
```bash
npx prisma migrate dev --schema prisma/schema.prisma
```
3) Optionally set the Prisma schema path in `package.json` to `prisma/schema.prisma` for Postgres-first workflows.

## Test Accounts (Seeded)
All accounts use password: `password123`

- Ava Torres (Gym Admin, PRO) - `ava@ironharbor.com`
- Marcus Reed (Coach) - `marcus@ironharbor.com`
- Lena Park (Gym Admin) - `lena@northside.com`
- Diego Santos (Coach) - `diego@northside.com`
- Kiara Brooks (Gym Admin, PRO) - `kiara@redline.com`
- Harper Quinn (Coach, PRO) - `harper@redline.com`
- Noah Patel (Pending Approval) - `noah@prospects.com`

## Core Features
- Coach-led gym creation (no manual verification gate in MVP)
- Join requests with gym admin approvals
- Events with skill/weight/stance requirements
- Event join approvals + notifications
- Private spar requests with optional auto-event creation
- Mobile-first navigation (bottom nav) and desktop sidebar
- Plan-ready gating for events and spar requests
- Gym Pro placeholder analytics

## Project Structure
- `app/` - Next.js routes (App Router)
- `components/` - UI and app components
- `lib/` - data access, auth, actions, validation
- `prisma/` - Prisma schema + seed data

## Notes
- `Gym.isVerified` is included for future verification workflows.
- `CoachDevice` model is prepared for push notification tokens.
- Stripe integration is scaffolded in `lib/stripe.ts` (placeholder).

## Commands
- `npm run dev` - start dev server
- `npx prisma migrate dev` - apply migrations
- `npx prisma db seed` - seed data
- `npm run prisma:seed` - seed data via npm
