import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useOfflineSync } from '../../hooks/useOfflineSync';
import { LogOut, User, WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { Button } from '../shared/Button';

export const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const { isOnline, isSyncing, pendingCount, syncNow } = useOfflineSync();

  return (
    <header className="bg-white shadow-md border-b border-gray-200">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="bg-entrusted-orange text-white px-3 py-2 rounded-lg">
            <h1 className="text-lg font-poppins font-bold">MIT Dry Logs</h1>
          </div>
          {!isOnline && (
            <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1 rounded-lg border border-yellow-200">
              <WifiOff className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-yellow-800 font-medium">Offline Mode</span>
            </div>
          )}
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-4">
          {/* Sync Status */}
          {pendingCount > 0 && (
            <button
              onClick={syncNow}
              disabled={!isOnline || isSyncing}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{pendingCount} pending</span>
            </button>
          )}

          {/* Network Status */}
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-gray-400" />
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3 border-l pl-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">{user?.displayName}</p>
              <p className="text-xs text-gray-500">{user?.role.replace('_', ' ')}</p>
            </div>
            <div className="w-10 h-10 bg-entrusted-orange rounded-full flex items-center justify-center text-white font-bold">
              {user?.displayName.charAt(0)}
            </div>
            <Button
              variant="secondary"
              onClick={signOut}
              className="!p-2"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
