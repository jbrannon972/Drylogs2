# Testing Checklist - Platform Compatibility Fixes

## Critical Path Verification

### ✅ Phase 1: App Launch
```bash
cd MITDryLogsMobile
npm install  # Install new NetInfo dependency
npx expo start
```

**Expected Results:**
- ✅ No crash on startup
- ✅ Console log: "🛡️ Platform guards enabled"
- ✅ Console log: "📡 Initial network status: Online"
- ✅ No errors about "navigator is not defined"
- ✅ No errors about "expected boolean, got string"

**If it fails**: Check the error stack trace against `PLATFORM_FIXES.md`

---

### ✅ Phase 2: Network Detection

**Test Steps:**
1. App running in iOS Simulator
2. Toggle airplane mode: `Cmd+Shift+A` in simulator
3. Watch console logs

**Expected Results:**
```
📡 Network status: Offline
```

4. Toggle airplane mode off

**Expected Results:**
```
📡 Network status: Online
🔄 Network restored, pending sync items: 0
```

**Failure Mode**: If no logs appear, NetInfo listener not initialized

---

### ✅ Phase 3: Navigation

**Test Steps:**
1. App loads TechDashboard
2. Tap any status filter card (All Jobs, Install, etc.)
3. Tap a job card (even though no jobs loaded yet)
4. Tap workflow screen
5. Tap back button

**Expected Results:**
- ✅ All screens render without crash
- ✅ Navigation transitions smooth
- ✅ No console errors
- ✅ Orange header bar visible
- ✅ Back navigation works

**Known Issue**: Jobs won't load yet (Firebase not configured)

---

### ✅ Phase 4: Platform Guards (Development Only)

**Test Steps:**
```typescript
// Add this to TechDashboard.tsx temporarily
useEffect(() => {
  console.log(document); // Should trigger guard
  console.log(window);   // Should trigger guard
}, []);
```

**Expected Results:**
```
⚠️ PLATFORM ERROR: Attempted to access web API 'document' in React Native!
Stack trace: ...
⚠️ PLATFORM ERROR: Attempted to access web API 'window' in React Native!
Stack trace: ...
```

**Remove test code after verification**

---

## Stress Testing

### Network Chaos Test

**Test Steps:**
1. Start app with WiFi ON
2. Turn WiFi OFF
3. Turn airplane mode ON
4. Turn airplane mode OFF
5. Turn WiFi back ON
6. Switch between WiFi and Cellular (on device)

**Expected Results:**
- ✅ App never crashes
- ✅ Network status updates correctly
- ✅ Console shows all state changes
- ✅ No error dialogs

---

### Rapid Navigation Test

**Test Steps:**
1. Rapidly tap between screens
2. Tap back button repeatedly
3. Switch between status filters quickly
4. Spam tap job cards

**Expected Results:**
- ✅ No crashes
- ✅ No "expected boolean, got string" errors
- ✅ Navigation state remains consistent
- ✅ Memory usage stable

---

## Regression Prevention

### Code Review Checklist

Before merging any new code, verify:

- [ ] No `navigator.onLine` usage
- [ ] No `document.*` usage
- [ ] No `window.*` usage
- [ ] No `localStorage`/`sessionStorage`
- [ ] No `gap` property in StyleSheet
- [ ] All image operations use Expo APIs
- [ ] Network checks use NetInfo
- [ ] No web File/Blob/FileReader APIs

**How to check:**
```bash
# Search for web APIs
grep -r "navigator\\." src/
grep -r "document\\." src/
grep -r "window\\." src/
grep -r "localStorage" src/
grep -r "gap:" src/

# Should return NO results (except in comments)
```

---

## Production Readiness

### Before Deploying

- [ ] All tests in this checklist pass
- [ ] Platform guards don't fire unexpectedly
- [ ] Network detection works on device (not just simulator)
- [ ] App works offline (graceful degradation)
- [ ] Firebase configured and working
- [ ] Image upload tested
- [ ] No memory leaks during extended use

### Performance Benchmarks

**Startup Time:**
- Target: < 3 seconds to interactive
- Measure: Time from launch to TechDashboard render

**Memory Usage:**
- Target: < 150MB baseline
- Measure: After navigating all screens

**Network Listener:**
- Target: < 100ms to detect change
- Measure: Airplane mode toggle response

---

## Rollback Plan

If critical issues found after deployment:

1. **Immediate**: Revert to previous web-only version
2. **Investigation**: Check logs for web API access
3. **Fix**: Add missing platform guard
4. **Test**: Run full checklist again
5. **Deploy**: Push hotfix

---

## Success Criteria

✅ All phases pass without errors
✅ No web API console warnings
✅ Network detection accurate
✅ App usable offline
✅ No crashes during 10-minute stress test

When all criteria met: **System is bulletproof** 🛡️

---

## Notes

- Platform guards only active in development (`__DEV__`)
- Production builds won't show guard warnings
- NetInfo requires `npx expo install` for proper linking
- Test on both iOS Simulator and real device
- Cellular network testing requires physical device

---

## Emergency Contacts

If catastrophic failure:
1. Check `PLATFORM_FIXES.md` for root cause analysis
2. Review git history: `git log --oneline MITDryLogsMobile/`
3. Revert if needed: `git revert HEAD`
4. File issue with full error log and steps to reproduce
