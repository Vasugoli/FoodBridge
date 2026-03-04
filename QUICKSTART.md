# FoodBridge - Quick Start Guide

## 🚀 Phase 1 Implementation Complete!

All critical security and stability improvements have been implemented. Follow this guide to get started.

---

## Prerequisites

- Node.js 18+ installed
- MongoDB installed and running (or MongoDB Atlas account)
- Terminal/Command prompt

---

## Quick Setup (5 minutes)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

The `.env.local` file is already configured with a secure JWT secret. If you need to customize:

```bash
# View current configuration
cat .env.local

# Optional: Add email service (Resend)
# Uncomment and add your API key in .env.local
```

### 3. Start MongoDB

**Option A: Local MongoDB**
```bash
mongod
# Or on Mac: brew services start mongodb-community
```

**Option B: MongoDB Atlas**
- Create a free cluster at mongodb.com
- Update MONGODB_URI in .env.local with your connection string

### 4. Create Database Indexes

```bash
npm run db:indexes
```

You should see:
```
✅ Users indexes created
✅ Donations indexes created
✅ Email verifications indexes created
✨ All indexes created successfully!
```

### 5. Start Development Server

```bash
npm run dev
```

Visit: **http://localhost:9002**

---

## ✅ Test the Implementation

### Test 1: Strong Password Validation

1. Go to `/signup`
2. Try a weak password like "password123"
3. Should see error: "Password must contain at least one special character"
4. Try: `MySecureP@ss123`
5. Should work! ✅

### Test 2: Email Verification

1. Create a new account
2. Check terminal/console for verification link
3. Click the link or copy to browser
4. Should see success message ✅

### Test 3: Rate Limiting

1. Try to signup 4 times rapidly with different emails
2. 4th attempt should show: "Too many signup attempts"
3. Wait an hour or restart server to reset ✅

### Test 4: Create Donation (As Donor)

1. Login with a donor account
2. Go to "New Donation"
3. Fill form and submit
4. Check console for confirmation email
5. Should see success message ✅

### Test 5: Claim Donation (As Distributor)

1. Login with a distributor account
2. View available donations on map
3. Claim a donation
4. Check console for notification emails (to both donor & distributor) ✅

### Test 6: Pagination

Visit in browser or Postman:
```
http://localhost:9002/api/donations/paginated?page=1&limit=10
```

Should see:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## 🎯 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:indexes` | Create database indexes |
| `npm run db:show-indexes` | Show current indexes |
| `npm run db:backup` | Backup database |
| `npm run db:restore <file>` | Restore from backup |

---

## 📊 Demo Accounts

Create test accounts with these roles:

**Donor Account:**
- Email: donor@test.com
- Password: DonorSecure@123
- Role: Donor

**Distributor Account:**
- Email: dist@test.com
- Password: DistSecure@123
- Role: Distributor

**Admin Account:**
- Email: admin@test.com
- Password: AdminSecure@123
- Role: Admin

---

## 🎬 Demo Flow for Judges

### 1. Show Security Features (2 minutes)

**Password Strength:**
- Try weak password → Shows validation error
- Use strong password → Account created

**Rate Limiting:**
- Make multiple rapid requests → Gets rate limited
- Show "Too many attempts" message

**Email Verification:**
- Show verification email in console
- Click link → Email verified successfully

### 2. Show Core Functionality (3 minutes)

**As Donor:**
- Login as donor
- Create new donation with location
- Show it appears on map

**As Distributor:**
- Login as distributor
- View donations on interactive map
- Claim a donation
- Show confirmation emails (console)

**As Admin:**
- Login as admin
- View all users
- View all donations
- Show statistics dashboard

### 3. Show Technical Excellence (2 minutes)

**Database Optimization:**
```bash
npm run db:show-indexes
```
- Show all optimized indexes
- Explain geospatial indexing for maps

**Pagination:**
- Open DevTools Network tab
- Load donations page
- Show paginated API response
- Explain performance benefits

**Logging & Monitoring:**
- Show structured logs in console
- Demonstrate audit logs for security events

**Backup System:**
```bash
npm run db:backup
```
- Create a backup
- Show compressed backup file
- Explain disaster recovery

---

## 🔒 Security Highlights

✅ **Authentication:**
- Mandatory 32+ character JWT secret
- Strong password requirements
- Email verification system
- Session management

✅ **Input Validation:**
- Zod schema validation
- XSS prevention (DOMPurify)
- SQL/NoSQL injection prevention

✅ **Rate Limiting:**
- Per-user and per-IP limits
- Redis-backed (production)
- Protects against DoS attacks

✅ **Audit Logging:**
- All security events logged
- User actions tracked
- Compliance-ready

---

## 📈 Performance Highlights

✅ **Database:**
- 15+ optimized indexes
- Geospatial indexing
- Full-text search
- Compound indexes

✅ **Pagination:**
- Page-based pagination
- Cursor-based for infinite scroll
- Limits loading to 20-100 items max

✅ **Caching Strategy:**
- Rate limit counters cached
- Ready for Redis integration

---

## 🐛 Troubleshooting

**MongoDB connection error:**
```bash
# Start MongoDB locally
mongod

# Or update MONGODB_URI in .env.local for Atlas
```

**JWT_SECRET error:**
```bash
# Verify .env.local has JWT_SECRET
# Should be 32+ characters
```

**Port 9002 in use:**
```bash
# Change port in package.json
"dev": "next dev --turbopack -p 9003"
```

---

## 📞 Quick Help

**Check if MongoDB is running:**
```bash
mongo --eval "db.version()"
```

**Check all environment variables:**
```bash
cat .env.local
```

**Verify Node version:**
```bash
node --version  # Should be 18+
```

**Clear and reinstall:**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 🎉 You're All Set!

The platform is now running with:
- ✅ Enterprise-grade security
- ✅ Optimized database performance
- ✅ Email notifications
- ✅ Audit logging
- ✅ Disaster recovery

**Ready to impress the judges!** 🏆

For detailed technical documentation, see:
- `PHASE1_IMPLEMENTATION.md` - Complete implementation details
- `AUTHENTICATION.md` - Authentication system
- `MONGODB_INTEGRATION.md` - Database integration

---

**Questions?** Check the logs in the terminal - they're detailed and helpful!
