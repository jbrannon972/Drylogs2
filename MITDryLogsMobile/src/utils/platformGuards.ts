/**
 * Platform Guards
 * Prevents web APIs from being used in React Native
 *
 * Import this file early in your app to catch web API usage
 */

// Block web-only globals in development
if (__DEV__) {
  const webAPIs = [
    'document',
    'window',
    'localStorage',
    'sessionStorage',
  ];

  const warnings = new Set<string>();

  webAPIs.forEach(api => {
    Object.defineProperty(globalThis, api, {
      get() {
        const warning = `⚠️ PLATFORM ERROR: Attempted to access web API '${api}' in React Native!`;
        if (!warnings.has(warning)) {
          console.error(warning);
          console.error('Stack trace:', new Error().stack);
          warnings.add(warning);
        }
        return undefined;
      },
      configurable: true,
    });
  });

  console.log('🛡️ Platform guards enabled - web APIs blocked');
}

export {};
