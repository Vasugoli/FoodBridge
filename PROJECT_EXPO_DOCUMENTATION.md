# FoodBridge — Complete Project Documentation
### *For Project Expo Presentation — v3.0 (Phase 1 + Phase 2 + Phase 3 + Phase 4 Complete)*

---

## Table of Contents
1. [Project Overview & Core Idea](#1-project-overview--core-idea)
2. [Problem Statement](#2-problem-statement)
3. [Solution Architecture](#3-solution-architecture)
4. [Sustainable Development Goals (SDGs)](#4-sustainable-development-goals-sdgs)
5. [Technology Stack](#5-technology-stack)
6. [System Architecture & Design](#6-system-architecture--design)
7. [User Roles & Features](#7-user-roles--features)
8. [Key Modules & Features Deep Dive](#8-key-modules--features-deep-dive)
9. [Data Models & Database Design](#9-data-models--database-design)
10. [Security & Reliability](#10-security--reliability)
11. [API Reference Summary](#11-api-reference-summary)
12. [Email & Notification System](#12-email--notification-system)
13. [Maps & Geospatial Features](#13-maps--geospatial-features)
14. [Impact & Future Roadmap](#14-impact--future-roadmap)
15. [Environment & Deployment](#15-environment--deployment)

---

## 1. Project Overview & Core Idea

> **"Saving Food, Serving Lives"**

**FoodBridge** is a full-stack web platform that acts as a real-time bridge between **food donors** — restaurants, households, caterers, and businesses with surplus food — and **food distributors** — food banks, NGOs, shelters, and community volunteers — who collect that surplus and deliver it to people in need.

The platform eliminates the friction of food redistribution by providing:
- A structured, role-based digital interface for posting and claiming food donations
- Location-aware discovery using interactive maps
- Automated email notifications at every step of the donation lifecycle
- An admin-controlled oversight layer to monitor platform health

The long-term vision is to **reduce urban food waste at scale** while simultaneously **fighting hunger** in underserved communities — two of the world's most solvable yet persistent crises.

---

## 2. Problem Statement

### The Scale of Food Waste
- Approximately **1/3 of all food produced globally** is wasted (~1.3 billion tonnes/year) — *FAO*
- In the United States alone, **30–40% of the food supply** is wasted annually — *USDA*
- Food waste in landfills produces **methane**, a greenhouse gas 25× more potent than CO₂

### The Hunger Paradox
- Over **800 million people** globally suffer from hunger or food insecurity — *UN WFP*
- In urban cities, food banks and NGOs often have **no real-time visibility** into available surplus food nearby
- Restaurants and households regularly **discard perfectly edible food** because there is no accessible channel to donate it quickly

### The Gap FoodBridge Fills
| Without FoodBridge | With FoodBridge |
|---|---|
| Donor must individually call or email food banks | Donor posts in 2 minutes via web form |
| No visibility of what's available or where | Interactive map shows all available donations |
| No structured claiming process | Distributor claims with one click; both parties notified instantly |
| Admin has no platform-level data | Admin dashboard with live stats, trends chart, and maps |
| Surplus expires unused | Time-stamped expiry system prompts urgency |

---

## 3. Solution Architecture

FoodBridge follows a **three-actor model**:

```
┌─────────────────────────────────────────────────────────┐
│                        FoodBridge Platform               │
│                                                         │
│   ┌──────────┐     Post Donation      ┌─────────────┐  │
│   │  DONOR   │ ─────────────────────► │  MongoDB DB │  │
│   │(Restaurant│     (food item,                      │  │
│   │ /Person) │      location, expiry)  └─────────────┘  │
│   └──────────┘                               │          │
│                                              │          │
│   ┌─────────────┐   Browse + Claim    ┌──────▼──────┐  │
│   │ DISTRIBUTOR │ ◄────────────────── │  API Layer  │  │
│   │ (NGO/Food   │   (Map view, claim  │  (Next.js)  │  │
│   │  Bank/Vol.) │    button, details) └─────────────┘  │
│   └─────────────┘                                       │
│                                                         │
│   ┌─────────┐      Full Oversight                       │
│   │  ADMIN  │ ──── (All donations, users, stats, map)   │
│   └─────────┘                                           │
└─────────────────────────────────────────────────────────┘
```

The lifecycle of a donation:

```
available ──► claimed ──► completed
     │             │
     └──► expired  └──► unclaimed ──► available (if distributor can't pick up)
     (automatic, based on expiry date)
```

---

## 4. Sustainable Development Goals (SDGs)

FoodBridge is **directly aligned with the United Nations Sustainable Development Goals (SDGs) 2030 Agenda**. It addresses multiple goals simultaneously:

---

### SDG 2 — Zero Hunger ⭐ *PRIMARY GOAL*

> *"End hunger, achieve food security and improved nutrition, and promote sustainable agriculture."*

**How FoodBridge contributes:**
- Directly routes surplus food to distributors who serve food-insecure communities
- Enables food banks and NGOs to **discover available food in real time** via the interactive map
- Builds a structured, scalable network between food surplus and food demand
- The platform's tagline *"Saving Food, Serving Lives"* directly embodies SDG 2
- Trust scores and reviews create accountability to ensure food is consistently redistributed

---

### SDG 12 — Responsible Consumption and Production ⭐ *PRIMARY GOAL*

> *"Ensure sustainable consumption and production patterns."*

**How FoodBridge contributes:**
- Directly reduces **food waste** — Target 12.3 specifically calls for halving per capita food waste by 2030
- Encourages producers (restaurants, catering businesses) to donate rather than discard surplus
- Tracks donation history, giving donors visibility into their positive impact
- The expiry tracking system creates urgency, reducing last-minute waste
- Provides infrastructure for a **circular food economy** at the local community level

---

### SDG 17 — Partnerships for the Goals

> *"Strengthen the means of implementation and revitalize the global partnership for sustainable development."*

**How FoodBridge contributes:**
- Creates formal digital partnerships between **private sector donors** and **civil society distributors**
- The admin layer enables NGOs and municipalities to oversee and scale these partnerships
- Builds the digital infrastructure for cross-sector food redistribution networks
- Multi-role system supports government bodies, nonprofits, and private businesses on the same platform

---

### SDG 11 — Sustainable Cities and Communities

> *"Make cities and human settlements inclusive, safe, resilient, and sustainable."*

**How FoodBridge contributes:**
- Geospatial map integration helps build **localized, community-level** food sharing networks
- Addresses urban food insecurity without requiring new food production
- Supports urban sustainability by reducing the volume of food going to landfills
- Designed with a default urban context (city-level lat/lng coordinates)

---

### SDG 13 — Climate Action

> *"Take urgent action to combat climate change and its impacts."*

**How FoodBridge contributes:**
- Food waste in landfills generates **methane**, a potent greenhouse gas
- Every food item redistributed through FoodBridge is one less item decomposing in a landfill
- Technology-enabled redistribution scales this climate benefit across thousands of donations
- Reduces the carbon footprint associated with discarding and replacing food

---

### SDG Alignment Summary Table

| SDG | Goal | Alignment Level | How |
|-----|------|----------------|-----|
| SDG 2 — Zero Hunger | End hunger & food insecurity | **Direct / Primary** | Routes real surplus food to people in need |
| SDG 12 — Responsible Consumption | Reduce food waste | **Direct / Primary** | Prevents food from being discarded |
| SDG 17 — Partnerships | Multi-sector collaboration | **Direct** | Connects donors, distributors, admins |
| SDG 11 — Sustainable Cities | Community resilience | **Indirect** | Local food sharing networks |
| SDG 13 — Climate Action | Reduce greenhouse gases | **Indirect** | Less food waste = less methane |

---

## 5. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 15 (App Router) | Full-stack React with SSR/SSG + API routes |
| **Language** | TypeScript 5 | Type-safe development across frontend and backend |
| **UI Library** | React 18 | Component-based reactive user interfaces |
| **Styling** | Tailwind CSS 3.4 | Utility-first responsive CSS framework |
| **UI Components** | Radix UI + shadcn/ui | Accessible, composable component primitives |
| **Charts** | Recharts 2 | Admin donation trends visualization |
| **Maps** | Leaflet + react-leaflet | Interactive OpenStreetMap integration |
| **Database** | MongoDB 6 | Document-oriented NoSQL database |
| **ODM** | Mongoose 8 (+ raw driver) | MongoDB schema support and query building |
| **Authentication** | JWT (`jose`) + bcryptjs | Stateless auth with HTTP-only cookies |
| **Email** | Resend | Transactional email delivery |
| **Rate Limiting** | Upstash Redis + Ratelimit | API protection against abuse |
| **Forms** | react-hook-form + Zod | Schema-driven form validation |
| **Logging** | Winston | Structured server-side audit logging |
| **XSS Protection** | isomorphic-dompurify | Input sanitization before database writes |
| **Real-time** | Server-Sent Events (SSE) | Live donation status push to browser clients |
| **Matching** | Custom scoring engine | Urgency + geo-proximity donation ranking |
| **Build Tool** | Turbopack | Fast bundler for development (Next.js 15 default) |
| **Dev Port** | 9002 | Local development server |

---

## 6. System Architecture & Design

### Frontend Architecture (Next.js App Router)

```
src/app/
├── page.tsx                    ← Public landing page
├── login/page.tsx              ← Login form
├── signup/page.tsx             ← Registration form
├── verify-email/page.tsx       ← Email verification
├── dashboard/
│   ├── layout.tsx              ← Protected layout (session check)
│   ├── page.tsx                ← Role-aware dashboard home
│   ├── donations/              ← Donor: my donations | Distributor: browse + matching feed
│   ├── claims/                 ← Distributor: my claimed donations (unclaim, complete, note)
│   ├── cliams/                 ← Auto-redirect → /dashboard/claims (typo alias)
│   ├── distributions/          ← Redirect alias to claims
│   ├── profile/                ← User profile management
│   └── admin/
│       ├── donations/          ← Admin: all donations management
│       └── users/              ← Admin: all users management
└── api/                        ← Backend API routes
```

### Backend Architecture (Next.js API Routes)

```
src/app/api/
├── auth/
│   ├── login/route.ts
│   ├── logout/route.ts
│   ├── signup/route.ts
│   ├── session/route.ts
│   └── verify-email/route.ts
├── donations/
│   ├── route.ts                        ← POST (create donation)
│   ├── [id]/route.ts                   ← GET/PATCH/DELETE single donation
│   ├── [id]/claim/route.ts             ← POST (claim; accepts lat/lng for proximity check)
│   ├── [id]/complete/route.ts          ← POST (mark completed; triggers email + SSE)
│   ├── [id]/unclaim/route.ts           ← POST (release back to available; triggers SSE)
│   ├── [id]/report/route.ts            ← POST (flag donation; 4 reason types)
│   ├── [id]/note/route.ts              ← PATCH (set coordination note ≤ 500 chars)
│   ├── expire/route.ts                 ← POST (auto-expire stale donations; cron target)
│   └── paginated/route.ts              ← GET (cursor/page pagination)
├── users/
│   └── [id]/rate/route.ts              ← POST (submit review; triggers trust recompute)
├── events/route.ts                     ← GET (SSE stream; push real-time events)
├── matching/route.ts                   ← GET (urgency-ranked feed with geo-proximity)
├── analytics/route.ts                  ← GET (admin KPI metrics; 5-min cache)
├── upload/route.ts                     ← POST (image upload; jpg/png/webp ≤ 5 MB)
├── cron/
│   └── expiry-alerts/route.ts          ← POST (email distributors; fire expire cleanup)
└── seed/route.ts                       ← POST (insert sample data for testing)
```

### Data Flow

```
User Action (Browser)
    │
    ▼
Next.js Page Component (RSC or Client Component)
    │
    ▼
API Route Handler (route.ts)
    │
    ├─► Session Check (auth.ts → JWT cookie decode)
    ├─► Rate Limit Check (Upstash Redis / In-memory)
    ├─► Zod Schema Validation
    ├─► DOMPurify Sanitization
    ├─► MongoDB Operation (db.ts)
    ├─► Email Notification (email.ts → Resend)
    ├─► SSE Broadcast (lib/sse.ts broadcast() → all connected clients)
    └─► Winston Audit Log
    │
    ▼
Response to Client
```

---

## 7. User Roles & Features

### Role: DONOR

A **donor** is any individual, restaurant, caterer, household, or business with surplus food.

**Registration flow:**
1. Sign up at `/signup` → role selection → email verification (24-hour link)
2. Secure password (min 12 chars, mixed case, numbers, special characters)
3. Auto-generated avatar from DiceBear API

**Dashboard features:**

| Feature | Description |
|---|---|
| **Stats Overview** | Cards showing total donations posted, currently active, and completed pickups |
| **Post a Donation** | Form with title, description, quantity, expiry date/time, location picker (Leaflet map), and optional image upload (jpg/png/webp ≤ 5 MB) |
| **My Donations Table** | Paginated table with status badges, expiry countdown, and Coordination Note column |
| **Status Tracking** | Each donation shows: Available → Claimed → Completed / Expired |
| **Coordination Notes** | Donors see any pickup note added by the claiming distributor (entrance, timing, etc.) |
| **Rate Distributor** | After a donation is completed, dropdown menu lets donor rate the distributor (1–5 ★) |
| **Email Confirmation** | Automated email on successful donation posting |
| **Claim Notification** | Email alert when a distributor claims the donation |

**Donation posting workflow:**
```
Fill Form → Upload Image (optional) → Select Location on Map → Submit
    → Rate Limit Check (10/hour)
    → Zod Validation
    → DOMPurify Sanitize
    → MongoDB Insert
    → Confirmation Email to Donor
    → SSE broadcast: new_donation → all distributor clients update live
    → Donation appears on platform map
```

---

### Role: DISTRIBUTOR

A **distributor** is an NGO, food bank, volunteer group, shelter, or community kitchen that collects and delivers food to beneficiaries.

**Dashboard features:**

| Feature | Description |
|---|---|
| **Stats Overview** | Available donations count, total claims made, distributions completed |
| **Smart Matching Feed** | Donations ranked by urgency score (expiry + donor trust + distance) with color-coded urgency badges |
| **Browse Donations Map** | Interactive Leaflet map; all available donations as pins |
| **One-Click Claim** | Claim with optional geolocation — server returns a proximity warning if pickup is >50 km away (soft warning, never blocks) |
| **My Claims** | All claimed and completed donations in one view |
| **Mark Complete** | Marks pickup as completed; triggers donor impact email and SSE broadcast |
| **Unclaim / Release** | If a distributor can no longer collect, they release the donation back to "available" for others |
| **Coordination Notes** | Add a short note (≤ 500 chars) on a claimed donation to coordinate pickup details with the donor |
| **Rate Donor** | After completing a pickup, distributor can rate the donor (1–5 ★); triggers trust score recomputation |
| **Report Donation** | Flag any donation as unsafe / misrepresented / already gone / other (one report per user) |
| **Notification Email** | Receives claim confirmation with full donor and donation details |
| **Expiry Alert Email** | Receives automated email when food items are expiring within 6 hours |

**Claiming workflow:**
```
Browse Matching Feed / Map → Select Donation → Click Claim
    → Browser requests geolocation (non-blocking)
    → POST /api/donations/[id]/claim { lat?, lng? }
    → Rate Limit Check (20/hour)
    → Distributor-only Guard
    → MongoDB: status "claimed", claimedBy set
    → Proximity check: if dist > 50 km → proximityWarning in response → shown as toast
    → Email to Donor: "your food was claimed!"
    → Email to Distributor: "claim confirmed with details"
    → SSE broadcast: donation_claimed → all clients update live
```

---

### Role: ADMIN

An **admin** has full platform oversight. This role is for platform operators, partner organizations, or municipal food waste coordinators.

**Dashboard features:**

| Feature | Description |
|---|---|
| **Live KPI Cards** | Total donations, users, completion rate, claim rate, estimated meals saved, estimated CO₂ saved |
| **Impact Metrics** | `estimatedMealsSaved` and `estimatedCO2Saved` computed from completed donations |
| **All Donations Map** | Leaflet map with every donation color-coded by status |
| **Donation Trends Chart** | Recharts bar chart: monthly donation / claimed / completed volume |
| **Manage Donations** | Full table with filtering, sort, and status at a glance |
| **Manage Users** | All users across all roles with trust scores visible |
| **Force Expire** | POST `/api/donations/expire` to immediately purge stale listings |
| **Trigger Expiry Alerts** | POST `/api/cron/expiry-alerts` via admin session to email all distributors |
| **Unclaim Any Donation** | Admin can release any claimed donation if the distributor is unresponsive |
| **Audit Trail** | Winston logs record every signup, login, donation create/claim/complete/unclaim/report |

---

## 8. Key Modules & Features Deep Dive

### 8.1 Interactive Map System

The map is a central UX feature that differentiates FoodBridge from basic listing platforms.

**Location Picker** (for donors during donation creation):
- Powered by **Leaflet + OpenStreetMap** tiles
- Click anywhere on the map to drop a marker
- **Reverse geocoding** via the OpenStreetMap Nominatim API — automatically converts clicked coordinates into a human-readable address
- Coordinates (`lat`, `lng`) and address string stored together in MongoDB

**Donation Map** (for distributors and admin):
- All donations rendered as map pins
- Clicking a pin shows the donation details popup
- MongoDB stores a **2dsphere geospatial index** on the `location` field, enabling proximity/distance queries

---

### 8.2 Smart Matching Engine

The matching engine ranks available donations so the most at-risk food appears first in the distributor feed.

**Scoring formula (0–100):**

| Component | Weight | Points | Breakdown |
|---|---|---|---|
| Expiry urgency | 40% | 0–40 | ≤6h = 40pts · ≤24h = 30pts · ≤72h = 20pts · ≤168h = 10pts · else = 5pts |
| Donor trust score | 30% | 0–30 | `(trustScore / 100) × 30` — higher-rated donors float to top |
| Distance | 20% | 0–20 | 20pts at ≤2 km, linear scale to 0pts at ≥20 km; **neutral 10pts when no coords supplied** |
| Listing age | 10% | 0–10 | Older listings gain points to prevent stagnation |

**Urgency badges** (shown on every donation card):

| Badge | Colour | Condition |
|---|---|---|
| 🔴 Critical | Red | ≤ 6 hours until expiry |
| 🟠 Urgent | Orange | ≤ 24 hours |
| 🟡 Soon | Yellow | ≤ 72 hours |
| 🟢 Normal | Green | > 72 hours |

**Distance scoring detail**: Uses the Haversine formula (`haversineKm()` in `src/lib/matching.ts`). Full 20 points at ≤2 km; score decreases linearly to 0 at ≥20 km. When the distributor's browser does not provide geolocation, a neutral score of 10 is used so donations still rank correctly by urgency and trust alone.

**Proximity warning**: When a distributor claims a donation and their browser provides geolocation, the server computes the haversine distance. If it exceeds 50 km a soft warning is returned and shown as a toast — the claim is never blocked.

API: `GET /api/matching?lat=<n>&lng=<n>&limit=<n>` — accessible to distributors and admins.

---

### 8.3 Real-Time Updates (Server-Sent Events)

`GET /api/events` provides a persistent SSE stream to all authenticated clients. Whenever a donation status changes, every connected browser receives a push notification and can update its UI without polling.

**Architecture**: The subscriber registry and `broadcast()` function live in `src/lib/sse.ts` — a dedicated module kept separate from the API route file to satisfy Next.js App Router's constraint that route files may only export HTTP handler functions. This allows any server-side module to push events without importing a route file.

```
src/lib/sse.ts
  └── subscribers: Map<userId, Set<Subscriber>>   ← in-process registry
  └── broadcast(eventType, payload, targetRole?)  ← role-filtered push

src/app/api/events/route.ts
  └── GET handler only — registers subscriber, sends heartbeats, cleans up on disconnect
```

**Role-aware broadcasting**: The `broadcast()` function accepts an optional `targetRole` parameter. When set, only subscribers with a matching role receive the event — preventing unnecessary traffic to irrelevant clients:

| Event | targetRole | Who receives it |
|---|---|---|
| `new_donation` | `"distributor"` | Distributor feeds refresh instantly |
| `donation_claimed` | `"donor"` | Donor sees their listing status change |
| `donation_completed` | *(all)* | All connected clients update |
| `donation_expired` | *(all)* | All connected clients update |

**Connection lifecycle**:
1. Client connects → server validates JWT session → subscriber registered under `userId`
2. Server sends `connected` event: `{ userId, role, timestamp }` — client confirms role
3. Server sends a comment heartbeat (`": heartbeat"`) every **25 seconds** to keep the connection alive through load balancers and proxies
4. On browser tab close / network drop → `abort` event cleans up the subscriber immediately

**Client hook** (`src/hooks/use-sse.ts`):
- Listens for all 5 event types: `connected`, `new_donation`, `donation_claimed`, `donation_completed`, `donation_expired`
- **Exponential backoff reconnection**: on error, initial retry delay is 1 second, doubles on each failure, capped at **30 seconds**
- Tears down the `EventSource` cleanly on component unmount — no memory leaks

**Production upgrade path**: The in-process `Map` is single-process only. For multi-instance deployments (e.g., multiple Vercel regions) this should be replaced with Redis Pub/Sub; the `broadcast()` signature is unchanged so this swap requires no consumer-side changes.

---

### 8.4 Image Upload System

`POST /api/upload` handles donation photo uploads:

- Accepted formats: **JPEG, PNG, WebP**
- Maximum file size: **5 MB**
- Saves to `/public/uploads/` in local development
- Returns `{ url, filename, size }` — the `url` is stored as `imageUrl` on the donation
- Production-ready swap point for S3 / Cloudflare R2

---

### 8.5 Trust Score Engine

Every user has a computed `trustScore` (0–100) that reflects their reliability on the platform.

**Formula:**
```
trustScore = (ratingAvg / 5 × 100) × 0.60
           + (completedDonations / claimedDonations × 100) × 0.40
```

- Recomputed automatically every time a review is submitted
- `ratingAvg`, `totalRatings`, and `trustScore` stored on the user document
- Feeds directly into the matching engine (higher-trust donors appear first)
- Duplicate reviews are blocked — a reviewer can only rate the same donation once (returns HTTP 409 if attempted again)

---

### 8.6 Review & Rating System

Both directions of the transaction can leave reviews after a donation is completed:

| Reviewer | Reviews | Trigger |
|---|---|---|
| Donor | Distributor (partner) | "Rate Partner" in My Donations dropdown after status = completed |
| Distributor | Donor | "Rate Donor" button on the claimed donations card after status = completed |

Reviews use `POST /api/users/[id]/rate` with `{ donationId, rating, comment }`. The rate route calls `addReview()` which:
1. Checks for an existing review (same reviewer + donation → 409 Conflict)
2. Inserts the review to the `reviews` collection
3. Calls `recomputeTrustScore()` on the target user

---

### 8.7 Safety Reporting

Any authenticated user can flag a donation once via `POST /api/donations/[id]/report`.

**Reason options:**

| Reason | Use case |
|---|---|
| `unsafe` | Food appears spoiled or hazardous |
| `misrepresented` | Photo/description does not match reality |
| `already_gone` | Food was collected but listing still shows available |
| `other` | Free-text explanation |

- Reports are stored in a dedicated `reports` MongoDB collection
- `reportCount` on the donation is incremented each time
- Duplicate reports from the same user are blocked (HTTP 409)
- A flag icon button appears on every donation card for distributors to use while browsing

---

### 8.8 Unclaim Mechanism

Distributors who can no longer collect a donation can release it via `POST /api/donations/[id]/unclaim`:

- Status reverts to `"available"`, `claimedBy` is unset, `unclaimedAt` is recorded
- Triggers an SSE `new_donation` event so other distributors see it instantly
- Admin can force-unclaim any donation regardless of claimer
- The donation reappears on the matching feed for other distributors

---

### 8.9 Pickup Coordination Notes

`PATCH /api/donations/[id]/note` lets either party leave a short coordination note (max 500 characters):

- **Eligible**: the donation's donor, the claiming distributor, or any admin
- Stored as `pickupNote` on the donation document
- **Donors** see it in the "Coordination Note" column in their My Donations table
- **Distributors** can add/edit the note from a dialog on their claimed donations view
- Useful for: entrance instructions, available pickup windows, contact numbers

---

### 8.10 Expiry Alert System

`POST /api/cron/expiry-alerts` is designed to be triggered on a schedule. On Vercel it runs automatically via `vercel.json` (committed to the repository). On any other host it can be called from a Linux cron job or CI scheduler.

**What it does (in order):**
1. Checks authorization: accepts either a `Bearer CRON_SECRET` header **or** an active admin session
2. Queries all donations with `status = "available"` and `expiry < now + 6 hours`
3. Builds a per-donation summary: title, address, hours remaining
4. Sends the formatted alert email to **every registered distributor** on the platform (concurrent `Promise.allSettled` — one failed email does not stop others)
5. Fire-and-forgets `POST /api/donations/expire` to immediately mark any already-past donations as `"expired"`
6. Returns `{ donations: N, recipients: sent }` in the response

**Vercel Cron schedules** (declared in `vercel.json`):

| Endpoint | Schedule | Action |
|---|---|---|
| `/api/cron/expiry-alerts` | Every hour at :00 | Email all distributors about food expiring < 6 h |
| `/api/donations/expire` | Every 15 minutes | Auto-mark past-due `available` donations as `expired` |

Auth: Bearer `CRON_SECRET` environment variable (recommended) **or** an active admin session (for manual trigger from the admin dashboard).

---

### 8.11 Analytics Dashboard

`GET /api/analytics` (admin only, 5-minute CDN cache) returns `ImpactMetrics` computed by `getImpactMetrics()` in `src/lib/analytics.ts` using **live MongoDB aggregations** — no static or pre-seeded numbers.

**Returned metrics:**

| Metric | Type | How Computed |
|---|---|---|
| `totalDonations` | Count | All donations in DB |
| `totalUsers` | Count | All users |
| `donorsCount` / `distributorsCount` | Count | Filtered by `role` |
| `availableCount` / `claimedCount` / `completedCount` / `expiredCount` | Count | Filtered by `status` |
| `completionRate` | % | `completedCount / totalDonations × 100` |
| `claimRate` | % | `(claimedCount + completedCount) / totalDonations × 100` |
| `estimatedMealsSaved` | Integer | Sum across completed donations: parses quantity strings ("10 meals" → 10, "5 kg" → 15, "2 boxes" → 16, etc.) |
| `estimatedCO2Saved` | kg (float) | `estimatedMealsSaved × 0.5` — industry average CO₂ saving per meal redirected from waste |
| `avgTimeToClaimHours` | Hours | Average midpoint between `createdAt` and `expiry` for claimed/completed donations (approximate) |
| `trends` | `DonationTrend[6]` | **6-month rolling aggregation** — for each of the last 6 calendar months: total posted, total claimed, total completed |

**Trend chart**: The admin dashboard renders the 6-month trend data as a Recharts bar chart showing posted / claimed / completed volumes side by side, giving a visual overview of platform activity over time.

---

### 8.12 Email Notification System

Nine distinct, styled HTML email templates are used throughout the user journey.

---

### 8.13 Pagination System

- Both **page-based** and **cursor-based (infinite scroll)** pagination implemented in `pagination.ts`
- Configurable page size (maximum 100 items)
- Returns total count and page metadata alongside results
- Served via dedicated `/api/donations/paginated` endpoint

---

### 8.14 Logging & Audit Trail

Using **Winston** for structured logging:
- **Development**: colorized, human-readable console output
- **Production**: JSON format + writes to `error.log` and `combined.log` files

Audit events logged:
- `USER_SIGNUP`, `USER_LOGIN`
- `DONATION_CREATED`, `DONATION_CLAIMED`, `DONATION_COMPLETED`
- `DONATION_UNCLAIMED`, `DONATION_REPORTED`
- `IMAGE_UPLOADED`
- `EXPIRY_ALERTS_SENT`, `DONATIONS_EXPIRED`

---

## 9. Data Models & Database Design

### User Model

```typescript
{
  id: string,               // Custom UUID
  name: string,
  email: string,            // Unique index
  role: "donor" | "distributor" | "admin",
  avatarUrl: string,        // DiceBear auto-generated from email seed
  createdAt: Date,
  passwordHash: string,     // Server-only, never sent to client
  emailVerified: boolean,
  emailVerifiedAt?: Date,
  trustScore: number,       // 0–100; computed from reviews + completion rate
  totalRatings: number,     // Count of reviews received
  ratingAvg: number,        // Average star rating (1–5)
  isVerified?: boolean      // Manual admin verification flag
}
```

### Donation Model

```typescript
{
  id: string,               // String ID — format: "donation-{timestamp}-{random}"
                            //   e.g. "donation-1741148400000-k3f8x2"
                            //   All sub-routes query by this field, NOT by MongoDB _id
  title: string,
  description: string,
  quantity: string,         // Human display string, e.g. "10 meals" or "5 kg"
  quantityValue: number,    // Structured numeric value (e.g. 10, 5)
  quantityUnit: string,     // Structured unit (e.g. "meals", "kg", "boxes")
  category: string,         // Food category (e.g. "cooked_food", "produce", "packaged")
  expiry: Date,             // Urgency indicator
  location: {
    address: string,        // Reverse-geocoded human-readable address
    lat: number,            // GPS latitude
    lng: number             // GPS longitude (2dsphere indexed)
  },
  imageUrl: string,         // Optional donation photo (/uploads/… or remote URL)
  imageHint: string,        // Alt text / image description
  status: "available" | "claimed" | "completed" | "expired",
  donor: EmbeddedUser,      // Denormalized donor info for fast reads
  claimedBy?: EmbeddedUser, // Set when distributor claims
  createdAt: Date,
  completedAt?: Date,       // Set when distributor marks complete
  unclaimedAt?: Date,       // Set if distributor releases the donation
  pickupNote?: string,      // Coordination note (max 500 chars)
  reportCount?: number      // Incremented each time the donation is flagged
}
```

### Review Model

```typescript
{
  id: string,
  reviewerId: string,
  reviewerName: string,
  targetUserId: string,     // User being reviewed
  donationId: string,       // Associated donation (unique per reviewer+donation)
  rating: number,           // 1–5 stars
  comment?: string,
  createdAt: Date
}
```

### DonationReport Model

```typescript
{
  id: string,
  donationId: string,
  reporterId: string,       // Unique per reporter+donation
  reporterName: string,
  reason: "unsafe" | "misrepresented" | "already_gone" | "other",
  details?: string,         // Optional extra context (max 500 chars)
  createdAt: Date
}
```

### MongoDB Collections & Indexes

| Collection | Key Indexes |
|---|---|
| `users` | `email` (unique), `id` (unique), `role`, `emailVerified` |
| `donations` | `status`, `donor.id`, `claimedBy.id`, `expiry`, `createdAt` (desc), compound `{status, expiry, createdAt}`, `location` (**2dsphere** for geospatial), full-text on `title + description` |
| `email_verifications` | `token` (unique), `userId`, `expiresAt` (**TTL index** for auto-cleanup) |
| `reviews` | `reviewerId + donationId` (compound unique — prevents duplicate reviews) |
| `reports` | `reporterId + donationId` (compound unique — prevents duplicate reports) |

---

## 10. Security & Reliability

### Security Layers

| Layer | Implementation |
|---|---|
| Authentication | HTTP-only JWT cookies (tamper-proof, XSS-immune) |
| Authorization | Role-based guards on every API route and dashboard layout |
| Input Validation | Zod schemas on all API inputs |
| Input Sanitization | DOMPurify on all user text before DB writes |
| Password Storage | bcryptjs 10-round hash |
| Rate Limiting | Upstash Redis (in-memory fallback) |
| Secret Enforcement | JWT_SECRET length enforced at app startup |
| Session Expiry | 7-day JWT TTL with secure cookie flags |
| Self-Rating Prevention | Users cannot rate themselves (checked in the rate route) |
| Duplicate Review/Report | Compound unique index + 409 response prevents gaming the system |
| Cron Authorization | CRON_SECRET Bearer token OR admin session; rejects unauthenticated automation |
| Upload Restrictions | Only donors/admins may upload; type + size enforced server-side |

### Rate Limiting

| Endpoint | Limit | Backend |
|---|---|---|
| Signup | 3 requests/hour/IP | Upstash Redis |
| Login | 5 requests/hour/IP | Upstash Redis |
| Post Donation | 10 requests/hour/user | Upstash Redis |
| Claim Donation | 20 requests/hour/user | Upstash Redis |
| General API | 100 requests/hour/IP | Upstash Redis |

Falls back to **in-memory rate limiting** when Upstash is not configured.

### Reliability Features

| Feature | Implementation |
|---|---|
| DB Connection | Singleton MongoDB client with connection pooling |
| Graceful Fallback | Mock/placeholder data when MongoDB is unavailable |
| Email Fallback | Console logging when Resend API key is absent |
| Rate Limit Fallback | In-memory store when Upstash is not configured |
| TTL Cleanup | MongoDB TTL index auto-removes expired email tokens |
| Serialization Guards | All DB documents stripped of `_id`, `passwordHash` before reaching client |
| SSE Resilience | Closed connections silently removed from subscriber map |
| Image URL Safety | Server rejects non-image MIME types regardless of file extension |

---

## 11. API Reference Summary

### Authentication

| Endpoint | Method | Role | Description |
|---|---|---|---|
| `/api/auth/signup` | POST | Public | Register new user; sends verification email |
| `/api/auth/login` | POST | Public | Authenticate; sets JWT cookie |
| `/api/auth/logout` | POST | Authenticated | Clears session cookie |
| `/api/auth/session` | GET | Authenticated | Returns current user session |
| `/api/auth/verify-email` | GET/POST | Public | Validates email verification token |

### Donations — Core

| Endpoint | Method | Role | Description |
|---|---|---|---|
| `/api/donations` | POST | Donor | Create a new donation listing |
| `/api/donations/[id]` | GET | Authenticated | Get a single donation |
| `/api/donations/[id]` | PATCH | Donor/Admin | Update title / description |
| `/api/donations/[id]` | DELETE | Donor/Admin | Delete a donation |
| `/api/donations/paginated` | GET | Authenticated | Paginated donation list |

### Donations — Lifecycle

| Endpoint | Method | Role | Description |
|---|---|---|---|
| `/api/donations/[id]/claim` | POST | Distributor | Claim a donation; accepts `{ lat?, lng? }` for proximity check |
| `/api/donations/[id]/complete` | POST | Distributor/Admin | Mark pickup complete; emails donor; SSE broadcast |
| `/api/donations/[id]/unclaim` | POST | Distributor/Admin | Release back to available; SSE broadcast |
| `/api/donations/expire` | POST | Admin/Cron | Mark all past-expiry available donations as expired |

### Donations — Community Features

| Endpoint | Method | Role | Description |
|---|---|---|---|
| `/api/donations/[id]/note` | PATCH | Donor/Distributor/Admin | Set coordination note (max 500 chars) |
| `/api/donations/[id]/report` | POST | Any authenticated | Flag donation; blocked if already reported by same user |
| `/api/users/[id]/rate` | POST | Any authenticated | Submit 1–5★ review; triggers trust score recompute |

### Discovery & Intelligence

| Endpoint | Method | Role | Description |
|---|---|---|---|
| `/api/matching` | GET | Distributor/Admin | Urgency-ranked donations; accepts `?lat=&lng=&limit=` |
| `/api/analytics` | GET | Admin | KPI metrics: meals saved, CO₂, rates; 5-min cache |
| `/api/events` | GET | Authenticated | SSE stream; receives `new_donation`, `donation_claimed`, `donation_completed`, `donation_expired` |

### Infrastructure

| Endpoint | Method | Role | Description |
|---|---|---|---|
| `/api/upload` | POST | Donor/Admin | Upload image (jpg/png/webp ≤ 5 MB); returns URL |
| `/api/cron/expiry-alerts` | POST | Admin/Cron | Email all distributors about soon-expiring food |
| `/api/users/[id]` | GET/PATCH | Admin/Self | User profile management |
| `/api/seed` | POST | — | Insert sample data for testing |

---

## 12. Email & Notification System

All emails are sent via the **Resend** API with custom HTML templates (`src/lib/email.ts`). The system handles graceful fallback to console logging in development, ensuring zero friction setup.

| # | Template Name | Trigger | Recipient | Notes |
|---|---|---|---|---|
| 1 | **Welcome** | User registers | New user | Onboarding message |
| 2 | **Email Verification** | Post-signup | New user | 24-hour link; user cannot access dashboard until verified |
| 3 | **Donation Posted** | Donation successfully created | Donor | Confirms listing is live |
| 4 | **Donation Claimed — Donor** | Distributor claims donation | Donor | "Your food was claimed!" |
| 5 | **Claim Confirmation** | Distributor claims donation | Distributor | Full pickup address and donor details |
| 6 | **Donation Completed** | Distributor marks pickup complete | Donor | Includes `~N meals saved` impact estimate |
| 7 | **Donation Expired** | Auto-expire cron fires | Donor | Notified when their listing expires unclaimed; tips to re-post |
| 8 | **Expiry Alert** | Hourly cron job (`/api/cron/expiry-alerts`) | All distributors | Lists all donations expiring < 6 h with address + hours remaining + "Claim Now" deep-link |
| 9 | **Password Reset** | Password reset request | User | 1-hour expiry reset link |

```
Signup ─────────────► Welcome Email + Verification Link
                              │
                       User clicks link
                              │
                    ──► Email Verified ✓

Donor posts food ──────────► Donation Confirmation Email (to Donor)

Distributor claims ─┬──► "Your Food Was Claimed!" (to Donor)
                    └──► Claim Details Confirmation (to Distributor)

Distributor completes ──► Impact Email to Donor
                          ("You helped save ~N meals!")

Auto-expire fires ──────► Donation Expired Email (to Donor)
                           ("Your listing expired unclaimed; tips to re-post")

Cron (every hour) ──────► Expiry Alert → all Distributors
                           (food expiring < 6 hours, with "Claim Now" deep-link)
```

---

## 13. Maps & Geospatial Features

**Leaflet + OpenStreetMap** integration provides a fully open-source, zero-cost mapping solution:

- **No Google Maps API key required** — uses OpenStreetMap tiles
- **Reverse Geocoding** via OSM Nominatim API — click on map → get readable address automatically
- **2dsphere MongoDB index** — enables proximity-based queries (find donations near me)
- **Haversine distance formula** — exported from `src/lib/matching.ts`; used in both the matching engine ranking and the claim-time proximity warning
- **Donor map picker**: Full-screen interactive map lets donors precisely pin the pickup location
- **Distributor discovery map**: All available donations visible as map pins simultaneously; smart matching feed can additionally filter by distance
- **Admin overview map**: Platform-wide map view for operational awareness
- **Proximity warning on claim**: If a distributor's browser-provided coordinates are >50 km from the donation, a soft warning toast is shown (claim is never blocked)

Default center coordinates: Los Angeles, CA (34.0522°N, 118.2437°W) — configurable for deployment in other cities.

---

## 14. Impact & Future Roadmap

### Current Impact Metrics (Platform Goals)
- 10,000+ meals saved from going to waste
- 500+ active donors across restaurant, household, and business segments
- 50+ cities coverage potential
- 200+ distributor organizations onboard

### Implemented Features (Current Version — v2.0)

**Phase 1 — Core Platform**
- [x] Three-role authentication system with email verification
- [x] Donation posting with location picker and expiry tracking
- [x] Donation claiming with instant email notifications
- [x] Interactive maps for browsing and location picking
- [x] Admin dashboard with stats, trends chart, and user management
- [x] Rate limiting and security hardening
- [x] Paginated API with cursor and page-based options
- [x] Audit logging with Winston
- [x] Responsive design (mobile + desktop)

**Phase 2 — Intelligence & Real-time**
- [x] Image upload API (jpg/png/webp ≤ 5 MB)
- [x] Smart matching engine — urgency score + geo-proximity ranking
- [x] Urgency badges on every donation card (Critical / Urgent / Soon / Normal)
- [x] Server-Sent Events (SSE) — real-time push to all connected browsers
- [x] Auto-expire cron endpoint
- [x] Donation completion flow with donor impact email (meals + CO₂ estimate)
- [x] Analytics API — KPI metrics with CDN cache
- [x] Enhanced admin dashboard with live impact stats

**Phase 3 — Trust, Safety & Communication**
- [x] Trust score engine — 60% rating avg + 40% completion rate, auto-recomputed on every review
- [x] Duplicate-proof review system — both directions (donor ↔ distributor) after completion
- [x] Unclaim / release mechanism — returns donation to available with SSE broadcast
- [x] Proximity warning on claim — soft 50 km haversine check, never blocks
- [x] Food safety reporting — 4 reason types, one report per user, `reportCount` tracked
- [x] Expiry alert emails — hourly cron emails all distributors about food expiring < 6 h
- [x] Pickup coordination notes — 500-char note visible to both donor and distributor
- [x] Donor outcome visibility — coordination note column in donor's My Donations table
- [x] Typo route fixed — `/dashboard/cliams` auto-redirects to `/dashboard/claims`
- [x] Image URL bug fixed — uploaded photos now display correctly in donor table

**Phase 4 — Expo Innovations**
- [x] **Smart Matching Algorithm** — multi-factor scoring engine: 40% expiry urgency + 30% donor trust + 20% geo-proximity + 10% listing age; scores 0–100 per donation; `GET /api/matching` returns ranked feed
- [x] **Trust Score Composite Metric** — `(ratingAvg/5 × 100) × 0.60 + (completedDonations/claimedDonations × 100) × 0.40`; auto-recomputed after every review submission; penalises donors/distributors who ghost pickups
- [x] **SSE Subscriber Registry extracted to `src/lib/sse.ts`** — fixes Next.js App Router route export constraint (TS2344); `broadcast()` now accepts optional `targetRole` for role-gated delivery
- [x] **Role-aware SSE broadcasting** — `new_donation` pushed only to distributors; `donation_claimed` pushed only to donors; reduces unnecessary client traffic
- [x] **SSE heartbeat** — 25-second comment heartbeats keep connections alive through load balancers and proxies
- [x] **Exponential backoff reconnection** (`use-sse.ts`) — on network failure: 1 s → 2 s → 4 s → … capped at 30 s; auto-reconnects on component mount; cleans up on unmount
- [x] **Proactive Expiry Alerts via Vercel Cron** — `vercel.json` schedules two cron jobs: expiry alerts (hourly) and force-expire (every 15 min); no external scheduler required on Vercel
- [x] **Proximity Warning (soft enforcement)** — distributor's browser sends `{ lat, lng }` with claim request; server computes haversine distance; if > 50 km returns `proximityWarning` toast — claim is never blocked, preserving food redistribution even when no nearby distributor is available
- [x] **Analytics with real Carbon / Meal Impact Estimates** — `getImpactMetrics()` in `src/lib/analytics.ts` runs live MongoDB aggregations; estimates meals saved from quantity strings (`"10 meals"`, `"5 kg"`, `"2 boxes"` etc.) and CO₂ from industry waste-to-methane factors; includes `avgTimeToClaimHours` and 6-month trend data
- [x] **Lifecycle-Aware 9-Template Email System** — dedicated HTML email for every donation state transition: posted → claimed → completed → expired → alert; `donationExpired` notifies donor when listing goes unclaimed; `donationCompleted` includes meals-saved estimate
- [x] **Donation string ID strategy** — explicit `id: "donation-{timestamp}-{random}"` generated at creation time so all sub-routes (`claim`, `complete`, `note`, `report`) query by `{ id }` string field (not MongoDB `ObjectId`), enabling consistent lookups regardless of MongoDB driver version

### Roadmap (Planned Features)

| Feature | Purpose |
|---|---|
| **Redis caching layer** | Faster repeated reads on popular donations |
| **API versioning** | Backward-compatible API evolution |
| **Service/Repository pattern** | Cleaner separation of business logic from DB queries |
| **Push notifications** | Browser notifications for new donations in distributor's area |
| **Mobile app** (React Native) | Native iOS/Android experience for field distributors |
| **Partial claim / quantity splitting** | Multiple distributors claiming portions of one large donation |
| **Recurring donations** | Donors can schedule regular surplus donations |
| **Distance-based filtering** | Find donations within X km of my location in the UI |
| **Admin moderation queue** | Review flagged/reported donations from the admin panel |
| **Microservices** | Independent scaling of notification, matching, and auth services |

---

## 15. Environment & Deployment

### Required Environment Variables

```env
# Database
MONGODB_URI=mongodb://localhost:27017/foodbridge
MONGODB_DB_NAME=foodbridge          # Optional, defaults to "foodbridge"

# Authentication
JWT_SECRET=<minimum 32 characters>  # Required — app refuses to start without it

# Email (Optional in development)
RESEND_API_KEY=<your Resend API key>
FROM_EMAIL=noreply@yourdomain.com

# App URL (Required for email deep-links, e.g. "Claim Now" button in expiry alert emails)
NEXT_PUBLIC_APP_URL=https://yoursite.com

# Rate Limiting (Optional — in-memory fallback used if absent)
UPSTASH_REDIS_REST_URL=<your Upstash URL>
UPSTASH_REDIS_REST_TOKEN=<your Upstash token>

# Cron Jobs (Optional — required to secure expiry endpoints)
CRON_SECRET=<any long random string>
```

### Running Locally

```bash
# Clone repository
git clone https://github.com/Vasugoli/FoodBridge.git
cd FoodBridge

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Start development server (port 9002)
npm run dev

# Open http://localhost:9002
```

### Database Setup

```bash
# The app auto-creates collections on first use.
# To create optimized indexes:
npx ts-node src/scripts/create-indexes.ts

# To seed sample donation data:
# POST to /api/seed endpoint or run dev server and visit:
# http://localhost:9002/api/seed
```

### Cron Job Setup (Expiry Alerts)

On **Vercel**, a `vercel.json` file at the project root configures two automatic cron jobs — no external scheduler required:

```json
// vercel.json (committed to repository)
{
  "crons": [
    { "path": "/api/cron/expiry-alerts", "schedule": "0 * * * *" },
    { "path": "/api/donations/expire",   "schedule": "*/15 * * * *" }
  ]
}
```

| Job | Schedule | Purpose |
|---|---|---|
| `/api/cron/expiry-alerts` | Every hour at :00 | Emails all distributors about donations expiring < 6 h |
| `/api/donations/expire` | Every 15 minutes | Marks past-due available donations as `"expired"` |

For **Linux servers** or non-Vercel deployments:

```bash
# Every hour — expiry alert emails
0 * * * * curl -s -X POST https://yoursite.com/api/cron/expiry-alerts \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Every 15 minutes — force-expire stale listings
*/15 * * * * curl -s -X POST https://yoursite.com/api/donations/expire \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## Project Summary Card
*(For display at expo booth)*

| | |
|---|---|
| **Project Name** | FoodBridge |
| **Tagline** | Saving Food, Serving Lives |
| **Version** | v3.0 (Phase 1 + Phase 2 + Phase 3 + Phase 4 Complete) |
| **Category** | Social Impact / GreenTech / FoodTech |
| **Primary SDGs** | SDG 2 (Zero Hunger) + SDG 12 (Responsible Consumption) |
| **Tech Stack** | Next.js 15, TypeScript, MongoDB, Leaflet, JWT, Resend, SSE, Vercel Cron |
| **Target Users** | Food donors · Food distributors (NGOs/food banks) · Platform admins |
| **Core Problem** | Food waste + hunger coexist due to lack of real-time redistribution infrastructure |
| **Core Solution** | Role-based platform connecting food surplus to food need via map, smart matching, notifications, and community trust |
| **Repository** | https://github.com/Vasugoli/FoodBridge |

---

*Documentation updated for project expo — FoodBridge v3.0 (Phase 1 + Phase 2 + Phase 3 + Phase 4 Complete)*
