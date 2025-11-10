# Database Management Scripts

This guide covers all database cleanup and management scripts available in the MIT Dry Logs App.

---

## 🗑️ Delete All Photos

**Script:** `deleteAllPhotos.ts`

**Purpose:** Permanently deletes ALL photos from both Firestore and Firebase Storage.

### What it does:
1. **Firestore Collection (`photos`)** - Deletes all photo metadata documents
2. **Firebase Storage (`photos/` folder)** - Deletes all uploaded photo files

### How to run:

```bash
cd mit-dry-logs-app
npm run delete-photos
```

### Output:
```
🗑️  DELETE ALL PHOTOS SCRIPT
============================================================
⚠️  WARNING: This will permanently delete ALL photos!
============================================================

📊 PART 1: Scanning Firestore for photo metadata...
   Found 45 photo document(s) in Firestore

🗑️  Deleting Firestore photo metadata...
   ✓ Deleted 10/45 documents...
   ✓ Deleted 20/45 documents...
   ✓ Deleted 30/45 documents...
   ✓ Deleted 40/45 documents...

✅ Firestore cleanup complete: 45/45 documents deleted

============================================================
📊 PART 2: Scanning Firebase Storage for photo files...
   Found 45 photo file(s) in Firebase Storage

🗑️  Deleting Firebase Storage files...
   ✓ Deleted 10/45 files...
   ✓ Deleted 20/45 files...
   ✓ Deleted 30/45 files...
   ✓ Deleted 40/45 files...

✅ Storage cleanup complete: 45/45 files deleted

============================================================

📋 DELETION SUMMARY:
============================================================

📊 Firestore Photos Collection:
   - Found: 45 documents
   - Deleted: 45 documents

📁 Firebase Storage (photos/):
   - Found: 45 files
   - Deleted: 45 files

✅ No errors encountered

🎉 TOTAL DELETED: 90 items

✅ Photo deletion complete!
```

---

## 🧹 Cleanup Duplicate Jobs

**Script:** `cleanupJobs.ts`

**Purpose:** Removes duplicate job entries from Firestore.

### What it does:
- Scans all jobs in the `jobs` collection
- Identifies duplicates by customer name
- Keeps the first occurrence of each customer's job
- Deletes all duplicate entries

### How to run:

```bash
cd mit-dry-logs-app
npm run cleanup
```

---

## 🔧 Fix Job Assignments

**Script:** `fixJobAssignments.ts`

**Purpose:** Corrects job assignments to proper user IDs.

### What it does:
- Updates job assignments to match actual user accounts
- Ensures techs can see their assigned jobs

### How to run:

```bash
cd mit-dry-logs-app
npm run fix-assignments
```

---

## 🌱 Seed Database with Sample Data

**Script:** `seedData.ts` or `runProperSeed.ts`

**Purpose:** Populates the database with demo/test data.

### How to run:

**Option 1: Basic seed**
```bash
npm run seed
```

**Option 2: Comprehensive seed** (recommended)
```bash
npm run seed:proper
```

---

## ⚠️ Important Notes

### Before Running Photo Deletion:

1. **Backup your data** - This operation is irreversible
2. **Verify you're connected to the correct Firebase project** - Check `.env` file
3. **Close the app** - Stop the dev server before running scripts
4. **The script deletes EVERYTHING** - All photos from all jobs will be removed

### What Gets Deleted:

- ✅ All documents in Firestore `photos` collection
- ✅ All files in Firebase Storage `photos/` folder
- ✅ Photos from ALL jobs (including live jobs, not just test jobs)

### What Does NOT Get Deleted:

- ❌ Job data (remains intact)
- ❌ User accounts
- ❌ Workflow data stored in jobs
- ❌ Other Firestore collections

---

## 🔐 Environment Setup

All scripts require a valid `.env` file with Firebase credentials:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

Make sure your `.env` file is located at: `mit-dry-logs-app/.env`

---

## 📊 Script Comparison

| Script | Deletes Jobs | Deletes Photos | Adds Data | Fixes Data |
|--------|--------------|----------------|-----------|------------|
| `delete-photos` | ❌ | ✅ All | ❌ | ❌ |
| `cleanup` | ✅ Duplicates | ❌ | ❌ | ❌ |
| `fix-assignments` | ❌ | ❌ | ❌ | ✅ |
| `seed` | ❌ | ❌ | ✅ | ❌ |

---

## 🚨 Common Issues

### "Missing Firebase environment variables"
- Check that `.env` file exists in `mit-dry-logs-app/` directory
- Verify all required variables are set

### "Permission denied" errors
- Ensure your Firebase rules allow deletion
- Check that you're using the correct Firebase project

### Script hangs or times out
- Check your internet connection
- Verify Firebase project is accessible
- Try running again (scripts are idempotent)

---

## 📝 Development Workflow

**After testing with photos:**

```bash
# 1. Delete all test photos
npm run delete-photos

# 2. Clean up duplicate jobs (if any)
npm run cleanup

# 3. (Optional) Re-seed with fresh data
npm run seed:proper
```

---

## 🔍 Verifying Deletion

### Check Firestore:
1. Go to Firebase Console
2. Navigate to Firestore Database
3. Look for `photos` collection
4. Should be empty or non-existent

### Check Storage:
1. Go to Firebase Console
2. Navigate to Storage
3. Look for `photos/` folder
4. Should be empty or non-existent

---

**Last Updated:** November 10, 2025
