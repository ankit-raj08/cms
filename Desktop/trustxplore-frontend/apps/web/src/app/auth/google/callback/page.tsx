'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';

import Typography from '@/components/atoms/Typography';
import paths from '@/constants/paths';
import { useRouter } from '@/hooks/useRouter';
import { useStore } from '@/hooks/useStore';
import * as authService from '@/services/auth.service';

import type { Component } from '@/@types/next.types';

const GoogleCallbackPage: Component = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const setUser = useStore((state) => state.setUser);

  useEffect(() => {
    const error = searchParams.get('error');
    const message = searchParams.get('message');

    if (error) {
      const messages: Record<string, string> = {
        OAUTH_STATE_MISMATCH: 'Security check failed. Please try logging in again.',
        OAUTH_STATE_MISSING: 'Security check failed. Please try logging in again.',
        MISSING_CODE: 'We could not complete Google sign-in. Please try again.',
      };

      const friendly = messages[error] ?? 'Google sign-in was cancelled or failed.';
      toast.error(message ?? friendly);
      router.replace(paths.LOGIN);
      return;
    }

    (async () => {
      try {
        const data = await authService.refreshSession();
        if (data?.user) setUser(data.user);
        router.replace(paths.APP.INDEX);
      } catch {
        toast.error('Login failed, please try again.');
        router.replace(paths.LOGIN);
      }
    })();
  }, [router, searchParams, setUser]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Typography as="p" variant="content" className="text-muted-foreground">
        Signing you in with Google...
      </Typography>
    </div>
  );
};

export default GoogleCallbackPage;

