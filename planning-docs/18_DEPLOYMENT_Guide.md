# MIT Dry Logs - Deployment Guide

## 🚀 Quick Start

The MIT Dry Logs app is production-ready and configured for Netlify deployment.

### Prerequisites

- Node.js 18+ installed
- Firebase project configured
- Git repository

## 📦 Local Setup

\`\`\`bash
cd mit-dry-logs-app
npm install
cp .env.example .env
# Edit .env with your Firebase credentials
npm run dev
\`\`\`

## 🔥 Firebase Configuration

Your Firebase project is already configured:
- Project ID: `drylogs-d85aa`
- Auth Domain: `drylogs-d85aa.firebaseapp.com`
- Storage Bucket: `drylogs-d85aa.firebasestorage.app`

### Required Firebase Services

Enable these services in Firebase Console:

1. **Authentication**
   - Go to Authentication → Sign-in method
   - Enable Email/Password provider
   - Create users manually or use seed script

2. **Firestore Database**
   - Go to Firestore Database → Create database
   - Start in **production mode** (we'll add security rules later)
   - Select region closest to users

3. **Storage**
   - Go to Storage → Get started
   - Start in **production mode**
   - This stores job photos

4. **Realtime Database**
   - Go to Realtime Database → Create database
   - Used for sync coordination

### Firestore Security Rules (IMPORTANT!)

Add these rules in Firestore → Rules:

\`\`\`
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }

    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() &&
                     (request.auth.uid == userId || getUserRole() == 'ADMIN');
    }

    // Jobs collection
    match /jobs/{jobId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated();
      allow delete: if getUserRole() in ['MIT_LEAD', 'ADMIN'];
    }
  }
}
\`\`\`

### Storage Security Rules

Add these rules in Storage → Rules:

\`\`\`
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /photos/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
\`\`\`

## 🌱 Seed Database with Demo Data

Run this AFTER enabling Authentication and Firestore:

\`\`\`bash
npm run seed
\`\`\`

This creates:
- 2 demo users (MIT Tech + MIT Lead)
- 10 sample jobs with realistic data

**Demo Credentials:**
- **MIT Tech**: `tech@demo.com` / `password123`
- **MIT Lead**: `lead@demo.com` / `password123`

**Note**: You must manually create these users in Firebase Authentication first, or the seed script will fail. The script only creates Firestore user documents.

### Manual User Creation

1. Go to Firebase Console → Authentication → Users
2. Add user: `tech@demo.com` / `password123` → Copy UID
3. Add user: `lead@demo.com` / `password123` → Copy UID
4. Edit `src/scripts/seedData.ts`:
   - Replace `uid: 'tech1'` with actual tech UID
   - Replace `uid: 'lead1'` with actual lead UID
5. Run `npm run seed`

## 🚀 Deploy to Netlify

### Option 1: Continuous Deployment (Recommended)

1. **Connect Repository**
   - Go to https://app.netlify.com
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub and select `Drylogs2` repository
   - Select branch: `main` (or your production branch)

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `mit-dry-logs-app/dist`
   - Base directory: `mit-dry-logs-app`

3. **Add Environment Variables**
   Go to Site Settings → Environment Variables → Add variables:
   \`\`\`
   VITE_FIREBASE_API_KEY=AIzaSyCzMoJlD51yI0hus1sYXaxDFrfW5yuMl-8
   VITE_FIREBASE_AUTH_DOMAIN=drylogs-d85aa.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=drylogs-d85aa
   VITE_FIREBASE_STORAGE_BUCKET=drylogs-d85aa.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=36939914635
   VITE_FIREBASE_APP_ID=1:36939914635:web:e20ac0a84e16eb5874e38e
   VITE_FIREBASE_MEASUREMENT_ID=G-TSMCKRE50V
   VITE_APP_ENV=production
   VITE_APP_NAME=MIT Dry Logs
   VITE_APP_VERSION=1.0.0
   VITE_USE_EMULATORS=false
   \`\`\`

4. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete (~2-3 minutes)
   - Your app will be live at `https://[random-name].netlify.app`

5. **Custom Domain (Optional)**
   - Go to Site Settings → Domain management
   - Add custom domain
   - Follow DNS configuration instructions

### Option 2: Manual Deployment

\`\`\`bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Build the app
cd mit-dry-logs-app
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=dist
\`\`\`

## 🔐 Production Security Checklist

Before going live:

- [ ] Firebase security rules configured (Firestore + Storage)
- [ ] Environment variables set in Netlify
- [ ] Demo users replaced with real technician accounts
- [ ] Firebase Authentication email verification enabled (optional)
- [ ] Custom domain configured with SSL
- [ ] Stripe production keys configured (when ready for payments)
- [ ] Firebase billing enabled (free tier has limits)

## 📱 PWA Installation

Once deployed:

1. Open app in mobile browser (iOS Safari or Android Chrome)
2. Tap "Add to Home Screen"
3. App installs like a native app
4. Offline functionality works automatically

## 🧪 Testing After Deployment

1. Visit your Netlify URL
2. Login with demo credentials
3. Navigate between Tech and Lead dashboards
4. Test offline mode (turn off network, navigate around)
5. Test on mobile device
6. Verify Firebase data is being read/written

## 📊 Monitoring

### Netlify Dashboard
- Deploy logs: Check for build errors
- Analytics: Page views, bandwidth usage
- Forms: Contact form submissions (if added)

### Firebase Console
- Authentication: Active users
- Firestore: Data usage and query performance
- Storage: Photo upload size
- Monitoring: Errors and performance

## 🆘 Troubleshooting

### Build Fails on Netlify

**Error**: "Module not found"
- **Solution**: Check `package.json` dependencies are installed
- Make sure base directory is set to `mit-dry-logs-app`

**Error**: "TypeScript errors"
- **Solution**: Run `npm run build` locally first to catch errors
- Fix TypeScript issues before pushing

### App Shows Blank Page

- **Solution**: Check browser console for errors
- Verify environment variables are set correctly
- Check Firebase configuration

### Authentication Not Working

- **Solution**: Verify Firebase Auth is enabled
- Check users exist in Firebase Authentication
- Verify Auth domain in environment variables

### Photos Not Uploading

- **Solution**: Enable Firebase Storage
- Check Storage security rules
- Verify storage bucket name in env variables

## 🔄 Updates and Maintenance

### Deploying Updates

With continuous deployment:
1. Commit and push to main branch
2. Netlify auto-deploys in ~2 minutes
3. No downtime!

### Manual Updates

\`\`\`bash
git pull origin main
cd mit-dry-logs-app
npm run build
netlify deploy --prod --dir=dist
\`\`\`

## 🎉 Success!

Your MIT Dry Logs app is now live! Share the URL with your team and start managing water damage restoration jobs efficiently.

**App URL**: `https://[your-site].netlify.app`

---

**Need help?** Check Firebase Console logs and Netlify deploy logs for detailed error messages.
