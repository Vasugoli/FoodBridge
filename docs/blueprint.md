# **App Name**: FoodBridge

## Core Features:

- User Authentication: Secure authentication using NextAuth.js with credentials and optional Google OAuth.
- Donation Management: Allow donors to add, edit, and delete donation posts with details like title, description, quantity, expiry, location, and image.
- Donation Discovery: Enable distributors to view nearby donations using Leaflet.js and OpenStreetMap for a map view.
- Claim & Pickup Tracking: Distributors can claim donations, mark them as completed, and donors receive notifications in real-time.
- Admin Dashboard: Provide an admin interface to manage users, donations, and statistics, visualizing data with Recharts or Chart.js.
- Real-time notifications: Send out real-time notifications to relevant parties when events like claim requests, expirations, etc.

## Style Guidelines:

- Primary color: Soft Green (#90EE90) to evoke nature, freshness, and health.
- Background color: Light gray (#F0F0F0), subtly desaturated for a clean and unobtrusive backdrop.
- Accent color: Light Blue (#ADD8E6) as analogous to green, providing a calm but distinct contrast.
- Body and headline font: 'PT Sans' (sans-serif) for a modern yet accessible feel.
- Use consistent, clean icons from a free library (e.g., FontAwesome) for clarity.
- Modern SaaS dashboard layout with separate layouts for donors, distributors and admin.
- Subtle animations for state changes and transitions to improve UX, avoiding excessive animations.