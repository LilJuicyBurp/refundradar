# RefundRadar

**Save money after you shop.** RefundRadar connects to your email receipts, tracks return deadlines, warranty windows, and price changes — then alerts you when you may be able to request a refund, price adjustment, or warranty claim.

> RefundRadar surfaces *opportunities*, not guarantees. All alerts are informational and actionable checklists — not promises of refunds.

---

## Live Demo

[→ Open RefundRadar Demo](https://www.perplexity.ai/computer/a/refundradar-demo-ZQECbb0BT6eEHqfZmpwRiQ)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [API Routes](#api-routes)
- [Browser Extension](#browser-extension)
- [Seed Data](#seed-data)
- [Business Model](#business-model)
- [Roadmap](#roadmap)

---

## Features

| Feature | Free | Premium |
|---|---|---|
| Purchase tracking | 25/month | Unlimited |
| Return deadline alerts | ✓ | ✓ |
| Gmail receipt sync | — | ✓ |
| Price drop monitoring | — | ✓ |
| Warranty tracking | — | ✓ |
| Claim checklists | ✓ | ✓ |
| Browser extension | ✓ | ✓ |
| Savings dashboard | ✓ | ✓ |
| Priority alerts | — | ✓ |

**Pricing**
- Free: Core features, 25 purchases/month
- Premium: **$8/month** or **$59/year** (save 38%)
- Lifetime: **$149** one-time (optional)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Tailwind CSS, shadcn/ui |
| Routing | Wouter (hash-based) |
| Backend | Express.js |
| Database | SQLite (dev) / PostgreSQL (prod) via Drizzle ORM |
| Auth | Session-based (demo) → Clerk (production) |
| Payments | Stripe |
| Email parsing | Gmail API + OpenAI gpt-4o-mini |
| Charts | Recharts |
| Extension | Chrome Manifest V3 |

> **Production upgrade path**: Swap SQLite → Postgres (change `DATABASE_URL`), add Clerk for auth, wire Stripe webhooks, enable Gmail OAuth flow.

---

## Project Structure

```
refundradar/
├── client/                     # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── app-layout.tsx  # Sidebar + shell
│   │   │   ├── logo.tsx        # SVG logo
│   │   │   └── ui/             # shadcn/ui components
│   │   ├── pages/
│   │   │   ├── landing.tsx     # Marketing landing page
│   │   │   ├── dashboard.tsx   # Main dashboard
│   │   │   ├── purchases.tsx   # Purchase management
│   │   │   ├── alerts.tsx      # Alert feed + checklists
│   │   │   ├── savings.tsx     # Savings tracker
│   │   │   ├── settings.tsx    # User preferences
│   │   │   └── billing.tsx     # Stripe billing
│   │   ├── App.tsx
│   │   └── index.css           # Teal/emerald design system
├── server/
│   ├── routes.ts               # Express API routes
│   ├── storage.ts              # Drizzle ORM storage layer
│   ├── index.ts                # Server entry point
│   └── vite.ts                 # Vite dev middleware
├── shared/
│   └── schema.ts               # Drizzle schema + Zod types
├── extension/                  # Chrome extension (MV3)
│   ├── manifest.json
│   ├── popup.html / popup.js
│   ├── content.js              # Product price extractor
│   ├── background.js           # Service worker
│   └── README-extension.md     # Extension docs
├── seed/
│   └── receipts.json           # 10 demo receipts (parsed)
├── .env.example                # All required env vars
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### 1. Clone and install

```bash
git clone https://github.com/LilJuicyBurp/refundradar.git
cd refundradar
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your API keys (see Environment Variables below)
```

For local development, only `DATABASE_URL` is required — everything else can be added incrementally.

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:5000](http://localhost:5000). The app auto-seeds demo data on first run.

### 4. Load the browser extension

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** → select the `extension/` folder
4. Click the RefundRadar icon in your toolbar

---

## Environment Variables

See [`.env.example`](.env.example) for the full list with documentation.

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✓ | SQLite file path or PostgreSQL URL |
| `CLERK_SECRET_KEY` | Production | Clerk authentication |
| `STRIPE_SECRET_KEY` | For billing | Stripe payments |
| `STRIPE_WEBHOOK_SECRET` | For billing | Stripe webhook validation |
| `GOOGLE_CLIENT_ID` | For Gmail | OAuth2 Gmail API |
| `OPENAI_API_KEY` | For parsing | Receipt extraction via GPT-4o-mini |
| `SESSION_SECRET` | Production | Express session signing |

---

## Database

### Schema overview

| Table | Description |
|---|---|
| `users` | Account + plan info |
| `purchases` | Parsed receipt data |
| `alerts` | Return/price/warranty alerts |
| `savings` | Logged refunds and adjustments |
| `priceChecks` | Extension price comparisons |
| `claimItems` | Checklist steps per purchase |

### Migrations

```bash
# Generate migration
npx drizzle-kit generate

# Apply migration
npx drizzle-kit push
```

### Switch to PostgreSQL

```bash
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/refundradar"
```

Update `server/storage.ts` to use `drizzle-orm/node-postgres` instead of `better-sqlite3`.

---

## API Routes

All routes prefixed with `/api`. Demo uses `userId=1`.

### Purchases
```
GET    /api/purchases         List all purchases
POST   /api/purchases         Create purchase
PATCH  /api/purchases/:id     Update status
DELETE /api/purchases/:id     Delete purchase
```

### Alerts
```
GET    /api/alerts                  List alerts
PATCH  /api/alerts/:id/read         Mark as read
PATCH  /api/alerts/:id/action       Mark as actioned
```

### Savings
```
GET    /api/savings           List savings
POST   /api/savings           Log a saving
```

### Claims
```
GET    /api/purchases/:id/claims    Get claim checklist
POST   /api/purchases/:id/claims    Add checklist item
PATCH  /api/claims/:id              Toggle item complete
```

### Dashboard
```
GET    /api/dashboard         Aggregated stats
GET    /api/me                Current user info
```

### Price Check (Extension)
```
POST   /api/price-check       Submit price comparison
```

### Seed
```
POST   /api/seed              Reset to demo data
```

---

## Browser Extension

See [`extension/README-extension.md`](extension/README-extension.md) for full details.

### Quick load

```bash
# 1. Open chrome://extensions
# 2. Enable Developer mode
# 3. Load unpacked → select ./extension/
```

### Package for distribution

```bash
zip -r refundradar-extension.zip extension/ \
  --exclude "extension/README-extension.md"
```

Submit the ZIP to the [Chrome Web Store](https://chrome.google.com/webstore/devconsole).

---

## Seed Data

[`seed/receipts.json`](seed/receipts.json) contains 10 realistic parsed receipts from Amazon, Nike, Best Buy, Target, Apple, Wayfair, Walmart, Gap, Costco, and Nordstrom.

Each receipt includes:
- Raw email snippet (for testing the parser)
- Parsed fields: store, items, amount, purchase date, return deadline, warranty end

These are auto-loaded on first server start and can be reset via `POST /api/seed`.

---

## Business Model

| Tier | Price | Limits |
|---|---|---|
| Free | $0 | 25 purchases/month, basic alerts |
| Premium Monthly | $8/month | Unlimited, all features |
| Premium Annual | $59/year | Save 38% vs monthly |
| Lifetime | $149 one-time | All features forever |

**Affiliate revenue** (roadmap): Partner with retailers for price-match referral links.

### Stripe integration checklist

- [ ] Create products in Stripe Dashboard
- [ ] Copy price IDs to `.env`
- [ ] Wire `POST /api/billing/checkout` → Stripe Checkout Session
- [ ] Handle `stripe.webhook` for `checkout.session.completed` + `customer.subscription.deleted`
- [ ] Store `stripeCustomerId` on user record

---

## Roadmap

- [ ] Clerk auth (swap session-based demo auth)
- [ ] Gmail OAuth + receipt sync (polling or push)
- [ ] OpenAI receipt parser (structured extraction from email HTML)
- [ ] Stripe billing (checkout, webhooks, portal)
- [ ] PostgreSQL + Prisma (production DB)
- [ ] Price monitoring cron (daily background job)
- [ ] Mobile PWA
- [ ] Firefox extension
- [ ] Affiliate link integration
- [ ] CSV/PDF export

---

## Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m 'feat: add my feature'`
4. Push: `git push origin feature/my-feature`
5. Open a pull request

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

*RefundRadar is not affiliated with any retailer. Alerts are informational only. Always check retailer policies directly.*
