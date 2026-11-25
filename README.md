# BudgetIQ

**BudgetIQ** is an AI-powered personal finance web application for tracking income and expenses, setting monthly category budgets, exploring visual analytics, exporting reports to CSV, and getting financial advice grounded in your own transaction data.

It is a portfolio project, and it is fully usable without any paid AI provider: when no API key is configured, the parser, summaries, and advisor automatically switch to a local rule-based mode.

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Using the app](#using-the-app)
- [How the AI works](#how-the-ai-works)
- [Project structure](#project-structure)
- [API reference](#api-reference)
- [Data model](#data-model)
- [Internationalization](#internationalization)
- [Security](#security)
- [Deployment](#deployment)
- [Scripts](#scripts)
- [Troubleshooting](#troubleshooting)
- [Author](#author)

## Features

- **Dashboard** — total balance, monthly income/expenses, savings rate, six-month income-vs-expense chart, category donut chart, AI-generated insights, budget progress, and recent transactions.
- **Transactions** — add, edit, delete, search, and filter income/expense records by type, category, and date, with pagination and CSV export.
- **Smart Input** — describe several expenses in plain language (for example, `Lunch 45k, taxi 20k` or `Tushlikka 45 ming, taksiga 20 ming`) and get editable draft transactions before saving them in bulk.
- **Budgets** — monthly per-category limits with automatic progress, an amber warning at 80% and a red indicator at 100%+.
- **AI advisor** — streaming chat that answers questions about your real financial snapshot, such as "How much did I spend this month?" or "Where can I save money?" Falls back to local analysis when no provider key exists.
- **AI summaries** — automatic short reviews of recent activity shown on the dashboard.
- **Settings** — profile details, display currency (UZS / USD / EUR), monthly savings goal, language, and data export.
- **Authentication** — email/password sign-up and sign-in with bcrypt-hashed passwords; optional Google OAuth.
- **Multilingual UI** — Uzbek (default), Russian, and English, including server-side AI answers. The choice is stored in a `lang` cookie.
- **Polish** — responsive layout, dark/light theme, loading skeletons, toast notifications, SEO metadata, sitemap, robots, and Open Graph image.

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16.4.6 (App Router, Turbopack, Cache Components) |
| UI | React 19, TypeScript, Tailwind CSS 4, lucide-react, Recharts |
| Database | PostgreSQL with Prisma 6.19.3 |
| Auth | NextAuth 5 (Auth.js, JWT sessions) |
| AI | Vercel AI SDK 7 (Google Gemini or OpenAI) |
| Client state | TanStack Query 5, Zustand (toasts) |
| Validation | Zod 4 |
| i18n | Lightweight custom provider (`useSyncExternalStore`, cookie + localStorage) |

## Getting started

### Prerequisites

- Node.js 20 or newer
- PostgreSQL 14+ (local, Docker, Neon, or Supabase)
- npm

### 1. Start PostgreSQL

```bash
docker run -d --name budgetiq-pg \
  -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=budgetiq -p 5432:5432 postgres:16-alpine
```

### 2. Configure the environment

```bash
cp .env.example .env
```

Generate a session secret and paste it into `AUTH_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

### 3. Install, create the schema, and seed categories

```bash
npm install
npm run db:push
npm run db:seed
```

`db:seed` creates 14 shared categories (food, transport, housing, utilities, cafes, entertainment, health, clothing, education, other expenses, salary, freelance, investments, other income).

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Production build check:

```bash
npm run build
npm run start -- -p 3100
```

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string, e.g. `postgresql://postgres:postgres@localhost:5432/budgetiq?schema=public` |
| `AUTH_SECRET` | Yes | Secret used to sign NextAuth JWT sessions |
| `AUTH_TRUST_HOST` | Recommended | Set to `true` when running behind a proxy or on Vercel |
| `NEXT_PUBLIC_APP_URL` | Recommended | Public base URL used for canonical links, sitemap, robots, and Open Graph |
| `GOOGLE_GENERATIVE_AI_API_KEY` | No | Google Gemini key. If absent, OpenAI is tried next, then local mode |
| `OPENAI_API_KEY` | No | OpenAI key, used when a Gemini key is not configured |
| `AI_MODEL` | No | Override the default model (`gemini-3.5-flash-lite` or `gpt-4o-mini`) |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | No | Enables the "Sign in with Google" button |

All AI keys stay on the server and are never sent to the browser.

## Using the app

1. **Create an account** at `/register` (or sign in with Google). Passwords must be at least 8 characters.
2. **Add your first transaction** from the Transactions page, or try Smart Input: `Tushlikka 45 ming, taksiga 20 ming`.
3. **Review parsed drafts** — categories and amounts can be edited before bulk saving.
4. **Set budgets** on the Budgets page by month and category; progress and warnings update automatically.
5. **Ask the advisor** on the AI Advisor page, e.g. "How much did I spend this month?" or "Where can I cut costs?" Without a key, local analysis answers instead.
6. **Switch languages** with the globe button in the header: O'zbek / Русский / English. The choice persists in a cookie.
7. **Export data** from Settings → Download CSV (opens in Excel or Google Sheets).
8. **Choose a currency** from Settings → Currency (UZS / USD / EUR); all amounts are displayed in that currency.

## How the AI works

- **Smart parsing** (`POST /api/ai/parse`) uses structured output to turn free text into typed transactions with amounts, categories, descriptions, and dates. It understands shorthand such as `ming` = 1,000 and `mln` = 1,000,000.
- **Advisor chat** (`POST /api/ai/chat`) injects an aggregated financial snapshot into the system prompt and streams the response with the AI SDK. Only totals, monthly trends, top categories, and budget status are sent — never raw personal messages or credentials.
- **Local fallback** uses keyword rules for parsing (`src/lib/parser.ts`) and rule-based answers derived from the same snapshot (`buildLocalAdvisorAnswer`). This keeps every feature usable with no API key or when a provider call fails.

Parsed results are always presented for review before they are saved.

## Project structure

```text
src/
├─ app/
│  ├─ page.tsx                    # public landing page
│  ├─ (auth)/login, register      # authentication pages
│  ├─ (dashboard)/                # route guard + AppShell
│  │  ├─ dashboard                # KPIs, charts, insights
│  │  ├─ transactions             # transaction table and add dialogs
│  │  ├─ budgets                  # monthly limits
│  │  ├─ ai-advisor               # streaming advisor chat
│  │  └─ settings                 # profile, currency, export
│  └─ api/                        # REST: analytics, transactions, budgets,
│                                 # categories, profile, export, ai/*, auth/*
├─ components/                    # UI primitives, charts, forms, layout, i18n
├─ lib/                           # prisma, analytics, ai, parser, insights,
│                                 # validations, API helpers, i18n dictionaries
├─ auth.ts                        # NextAuth configuration
├─ proxy.ts                       # optimistic route guard (Next.js 16 Proxy)
└─ types/                         # DTOs and dashboard types
prisma/
├─ schema.prisma                  # User, Category, Transaction, Budget
└─ seed.ts                        # 14 shared categories
```

Amounts are stored as integers (`Int`) and user-scoped through `getApiUser()`; every route filters data by the current user's ID.

The original technical specification (in Uzbek) is available in [`BudgetIQ Loyiha Spetsifikatsiyasi va Arxitekturasi.md`](./BudgetIQ%20Loyiha%20Spetsifikatsiyasi%20va%20Arxitekturasi.md).

## API reference

All endpoints except health, registration, and NextAuth require an authenticated session.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/analytics` | Dashboard aggregates and insights |
| `GET` / `POST` | `/api/transactions` | Filtered, paginated list / create one |
| `PATCH` / `DELETE` | `/api/transactions/[id]` | Update / delete a transaction |
| `POST` | `/api/transactions/bulk` | Save Smart Input drafts |
| `GET` / `POST` | `/api/budgets` | Monthly budgets / upsert a limit |
| `GET` / `POST` | `/api/categories` | Shared and user categories / create one |
| `GET` / `PATCH` | `/api/profile` | Profile and preferences |
| `GET` | `/api/export?from=&to=` | CSV export for a date range |
| `POST` | `/api/ai/parse` | Parse text into transactions |
| `POST` | `/api/ai/chat` | Streaming advisor response |
| `GET` | `/api/ai/summary` | AI insights for the current period |
| `POST` | `/api/auth/register` | Create an email/password account |
| `GET` | `/api/health` | Health check |
| `*` | `/api/auth/[...nextauth]` | NextAuth handlers |

## Data model

| Model | Purpose |
| --- | --- |
| `User` | Email, hashed password, display name/image, currency, monthly goal |
| `Category` | Name, icon, color, type, optional owner (`userId = null` means shared) |
| `Transaction` | Integer amount, type (`INCOME`/`EXPENSE`), description, date, owner, category |
| `Budget` | Integer limit for a category in a specific month and year, unique per user/category/month |

Transactions and budgets are indexed by user and date/month for fast dashboard queries.

## Internationalization

Dictionaries live in `src/lib/i18n.ts`. The `lang` cookie drives both client text and server-side responses (including AI prompt language); `localStorage` remembers the setting in the browser. Category names are localized at render time.

## Security

- Passwords are hashed with bcrypt; sessions are JWT cookies valid for 30 days.
- Every API request resolves the current user and scopes database queries to their ID.
- AI provider keys are server-only; only aggregated financial data is included in prompts.
- Security headers are applied globally: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `COOP`, and HSTS.
- CSV files are streamed as downloads and are not stored on the server.

## Deployment

Deploy to Vercel with a managed PostgreSQL database (Neon or Supabase):

1. Import this repository into Vercel.
2. Set `DATABASE_URL`, `AUTH_SECRET`, `AUTH_TRUST_HOST`, and `NEXT_PUBLIC_APP_URL` in the project environment.
3. Add `?sslmode=require` to the connection string if your provider requires TLS.
4. Run `npm run db:push` and `npm run db:seed` against the production database (Prisma Client is generated automatically by `postinstall`).
5. Optionally add AI keys and Google OAuth credentials to unlock provider-backed AI and Google sign-in.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Sync the Prisma schema to the database |
| `npm run db:migrate` | Create and apply a migration |
| `npm run db:seed` | Seed the 14 shared categories |
| `npm run db:studio` | Open Prisma Studio |

## Troubleshooting

- **"Unauthorized" from the API** — make sure you are signed in and that `AUTH_SECRET` matches between server restarts.
- **Empty dashboard** — run `npm run db:seed`, then add transactions; all charts derive from real records.
- **AI answers look generic** — that is the local fallback. Add `GOOGLE_GENERATIVE_AI_API_KEY` or `OPENAI_API_KEY` to `.env` and restart the server.
- **Database connection errors** — check `DATABASE_URL`, that PostgreSQL is running, and that TLS parameters match your provider.

## Author

Built by Azizjon G'ayratov as a portfolio / learning project.

Repository: [github.com/gayratov993/BudgetIQ](https://github.com/gayratov993/BudgetIQ)
