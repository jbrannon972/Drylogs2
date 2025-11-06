/**
 * Setup Page - One-Click Demo User Creation
 * Creates demo users for MIT Tech and MIT Lead with proper Firestore profiles
 */

import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { Button } from '../shared/Button';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { User } from '../../types';

interface SetupResult {
  email: string;
  status: 'pending' | 'success' | 'error' | 'exists';
  message: string;
}

export const SetupPage: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [results, setResults] = useState<SetupResult[]>([]);
  const [completed, setCompleted] = useState(false);

  const demoUsers = [
    {
      email: 'tech@demo.com',
      password: 'password123',
      displayName: 'Demo Tech',
      phoneNumber: '+1 (555) 123-4567',
      role: 'MIT_TECH' as const,
      zone: 'Zone 1' as const,
    },
    {
      email: 'lead@demo.com',
      password: 'password123',
      displayName: 'Demo Lead',
      phoneNumber: '+1 (555) 987-6543',
      role: 'MIT_LEAD' as const,
      zone: 'Zone 1' as const,
    },
  ];

  const createDemoUsers = async () => {
    setIsCreating(true);
    setResults([]);
    setCompleted(false);

    const newResults: SetupResult[] = [];

    for (const userData of demoUsers) {
      try {
        // Create Firebase Auth user
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          userData.email,
          userData.password
        );
        const firebaseUser = userCredential.user;

        // Create Firestore user profile
        const newUser: User = {
          uid: firebaseUser.uid,
          email: userData.email,
          displayName: userData.displayName,
          phoneNumber: userData.phoneNumber,
          role: userData.role,
          zone: userData.zone,
          assignedJobs: [],
          createdAt: serverTimestamp() as any,
          lastLogin: serverTimestamp() as any,
          isActive: true,
          preferences: {
            notifications: true,
            darkMode: false,
            preferredTimeZone: 'America/New_York',
            language: 'en',
          },
          qualifications: {
            iicrcCertified: true,
            trainingLevel: 'senior',
          },
          metadata: {
            totalJobsCompleted: 0,
            totalEquipmentScans: 0,
            accuracyScore: 100,
            lastActivityAt: serverTimestamp() as any,
          },
        };

        await setDoc(doc(db, 'users', firebaseUser.uid), newUser);

        // Sign out the user we just created so we can create the next one
        await auth.signOut();

        newResults.push({
          email: userData.email,
          status: 'success',
          message: `✅ Created successfully (UID: ${firebaseUser.uid.substring(0, 8)}...)`,
        });
      } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
          newResults.push({
            email: userData.email,
            status: 'exists',
            message: '⚠️ User already exists',
          });
        } else {
          newResults.push({
            email: userData.email,
            status: 'error',
            message: `❌ Error: ${error.message}`,
          });
        }
      }

      setResults([...newResults]);
    }

    setIsCreating(false);
    setCompleted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-entrusted-orange rounded-full mb-4">
            <span className="text-3xl">🔧</span>
          </div>
          <h1 className="text-3xl font-poppins font-bold text-gray-900 mb-2">
            MIT Dry Logs Setup
          </h1>
          <p className="text-gray-600">
            Create demo users for testing the application
          </p>
        </div>

        {/* Demo Users Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Demo Accounts to Create:</h2>
          <div className="space-y-3">
            {demoUsers.map((user) => (
              <div key={user.email} className="bg-white rounded-lg p-4 border border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{user.displayName}</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.role === 'MIT_TECH'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {user.role}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <p>📧 {user.email}</p>
                  <p>🔑 {user.password}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create Button */}
        {!completed && (
          <Button
            variant="primary"
            onClick={createDemoUsers}
            disabled={isCreating}
            className="w-full py-4 text-lg"
          >
            {isCreating ? (
              <>
                <LoadingSpinner size="sm" />
                Creating Users...
              </>
            ) : (
              '🚀 Create Demo Users'
            )}
          </Button>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="font-semibold text-gray-900 mb-3">Results:</h3>
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 flex items-start gap-3 ${
                  result.status === 'success'
                    ? 'bg-green-50 border-green-200'
                    : result.status === 'exists'
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                {result.status === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-medium text-gray-900">{result.email}</p>
                  <p className="text-sm text-gray-600">{result.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Success Message */}
        {completed && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="font-semibold text-green-900">Setup Complete!</h3>
            </div>
            <p className="text-green-800 mb-4">
              You can now log in with the demo accounts.
            </p>
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <p className="text-sm font-medium text-gray-900 mb-2">Test Credentials:</p>
              <div className="space-y-2 text-sm text-gray-700">
                <p>
                  <strong>MIT Tech:</strong> tech@demo.com / password123
                </p>
                <p>
                  <strong>MIT Lead:</strong> lead@demo.com / password123
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <Button
                variant="primary"
                onClick={() => (window.location.href = '/login')}
                className="flex-1"
              >
                Go to Login
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setResults([]);
                  setCompleted(false);
                }}
                className="flex-1"
              >
                Create More
              </Button>
            </div>
          </div>
        )}

        {/* Warning */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-xs text-yellow-800">
            ⚠️ <strong>Development Only:</strong> This setup page should be removed or protected in production.
            For demo purposes, users are created with simple passwords.
          </p>
        </div>
      </div>
    </div>
  );
};
