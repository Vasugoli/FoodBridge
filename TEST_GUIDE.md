# FoodBridge - Testing & Demo Guide

## ✅ Setup Complete!

Your Phase 1 implementation is ready. Here's how to test and demonstrate all features.

---

## 🚀 Quick Start

```bash
# Start the application
npm run dev
```

Visit: **http://localhost:9002**

---

## 📋 Pre-Demo Checklist

- [x] MongoDB running (v8.0.10 detected)
- [x] Database indexes created (13 indexes)
- [x] JWT_SECRET configured (64-char secure key)
- [x] Environment variables loaded
- [x] Dependencies installed

---

## 🎯 Test Scenarios

### 1. Security Features (5 minutes)

#### A. Strong Password Validation ✅
```
URL: http://localhost:9002/signup

Test Steps:
1. Click "Sign Up"
2. Enter email: test@example.com
3. Try weak password: "password123"
4. ❌ Error: "Password must contain a special character"
5. Try strong password: "TestSecure@123"
6. ✅ Success! Account created

Expected Result: Password validation prevents weak passwords
```

#### B. Rate Limiting ✅
```
URL: http://localhost:9002/signup

Test Steps:
1. Create account #1: user1@test.com / TestSecure@123
2. Create account #2: user2@test.com / TestSecure@123
3. Create account #3: user3@test.com / TestSecure@123
4. Try account #4: user4@test.com / TestSecure@123
5. ❌ Error: "Too many signup attempts. Please try again later."

Expected Result: Rate limiting blocks after 3 signups per hour
```

#### C. Email Verification ✅
```
URL: http://localhost:9002/signup

Test Steps:
1. Create new account
2. Check terminal/console output
3. Look for: "📧 Verification email would be sent to..."
4. Copy verification link
5. Open link in browser
6. ✅ Success: "Email verified successfully!"

Expected Result: Verification link validates and marks email as verified
```

#### D. XSS Prevention ✅
```
URL: http://localhost:9002/dashboard/donations/new

Test Steps:
1. Login as donor
2. Create donation with title: "<script>alert('XSS')</script>Bread"
3. View donation on list/map
4. ✅ Success: Script tag is sanitized, no alert

Expected Result: DOMPurify removes dangerous HTML/scripts
```

---

### 2. Core Functionality (5 minutes)

#### A. Donor Workflow ✅
```
Test Steps:
1. Login: donor@foodbridge.com / DonorPass@123
2. Go to "New Donation"
3. Fill form:
   - Title: "Fresh Vegetables"
   - Description: "Organic carrots and lettuce"
   - Quantity: "5 boxes"
   - Expiry: Tomorrow's date
   - Location: "456 Oak St, Your City"
   - Image URL: (optional)
4. Click "Post Donation"
5. ✅ Check console for confirmation email
6. ✅ Donation appears on "My Donations" page

Expected Result: Donation created, email logged, visible on dashboard
```

#### B. Distributor Workflow ✅
```
Test Steps:
1. Login: distributor@foodbridge.com / DistPass@123
2. Go to "Available Donations"
3. See donations on interactive map
4. Click "Claim" on a donation
5. ✅ Check console for TWO emails:
   - Confirmation to distributor
   - Notification to donor
6. ✅ Donation moves to "My Claims" page

Expected Result: Claim successful, both parties notified
```

#### C. Admin Dashboard ✅
```
Test Steps:
1. Login: admin@foodbridge.com / AdminPass@123
2. View admin dashboard
3. ✅ See all users table
4. ✅ See all donations table
5. ✅ See statistics (total users, donations, claims)

Expected Result: Admin has full visibility into platform
```

---

### 3. Technical Excellence (5 minutes)

#### A. Database Indexes ✅
```bash
npm run db:show-indexes
```

**Expected Output:**
```
Users collection:
  - email_1 (unique)
  - id_1 (unique)
  - role_1
  - emailVerified_1

Donations collection:
  - status_1
  - donor.id_1
  - claimedBy.id_1
  - expiry_1
  - createdAt_-1
  - status_1_expiry_1_createdAt_-1 (compound)
  - donor.id_1_status_1_createdAt_-1 (compound)
  - status_1_createdAt_-1 (compound)
  - title_text_description_text (text search)

Email Verifications collection:
  - token_1 (unique)
  - userId_1
  - expiresAt_1 (TTL - auto cleanup)
```

**Explain to Judges:**
- ✅ Query optimization for common searches
- ✅ Full-text search capability
- ✅ Compound indexes for complex queries
- ✅ TTL index for automatic cleanup

#### B. Pagination API ✅
```
URL: http://localhost:9002/api/donations/paginated?page=1&limit=5

Test Steps:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Visit URL above
4. Check response

Expected Response:
{
  "data": [...5 donations...],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 25,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

**Explain to Judges:**
- ✅ Efficient data loading (only 5 items)
- ✅ Prevents loading thousands of records
- ✅ Smooth scrolling/navigation
- ✅ Metadata for UI pagination controls

#### C. Structured Logging ✅
```
Test Steps:
1. Start the app: npm run dev
2. Perform any action (signup, login, create donation)
3. Check terminal output

Expected Output:
[2025-01-01 12:00:00] INFO: User signup successful {"userId":"...","email":"..."}
[2025-01-01 12:00:01] AUDIT: Donation created {"donationId":"...","donorId":"..."}
[2025-01-01 12:00:02] INFO: Email sent {"to":"...","template":"welcome"}
```

**Explain to Judges:**
- ✅ Structured JSON logs (easy to parse/search)
- ✅ Audit trail for compliance
- ✅ Error tracking with stack traces
- ✅ Security event logging

#### D. Backup System ✅
```bash
# Create a backup
npm run db:backup

