'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';

import Typography from '@/components/atoms/Typography';
import paths from '@/constants/paths';
import { useRouter } from '@/hooks/useRouter';

import type { Component } from '@/@types/next.types';

const GoogleLinkCallbackPage: Component = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const error = searchParams.get('error');
    const message = searchParams.get('message');
    const linked = searchParams.get('linked');

    if (linked === 'google' && !error) {
      toast.success('Google account linked successfully.');
      router.replace(paths.APP.INDEX);
      return;
    }

    if (error) {
      const messages: Record<string, string> = {
        LINK_FAILED: 'Unable to link Google account. Please try again.',
        OAUTH_STATE_MISMATCH: 'Security check failed. Please try linking again.',
        OAUTH_STATE_MISSING: 'Security check failed. Please try linking again.',
        MISSING_CODE: 'We could not complete Google linking. Please try again.',
      };

      const friendly = messages[error] ?? 'Google account linking failed.';
      toast.error(message ?? friendly);
      router.replace(paths.APP.INDEX);
      return;
    }

    router.replace(paths.APP.INDEX);
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Typography as="p" variant="content" className="text-muted-foreground">
        Finalizing Google account linking...
      </Typography>
    </div>
  );
};

export default GoogleLinkCallbackPage;

