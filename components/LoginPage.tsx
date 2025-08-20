'use client';

import React, { useState } from 'react';
import MagicCodeLogin from './MagicCodeLogin';
import CredentialsLogin from './CredentialsLogin';

type AuthMethod = 'magic' | 'credentials';

export default function LoginPage() {
  const [authMethod, setAuthMethod] = useState<AuthMethod>('magic');

  const handleLoginSuccess = () => {
    // The page will automatically redirect due to the auth state change
  };

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">Welcome to ProjectHub</h1>
          <p className="mt-2 text-muted-foreground">Sign in to access your projects and start collaborating</p>
        </div>

        {/* Auth Method Toggle */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setAuthMethod('magic')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              authMethod === 'magic'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Magic Code
          </button>
          <button
            type="button"
            onClick={() => setAuthMethod('credentials')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              authMethod === 'credentials'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Email & Password
          </button>
        </div>

        {/* Auth Method Content */}
        <div className="flex justify-center">
          {authMethod === 'magic' ? (
            <MagicCodeLogin onSuccess={handleLoginSuccess} />
          ) : (
            <CredentialsLogin />
          )}
        </div>

        <div className="text-center text-sm text-muted-foreground">
          By signing in, you agree to our terms of service and privacy policy.
        </div>
      </div>
    </div>
  );
}