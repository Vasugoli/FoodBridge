# FoodBridge

FoodBridge is a Next.js application that connects food donators with distributors to reduce waste and help communities.

This repository is scaffolded from a Next starter and includes UI components, a simple demo dashboard for different user roles.

## Quick facts

- Framework: Next.js 15 (App Router)
- React: 18
- Styling: Tailwind CSS
- Languages: TypeScript
- Dev port (default in package.json): 9002

## What you'll find here

- `src/app` — application routes and pages (App Router)
- `src/components` — UI components and shared layout
- `src/hooks`, `src/lib` — helpers, placeholder data, and types

## Prerequisites

- Node.js 18+ (v22.x is shown in this project)
- npm (or yarn/pnpm)

## Local development — run the app

1. Install dependencies

```bash
npm install
```

1. Start the dev server

```bash
npm run dev
```

The app will run on `http://localhost:9002` by default (see `package.json` script).

1. Visit common pages

- Home: `/`
- Dashboard (role demo): `/dashboard` or `/dashboard?role=admin` or `/dashboard?role=distributor`

## Build and start (production)

```bash
npm run build
npm start
```

## MongoDB Setup

This app uses **MongoDB** as its database for users and donations.

### MongoDB Prerequisites

You need a MongoDB instance running. Choose one:

#### Option 1: MongoDB Atlas (Cloud - Recommended for production)

1. Create a free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster and get your connection string
3. Add your connection string to `.env.local`

#### Option 2: Local MongoDB (Development)

1. Install MongoDB locally: [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Start MongoDB: `mongod` (or `brew services start mongodb-community` on Mac)
3. Use the local connection string in `.env.local`

### Configuration

1. Create a `.env.local` file in the project root (already created with default):

```bash
MONGODB_URI=mongodb://localhost:27017/foodbridge
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
```

For MongoDB Atlas, replace with your connection string:

```bash
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/foodbridge
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
```

**Important**: Change the `JWT_SECRET` to a secure random string in production!

2. Start the development server:

```bash
npm run dev
```

## Authentication

FoodBridge now includes a complete authentication system with user signup and login.

### How to Use

1. **Sign Up**: Navigate to `/signup` to create a new account
   - Enter your name, email, password (min 6 characters)
   - Select your role: Donor or Distributor
   - Click "Create Account"

2. **Login**: Navigate to `/login` to sign in
   - Enter your email and password
   - Click "Sign In"

3. **Dashboard**: After login, you'll be redirected to `/dashboard`
   - Your dashboard view depends on your role (Donor, Distributor, or Admin)

4. **Logout**: Click your avatar in the top-right corner and select "Log out"

### Authentication Features

- **Secure Password Hashing**: Passwords are hashed using bcrypt
- **JWT Sessions**: Session management using JSON Web Tokens
- **Protected Routes**: Dashboard pages require authentication
- **Role-Based Access**: Different dashboard views for each user role

### API Routes

Authentication endpoints are available at:

- `POST /api/auth/signup` - Create a new user account
- `POST /api/auth/login` - Authenticate a user
- `POST /api/auth/logout` - End user session
- `GET /api/auth/session` - Get current user session

### Seed Database (Optional)

To populate the database with sample donations for testing:

```bash
curl -X POST http://localhost:9002/api/seed
```

**Note**: This only seeds donation data. Users are now created through the signup process.

### Database Structure

- **Database name**: `foodbridge`
- **Collections**:
  - `users` - User accounts (donors, distributors, admins)
  - `donations` - Food donation listings

### Database Helper Functions

Located in `src/lib/db.ts`:

- `getUsersFromDb()` - Fetch all users
- `getDonationsFromDb()` - Fetch all donations
- `seedSampleData()` - Seed database with mock data

MongoDB client singleton is in `src/lib/mongodb.ts`.

## Troubleshooting

- Hydration warning on dev overlay / head:
  - The project suppresses hydration warnings on the `<head>` and `<body>` in `src/app/layout.tsx` to avoid dev-overlay injection mismatches. If you see hydration errors, try disabling browser extensions and restart the dev server.

- Runtime error: `searchParams.role` used synchronously
  - Ensure page components that use `searchParams` are `async` and `await searchParams` (see `src/app/dashboard/page.tsx`).

- Audit / dependency warnings
  - You may see deprecation or vulnerability warnings from npm (transitive deps like `inflight`, `rimraf`, `glob`). Run:

```bash
npm audit
npm audit fix
```

If issues remain that require breaking upgrades, review `npm outdated` and update the top-level packages carefully.

## Tests / Typecheck / Lint

```bash
npm run typecheck
npm run lint
```

## Useful commands

- Install deps: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build`
- Start: `npm start`
- GenKit dev: `npm run genkit:dev`

## Next steps and notes

If you'd like, I can:

- Remove unused deps like `firebase` and `@genkit-ai/*` packages and run `npm install` to update the lockfile.
- Add a small README under `src/ai/` describing how to run GenKit flows.

If you want me to apply either change, tell me which and I'll update the repository and run a quick validation (typecheck / dev start) for you.

---
Generated guide — FoodBridge
