import React from 'react';
import { Header } from './Header';
import { NotificationContainer } from '../shared/Notification';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
      <NotificationContainer />
    </div>
  );
};
