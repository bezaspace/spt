'use client';

import React from 'react';
import CredentialsLogin from './CredentialsLogin';

export default function LoginPage() {

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">Welcome to ProjectHub</h1>
          <p className="mt-2 text-muted-foreground">Sign in to access your projects and start collaborating</p>
        </div>

        {/* Login Form */}
        <div className="flex justify-center">
          <CredentialsLogin />
        </div>

        <div className="text-center text-sm text-muted-foreground">
          By signing in, you agree to our terms of service and privacy policy.
        </div>
      </div>
    </div>
  );
}