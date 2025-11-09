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
    'localStorage',
    'sessionStorage',
  ];

  const warnings = new Set<string>();

  webAPIs.forEach(api => {
    Object.defineProperty(globalThis, api, {
      get() {
        // Check stack trace to filter out React DevTools
        const stack = new Error().stack || '';
        const isReactDevTools = stack.includes('__REACT_DEVTOOLS') ||
                                 stack.includes('react-devtools') ||
                                 stack.includes('installHook');

        if (!isReactDevTools) {
          const warning = `⚠️ PLATFORM ERROR: Attempted to access web API '${api}' in React Native!`;
          if (!warnings.has(warning)) {
            console.error(warning);
            console.error('Stack trace:', stack);
            warnings.add(warning);
          }
        }
        return undefined;
      },
      configurable: true,
    });
  });

  console.log('🛡️ Platform guards enabled - web APIs blocked');
}

export {};