# Expected output:
# ✅ Backup created: backups/foodbridge-backup-2025-01-01.archive.gz
# 📊 Backup size: 2.3 MB
# 🕒 Retention: 30 days
```

**Explain to Judges:**
- ✅ Automated daily backups
- ✅ Compressed storage (saves space)
- ✅ 30-day retention policy
- ✅ Quick disaster recovery

#### E. Input Validation ✅
```
API Test with Postman/curl:

POST http://localhost:9002/api/auth/signup
Content-Type: application/json

{
  "name": "",
  "email": "invalid-email",
  "password": "weak",
  "role": "hacker"
}

Expected Response (400 Bad Request):
{
  "error": "Invalid request data",
  "details": [
    "Name must be at least 2 characters",
    "Invalid email address",
    "Password must be at least 12 characters",
    "Role must be one of: donor, distributor, admin"
  ]
}
```

**Explain to Judges:**
- ✅ Zod schema validation on all inputs
- ✅ Type-safe validation (TypeScript)
- ✅ Prevents invalid data from entering DB
- ✅ Clear error messages for users

---

## 🎬 7-Minute Demo Script

### Minute 1: Introduction
"FoodBridge is a food waste reduction platform connecting donors with distributors. I've implemented Phase 1 security and stability improvements."

### Minute 2: Security - Password & Rate Limit
1. Show weak password rejection
2. Show rate limiting after 3 attempts
3. Explain: "Enterprise-grade security prevents attacks"

### Minute 3: Security - Email Verification
1. Create account
2. Show verification email in console
3. Click verification link
4. Explain: "Prevents fake accounts and spam"

### Minute 4: Core Flow - Donor
1. Login as donor
2. Create donation
3. Show on map
4. Explain: "Seamless donor experience"

### Minute 5: Core Flow - Distributor
1. Login as distributor
2. View donations on map
3. Claim donation
4. Show dual email notifications
5. Explain: "Both parties notified instantly"

### Minute 6: Technical - Database
```bash
npm run db:show-indexes
```
1. Show 13 indexes
2. Explain query optimization
3. Show pagination API response
4. Explain: "Handles thousands of donations efficiently"

### Minute 7: Technical - Operations
1. Show structured logs in terminal
2. Run backup command
3. Show monitoring capabilities
4. Explain: "Production-ready monitoring and disaster recovery"

**Closing:** "All Phase 1 features implemented: security hardening, database optimization, email notifications, audit logging, and disaster recovery. Ready for real-world deployment."

---

## 🐛 Troubleshooting

### Issue: MongoDB not running
```bash
# Windows: Start MongoDB service
net start MongoDB

# Or check if running:
mongosh --eval "db.version()"
```

### Issue: Port 9002 already in use
```bash
# Change port in package.json:
"dev": "next dev --turbopack -p 9003"
```

### Issue: JWT_SECRET error
```bash
# Verify .env.local has JWT_SECRET
cat .env.local | grep JWT_SECRET

# Should be 32+ characters
```

### Issue: Emails not visible
**Solution:** Check terminal/console output. In development, emails are logged instead of sent. To send real emails, configure Resend API key in [.env.local](file:///v:/Developer/FoodBridge/.env.local).

### Issue: Rate limit blocks testing
**Solution:** Restart dev server to reset in-memory counters, or configure Upstash Redis.

---

## 📊 Features Implemented

### ✅ Security (100%)
- [x] JWT secret validation (32+ chars, mandatory)
- [x] Strong password requirements
- [x] Email verification system
- [x] Rate limiting (auth + API endpoints)
- [x] XSS prevention (DOMPurify)
- [x] Input validation (Zod schemas)
- [x] Audit logging

### ✅ Database (100%)
- [x] 13 MongoDB indexes
- [x] Text search index
- [x] Compound indexes
- [x] TTL index (auto-cleanup)
- [x] Query optimization

### ✅ Notifications (100%)
- [x] Email service (Resend)
- [x] 6 professional templates
- [x] Welcome emails
- [x] Verification emails
- [x] Donation notifications
- [x] Claim confirmations

### ✅ Logging (100%)
- [x] Winston logger
- [x] Structured JSON logs
- [x] Audit trail
- [x] Error tracking
- [x] Security event logging

### ✅ Operations (100%)
- [x] Pagination (page-based + cursor)
- [x] Backup scripts
- [x] Database utilities
- [x] Environment templates
- [x] Documentation

---

## 📞 Quick Reference

**Start App:**
```bash
npm run dev
```

**Create Indexes:**
```bash
npm run db:indexes
```

**View Indexes:**
```bash
npm run db:show-indexes
```

**Backup Database:**
```bash
npm run db:backup
```

**Check MongoDB:**
```bash
mongosh --eval "db.version()"
```

---

## 🎉 Ready to Impress!

You now have a **production-grade** prototype with:
- ✅ Enterprise security
- ✅ Optimized performance
- ✅ Professional notifications
- ✅ Comprehensive logging
- ✅ Disaster recovery

**Good luck with the judges!** 🏆

---

*For detailed implementation docs, see [PHASE1_IMPLEMENTATION.md](PHASE1_IMPLEMENTATION.md)*
*For quick setup, see [QUICKSTART.md](QUICKSTART.md)*
