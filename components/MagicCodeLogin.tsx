'use client';

import React, { useState } from 'react';
import { db } from '../lib/db';

interface MagicCodeLoginProps {
  onSuccess?: () => void;
}

function EmailStep({ onSendEmail }: { onSendEmail: (email: string) => void }) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const inputEl = inputRef.current!;
    const email = inputEl.value;

    setIsLoading(true);
    try {
      await db.auth.sendMagicCode({ email });
      onSendEmail(email);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert("Uh oh: " + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      key="email"
      onSubmit={handleSubmit}
      className="flex flex-col space-y-4"
    >
      <h2 className="text-xl font-bold">Let&apos;s log you in</h2>
      <p className="text-gray-700">
        Enter your email, and we&apos;ll send you a verification code. We&apos;ll create
        an account for you too if you don&apos;t already have one.
      </p>
      <input
        ref={inputRef}
        type="email"
        className="border border-gray-300 px-3 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter your email"
        required
        autoFocus
      />
      <button
        type="submit"
        disabled={isLoading}
        className="px-4 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed w-full"
      >
        {isLoading ? 'Sending...' : 'Send Code'}
      </button>
    </form>
  );
}

function CodeStep({ sentEmail, onSuccess }: { sentEmail: string; onSuccess?: () => void }) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const inputEl = inputRef.current!;
    const code = inputEl.value;

    setIsLoading(true);
    try {
      await db.auth.signInWithMagicCode({ email: sentEmail, code });
      onSuccess?.();
    } catch (error: unknown) {
      inputEl.value = "";
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert("Uh oh: " + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      key="code"
      onSubmit={handleSubmit}
      className="flex flex-col space-y-4"
    >
      <h2 className="text-xl font-bold">Enter your code</h2>
      <p className="text-gray-700">
        We sent an email to <strong>{sentEmail}</strong>. Check your email, and
        paste the code you see.
      </p>
      <input
        ref={inputRef}
        type="text"
        className="border border-gray-300 px-3 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="123456..."
        required
        autoFocus
      />
      <button
        type="submit"
        disabled={isLoading}
        className="px-4 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed w-full"
      >
        {isLoading ? 'Verifying...' : 'Verify Code'}
      </button>
    </form>
  );
}

export default function MagicCodeLogin({ onSuccess }: MagicCodeLoginProps) {
  const [sentEmail, setSentEmail] = useState("");

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="w-full max-w-sm">
        {!sentEmail ? (
          <EmailStep onSendEmail={setSentEmail} />
        ) : (
          <CodeStep sentEmail={sentEmail} onSuccess={onSuccess} />
        )}
      </div>
    </div>
  );
}