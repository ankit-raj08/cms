'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import Typography from '@/components/atoms/Typography';
import paths from '@/constants/paths';

import type { Component } from '@/@types/next.types';

const AuthErrorPage: Component = () => {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const message = searchParams.get('message');

  const mappedMessages: Record<string, string> = {
    OAUTH_STATE_MISMATCH: 'Your session was invalid or expired. Please try signing in again.',
    MISSING_CODE: 'Sign-in was cancelled or did not complete.',
    access_denied: 'You denied access to your Google account.',
  };

  const display =
    message ??
    (error ? mappedMessages[error] ?? `Sign-in failed: ${error}` : 'Something went wrong.');

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <Typography as="h1" variant="title" className="mb-4 text-center">
        Sign-in error
      </Typography>
      <Typography as="p" variant="content" className="mb-6 text-center text-muted-foreground">
        {display}
      </Typography>
      <p className="text-center">
        <Link href={paths.LOGIN} className="underline hover:no-underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
};

export default AuthErrorPage;

