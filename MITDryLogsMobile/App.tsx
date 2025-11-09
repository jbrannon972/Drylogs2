import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useSyncStore } from './src/stores/syncStore';

// Enable platform guards in development to catch web API usage
import './src/utils/platformGuards';

export default function App() {
  useEffect(() => {
    // Initialize network listener for offline sync
    const unsubscribe = useSyncStore.getState().initializeNetworkListener();

    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <AppNavigator />
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
