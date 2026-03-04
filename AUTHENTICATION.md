# Authentication Implementation Guide

This document describes the authentication system implemented in FoodBridge.

## Overview

FoodBridge uses a JWT-based authentication system with secure password hashing and session management.

## Architecture

### Components

1. **Authentication Library** (`src/lib/auth.ts`)
   - JWT token encryption/decryption
   - Session creation and management
   - Cookie-based session storage

2. **Database Functions** (`src/lib/db.ts`)
   - User creation with password hashing
   - User authentication with password verification
   - User retrieval functions

3. **API Routes** (`src/app/api/auth/`)
   - `signup/route.ts` - User registration
   - `login/route.ts` - User authentication
   - `logout/route.ts` - Session termination
   - `session/route.ts` - Current session retrieval

4. **UI Pages**
   - `src/app/signup/page.tsx` - Registration form
   - `src/app/login/page.tsx` - Login form

5. **Protected Routes**
   - `src/app/dashboard/layout.tsx` - Checks authentication
   - All dashboard pages require authentication

## Security Features

### Password Security
- Passwords are hashed using **bcryptjs** with 10 salt rounds
- Passwords are never stored in plain text
- Password hashes are never sent to the client

### Session Security
- Sessions use **JWT (JSON Web Tokens)** with HS256 algorithm
- Tokens expire after 7 days
- Tokens are stored in HTTP-only cookies
- Cookies use `sameSite: 'lax'` for CSRF protection
- Secure flag enabled in production

### Input Validation
- Email format validation
- Password minimum length (6 characters)
- Role validation (donor, distributor, admin)
- All fields required

## User Flow

### Sign Up
1. User fills signup form with name, email, password, role
2. Form data sent to `POST /api/auth/signup`
3. Server validates input
4. Password is hashed with bcrypt
5. User record created in MongoDB
6. JWT session created and stored in cookie
7. User redirected to dashboard

### Login
1. User fills login form with email and password
2. Form data sent to `POST /api/auth/login`
3. Server finds user by email
4. Password verified against stored hash
5. JWT session created and stored in cookie
6. User redirected to dashboard

### Protected Pages
1. Server checks for session cookie
2. JWT token decrypted and validated
3. User data fetched from MongoDB
4. If valid: page renders
5. If invalid: redirect to login

### Logout
1. User clicks logout button
2. Request sent to `POST /api/auth/logout`
3. Session cookie deleted
4. User redirected to login page

## Database Schema

### User Collection

```typescript
interface User {
  id: string;              // Generated: user-{timestamp}-{random}
  name: string;            // Full name
  email: string;           // Unique email address
  role: UserRole;          // 'donor' | 'distributor' | 'admin'
  avatarUrl: string;       // Auto-generated from dicebear
  createdAt: Date;         // Account creation date
  passwordHash?: string;   // Bcrypt hash (not sent to client)
}
```

### Session Token Payload

```typescript
interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
}
```

## Environment Variables

Required in `.env.local`:

```bash
# MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/foodbridge

# JWT secret key (must be secure in production!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
```

## API Reference

### POST /api/auth/signup

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123",
  "role": "donor"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "user-1234567890-abc123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "donor",
    "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=john@example.com"
  }
}
```

**Error Responses:**
- 400: Missing or invalid fields
- 409: Email already exists
- 500: Server error

### POST /api/auth/login

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "user-1234567890-abc123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "donor",
    "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=john@example.com"
  }
}
```

**Error Responses:**
- 400: Missing fields
- 401: Invalid credentials
- 500: Server error

### POST /api/auth/logout

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### GET /api/auth/session

**Success Response (200):**
```json
{
  "user": {
    "id": "user-1234567890-abc123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "donor",
    "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=john@example.com"
  }
}
```

**Error Response (401):**
```json
{
  "error": "Not authenticated"
}
```

## Testing the Authentication

### 1. Start MongoDB
```bash
mongod
```

### 2. Start the application
```bash
npm run dev
```

### 3. Create a test account
Navigate to `http://localhost:9002/signup` and create an account.

### 4. Test login
Go to `http://localhost:9002/login` and sign in with your credentials.

### 5. Access protected routes
Visit `http://localhost:9002/dashboard` - you should see your role-specific dashboard.

### 6. Test logout
Click your avatar and select "Log out" - you should be redirected to login.

## Production Considerations

### Security Checklist
- [ ] Change `JWT_SECRET` to a strong random string (min 32 chars)
- [ ] Use environment-specific secrets (never commit to git)
- [ ] Enable HTTPS in production
- [ ] Set `secure: true` for cookies in production
- [ ] Implement rate limiting on auth endpoints
- [ ] Add password strength requirements
- [ ] Implement password reset functionality
- [ ] Add email verification
- [ ] Enable 2FA (optional)

### Performance
- MongoDB indexes on `email` field for faster lookups
- Session tokens cached to reduce DB queries
- Consider Redis for session storage at scale

### Monitoring
- Log failed login attempts
- Monitor token expiration patterns
- Track signup/login metrics
- Alert on suspicious activity

## Future Enhancements

- **OAuth Integration**: Google, GitHub sign-in
- **Password Reset**: Email-based password recovery
- **Email Verification**: Verify email addresses on signup
- **Two-Factor Authentication**: Optional 2FA for enhanced security
- **Session Management**: View and revoke active sessions
- **Password Policies**: Enforce stronger password requirements
- **Account Deletion**: Allow users to delete their accounts
- **Profile Updates**: Change email, password, name

## Troubleshooting

### "Invalid email or password"
- Verify the email and password are correct
- Check that the user exists in the database
- Ensure MongoDB is running

### Redirected to login on dashboard
- Check that you're logged in
- Verify JWT_SECRET is set in .env.local
- Check browser cookies are enabled

### "User with this email already exists"
- The email is already registered
- Try logging in instead
- Use a different email address

### Session expires too quickly
- Default expiration is 7 days
- Check your computer's clock is accurate
- Modify expiration time in `src/lib/auth.ts`

## File Reference

### Core Files
- `src/lib/auth.ts` - Authentication utilities
- `src/lib/db.ts` - Database functions
- `src/lib/types.ts` - TypeScript types
- `src/app/api/auth/signup/route.ts` - Signup endpoint
- `src/app/api/auth/login/route.ts` - Login endpoint
- `src/app/api/auth/logout/route.ts` - Logout endpoint
- `src/app/api/auth/session/route.ts` - Session endpoint
- `src/app/signup/page.tsx` - Signup UI
- `src/app/login/page.tsx` - Login UI
- `src/app/dashboard/layout.tsx` - Protected layout
- `src/components/layout/dashboard-header.tsx` - Header with logout

### Dependencies
- `bcryptjs` - Password hashing
- `jose` - JWT token management
- `@types/bcryptjs` - TypeScript types for bcrypt
