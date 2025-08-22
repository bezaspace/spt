'use client';

import { db } from '@/lib/db';
import LoginPage from '@/components/LoginPage';
import Dashboard from '@/components/Dashboard';
import Navbar from '@/components/Navbar';

export default function Home() {
  const { isLoading, user, error } = db.useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Error: {String(error)}</div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <Dashboard />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar variant="auth" />
      <LoginPage />
    </div>
  );
}
