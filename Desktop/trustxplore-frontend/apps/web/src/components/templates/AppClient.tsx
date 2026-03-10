'use client';

import { useCallback, useEffect } from 'react';
import { usePathname } from 'next/navigation';

import WebsiteLoader from '@/components/molecules/WebsiteLoader';
import constants from '@/constants';
import paths from '@/constants/paths';
import { useRouter } from '@/hooks/useRouter';
import { useStore } from '@/hooks/useStore';
import * as authService from '@/services/auth.service';
import { sleep } from '@/utils';

import type { Component } from '@/@types/next.types';

const AppClient: Component = () => {
  const isLoading = useStore((state) => state.isLoading);
  const setLoading = useStore((state) => state.setLoading);
  const setPreferredMode = useStore((state) => state.setPreferredMode);
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const setUser = useStore((state) => state.setUser);

  const router = useRouter();
  const pathname = usePathname();

  const handleColorSchema = useCallback(
    (event: MediaQueryListEvent) => {
      const { LIGHT, DARK } = constants.THEME;
      const newTheme = event.matches ? DARK : LIGHT;
      setPreferredMode(newTheme);
    },
    [setPreferredMode],
  );

  useEffect(() => {
    (async () => {
      await sleep(constants.STARTUP_PROGRESS_BAR_TIMEOUT);
      setLoading(false);
    })();
  }, [setLoading]);

  useEffect(() => {
    const matchMedia = globalThis.matchMedia('(prefers-color-scheme: dark)');

    matchMedia.addEventListener('change', handleColorSchema);
    return () => matchMedia.removeEventListener('change', handleColorSchema);
  }, [handleColorSchema]);

  // If already authenticated, never allow staying on public/auth pages
  useEffect(() => {
    if (!isAuthenticated) return;

    const isPublicOrAuthPage =
      pathname === paths.INDEX ||
      pathname === paths.LOGIN ||
      pathname === paths.REGISTER ||
      pathname === paths.FORGOT_PASSWORD ||
      pathname === paths.RESET_PASSWORD ||
      pathname === paths.VERIFY_EMAIL;

    if (isPublicOrAuthPage) {
      router.replace(paths.APP.INDEX);
    }
  }, [isAuthenticated, pathname, router]);

  useEffect(() => {
    if (isAuthenticated) return;

    let cancelled = false;

    (async () => {
      try {
        const data = await authService.refreshSession();
        if (!cancelled && data?.user) {
          setUser(data.user);
          const isOnAuthPage =
            pathname === paths.INDEX ||
            pathname === paths.LOGIN ||
            pathname === paths.REGISTER ||
            pathname === paths.FORGOT_PASSWORD ||
            pathname === paths.RESET_PASSWORD ||
            pathname === paths.VERIFY_EMAIL;

          if (isOnAuthPage) {
            router.replace(paths.APP.INDEX);
          }
        }
      } catch {
        if (cancelled) return;

        const isProtectedRoute =
          pathname?.startsWith(paths.APP.INDEX) || pathname === paths.SETTINGS;

        if (isProtectedRoute) {
          router.replace(paths.LOGIN);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, pathname, router, setUser]);

  return isLoading ? <WebsiteLoader /> : null;
};

export default AppClient;
