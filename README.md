# AssetSphere

**AssetSphere** is a multi-tenant asset management platform built for organisations to track, book, and manage physical assets — from laptops and projectors to lab equipment and vehicles. It supports a full request-and-approval booking lifecycle, role-based access, QR-code scanning, image uploads, email notifications, and a real-time analytics dashboard.

**Live demo → [https://assetsphere.vercel.app](https://assetsphere.vercel.app)**

---
....
# 🎬 DEMO VIDEO

## **[▶ Watch the Full Demo on YouTube](https://youtu.be/xM29EAo8yog)**

> See AssetSphere in action — org setup, asset management, booking workflow, analytics, and more.

---

## Screenshots

### Landing Page
![Landing Page](public/landing-page.png)

### Dashboard — Dark Mode
![Dashboard Dark](public/dashboard-dark.png)

### Dashboard — Light Mode
![Dashboard Light](public/dashboard-light.png)

### Asset Management
![Asset Page](public/asset-page.png)

### Bookings
![Bookings Page](public/bookings-page.png)

### Categories
![Category Page](public/category-page.png)

### Members
![Members Page](public/members-page.png)

### Audit Logs
![Audit Logs Page](public/audit-logs-page.png)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation (Local Dev)](#installation-local-dev)
- [Environment Variables](#environment-variables)
- [Running with Docker](#running-with-docker)
- [Deployment on Vercel](#deployment-on-vercel)
- [User Roles & Access](#user-roles--access)
- [API Routes](#api-routes)
- [Seeding a Superadmin](#seeding-a-superadmin)

---

## Features

### Platform / Multi-tenant
- Organisations register via a self-service onboarding form and wait for superadmin approval
- Superadmin can approve or reject organisations with an optional rejection reason
- Email notifications sent via SendGrid at every major lifecycle event

### Authentication
- Credentials-based sign-in (Next Auth v5 / JWT strategy)
- 24-hour session with org role embedded in the JWT
- Middleware-enforced route protection for all private pages

### Assets
- Create, edit, and soft-retire assets within an organisation
- Assign categories per organisation
- Upload asset images (Cloudinary)
- Track total quantity vs available quantity
- Asset conditions: `EXCELLENT`, `GOOD`, `FAIR`, `NEEDS_REPAIR`
- Full-text search on name and description
- QR code generation per asset; QR scanner in the browser (html5-qrcode)

### Bookings
- Members can browse available assets and submit booking requests with date range and purpose
- Booking lifecycle: `PENDING → APPROVED/REJECTED → ISSUED → RETURNED` (+ `OVERDUE`)
- Org admins can approve, reject, issue, and mark items returned
- Automatic available-quantity accounting on status transitions

### Member Management (Org Admin)
- Invite members by email (tokenised link, 48-hour TTL)
- Accept invite flow creates a new account and joins the org automatically
- View, promote, and remove members

### Notifications
- In-app notification centre with unread badge
- Notifications created on booking status changes and invite events

### Audit Logs
- Immutable log of every significant action (create / update / delete / status change) with actor, entity, and metadata

### Analytics Dashboard (Org Admin)
- KPI cards: total assets, active bookings, pending requests, overdue returns
- Monthly booking utilisation chart (Recharts)
- Category distribution donut chart
- Booking status breakdown

### Superadmin Console
- Organisation approval queue
- Per-org status management

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| UI | Tailwind CSS v4, Framer Motion, Lucide React, Recharts |
| Forms | React Hook Form + Zod |
| Auth | NextAuth v5 (JWT, Credentials provider) |
| Database | MongoDB via Mongoose 8 |
| File uploads | Cloudinary |
| Email | SendGrid |
| State / fetching | TanStack React Query v5 |
| QR codes | qrcode (generate) + html5-qrcode (scan) |
| Runtime | Node.js (single Next.js server — no separate backend) |

---

## Project Structure

```
assetsphere/
├── public/                       # Static assets
├── src/
│   ├── app/
│   │   ├── (auth)/               # Route group — login & register pages
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (landing)/            # Public marketing landing page
│   │   ├── admin/                # Org-admin section (assets, bookings, members, etc.)
│   │   │   ├── assets/
│   │   │   ├── audit-logs/
│   │   │   ├── bookings/
│   │   │   ├── categories/
│   │   │   ├── members/
│   │   │   └── users/
│   │   ├── api/                  # Next.js API route handlers
│   │   │   ├── admin/users/
│   │   │   ├── analytics/        # summary, utilization, categories, booking-status
│   │   │   ├── assets/           # CRUD + image upload
│   │   │   ├── audit-logs/
│   │   │   ├── auth/             # NextAuth handler + register
│   │   │   ├── bookings/         # CRUD + status transitions
│   │   │   ├── categories/
│   │   │   ├── health/
│   │   │   ├── invite/           # Accept invite by token
│   │   │   ├── notifications/
│   │   │   ├── orgs/             # Org CRUD + invite + member management
│   │   │   └── superadmin/       # Org approval, seed
│   │   ├── assets/               # Member asset browse + detail
│   │   ├── bookings/             # Member booking history
│   │   ├── dashboard/            # Role-aware dashboard
│   │   ├── invite/[token]/       # Accept-invite page
│   │   ├── notifications/
│   │   ├── onboard/              # Org registration form
│   │   ├── superadmin/orgs/      # Superadmin approval queue
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   │   ├── aceternity/           # Decorative background effects
│   │   ├── assets/               # AssetCard, AssetFilters, ConditionBadge
│   │   ├── bookings/             # BookingTable, BookingStatusBadge
│   │   ├── charts/               # Recharts wrappers
│   │   ├── dashboard/            # Layout, Sidebar, Topbar, StatCard, CommandPalette
│   │   ├── forms/                # AssetRequestForm, AuthForm, QrScanner
│   │   ├── landing/              # All landing page sections
│   │   ├── magic/                # GlowCard, GradientText, ShimmerDivider
│   │   ├── providers/            # AppProviders (Session + QueryClient)
│   │   └── ui/                   # Design-system primitives (Button, Card, Dialog, …)
│   ├── constants/                # Enums as const arrays (roles, statuses, conditions)
│   ├── lib/
│   │   ├── auth.ts               # NextAuth init
│   │   ├── auth.config.ts        # Edge-safe JWT callbacks
│   │   ├── cloudinary.ts         # Cloudinary upload helper
│   │   ├── db.ts                 # Mongoose connection with hot-reload cache
│   │   ├── errors.ts             # Typed HTTP error helpers
│   │   ├── invite-token.ts       # Secure token generation
│   │   ├── permissions.ts        # Role-check helpers
│   │   ├── qr.ts                 # QR code data-URL generator
│   │   ├── sendgrid.ts           # Typed email templates
│   │   ├── theme.ts              # Theme constants
│   │   └── utils.ts              # cn() and misc utilities
│   ├── middleware.ts             # Edge middleware — auth guards & redirects
│   ├── models/                   # Mongoose schemas
│   │   ├── asset.ts
│   │   ├── audit-log.ts
│   │   ├── booking.ts
│   │   ├── category.ts
│   │   ├── invite.ts
│   │   ├── notification.ts
│   │   ├── organisation.ts
│   │   └── user.ts
│   ├── services/                 # Business logic (thin service layer over models)
│   │   ├── asset-service.ts
│   │   ├── audit-log-service.ts
│   │   ├── booking-service.ts
│   │   ├── category-service.ts
│   │   ├── notification-service.ts
│   │   └── user-service.ts
│   ├── types/                    # Shared TypeScript types + NextAuth augmentations
│   └── validators/               # Zod schemas for request validation
├── .env.example
├── docker-compose.yml
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

---

## Prerequisites

- **Node.js** 20+
- **npm** 10+ (or pnpm / yarn)
- A **MongoDB** instance (local, Docker, or MongoDB Atlas)
- **SendGrid** account (optional — emails are skipped gracefully if not configured)
- **Cloudinary** account (optional — image uploads are skipped gracefully if not configured)

---

## Installation (Local Dev)

```bash
# 1. Clone the repo
git clone https://github.com/your-org/assetsphere.git
cd assetsphere

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env — see the Environment Variables section below

# 4. Start the development server
npm run dev
```

The app is now running at [http://localhost:3000](http://localhost:3000).

Seed the first superadmin before signing in (see [Seeding a Superadmin](#seeding-a-superadmin)).

---

## Environment Variables

Copy `.env.example` to `.env` and fill in each value.

```dotenv
# MongoDB
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=assetsphere

# NextAuth v5  (generate with: openssl rand -base64 32)
AUTH_SECRET=<random-32-byte-secret>
NEXTAUTH_URL=http://localhost:3000

# Superadmin
SUPERADMIN_EMAIL=super@example.com   # receives org-approval notifications
SEED_SECRET=<any-secret>             # used in the one-time seed API call

# SendGrid (optional)
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=abc-secret
```

**For production / Vercel**, add all values as environment variables in the Vercel project settings. `NEXTAUTH_URL` should be your public domain (e.g. `https://assetsphere.vercel.app`).

---

## Running with Docker

A `docker-compose.yml` is included that starts the Next.js app together with a local MongoDB instance.

```bash
# Build and start everything
docker compose up --build

# Stop
docker compose down

# Stop and remove volumes (wipes the database)
docker compose down -v
```

The app will be available at [http://localhost:3000](http://localhost:3000).

> **Note:** The Docker setup is intended for local development and testing. For production use Vercel + MongoDB Atlas.

---

## Deployment on Vercel

AssetSphere is a single Next.js application — no separate backend process is needed.

1. Push the repository to GitHub.
2. Import the project in [Vercel](https://vercel.com/new).
3. Set all environment variables from `.env.example` in **Project Settings → Environment Variables**.
   - Set `NEXTAUTH_URL` to your production URL (e.g. `https://assetsphere.vercel.app`).
   - Use **MongoDB Atlas** for `MONGODB_URI` (Vercel functions cannot reach a local DB).
4. Deploy. Vercel automatically detects Next.js and uses the correct build/start commands.

```
Build command:  next build   (default — no change needed)
Output dir:     .next        (default — no change needed)
```

---

## User Roles & Access

| Role | Scope | Capabilities |
|---|---|---|
| `SUPERADMIN` | Platform | Approve / reject orgs, seed account |
| `ORG_ADMIN` | Organisation | Manage assets, categories, bookings, members, view audit logs & analytics |
| `MEMBER` | Organisation | Browse assets, submit booking requests, view own bookings & notifications |

Route protection is enforced in `src/middleware.ts` at the edge. API routes perform their own session checks.

---

## API Routes

All routes are under `/api/`. Authentication is handled via the session cookie from NextAuth.

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a standalone user account |
| `POST` | `/api/orgs` | Submit a new organisation application |
| `GET/PATCH` | `/api/orgs/[id]` | Get or update an organisation |
| `POST` | `/api/orgs/invite` | Send a member invite email |
| `GET/DELETE` | `/api/orgs/members` | List or remove org members |
| `GET/POST` | `/api/assets` | List or create assets |
| `GET/PATCH/DELETE` | `/api/assets/[id]` | Get, update, or delete an asset |
| `POST` | `/api/assets/upload` | Upload asset image to Cloudinary |
| `GET/POST` | `/api/bookings` | List or create bookings |
| `GET/PATCH/DELETE` | `/api/bookings/[id]` | Get, update status, or cancel a booking |
| `GET/POST` | `/api/categories` | List or create categories |
| `GET` | `/api/audit-logs` | Fetch audit log entries (org admin) |
| `GET/PATCH` | `/api/notifications` | List or mark notifications read |
| `GET` | `/api/analytics/summary` | KPI summary for dashboard |
| `GET` | `/api/analytics/utilization` | Monthly booking counts |
| `GET` | `/api/analytics/categories` | Asset count per category |
| `GET` | `/api/analytics/booking-status` | Booking counts by status |
| `GET/PATCH` | `/api/superadmin/orgs` | List pending orgs / approve or reject |
| `POST` | `/api/superadmin/seed` | One-time superadmin account creation |
| `GET/PATCH` | `/api/admin/users/[id]` | Manage user accounts (org admin) |
| `GET` | `/api/invite/[token]` | Validate an invite token |
| `GET` | `/api/health` | Health-check endpoint |

---

## Seeding a Superadmin

The first superadmin must be created via the seed endpoint. Run this once after the app is running:

```bash
curl -X POST http://localhost:3000/api/superadmin/seed \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "<your SEED_SECRET>",
    "name":   "Super Admin",
    "email":  "<your SUPERADMIN_EMAIL>",
    "password": "<strong-password>"
  }'
```

After seeding, sign in at `/login` with those credentials.

---

## Scripts

```bash
npm run dev       # Start dev server (hot reload)
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
npm run format    # Prettier format all src files
```

---

## License

MIT
