'use client';

import Link from 'next/link';

import Button from '@/components/atoms/Button';
import paths from '@/constants/paths';
import { useLogout } from '@/features/profile/useLogout';
import { useStore } from '@/hooks/useStore';

import type { Component } from '@/@types/next.types';

const AppHeader: Component = () => {
  const mode = useStore((state) => state.mode);
  const setMode = useStore((state) => state.setMode);
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  return (
    <header className="border-b border-foreground/10 bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-4xl items-center justify-between">
        <Link href={paths.INDEX} className="font-medium text-foreground hover:opacity-90">
          TrustXplore
        </Link>
        <nav className="flex items-center gap-3">
          {!isAuthenticated && (
            <Link
              href={paths.LOGIN}
              className="rounded-full px-4 py-2 text-sm text-foreground hover:bg-foreground/10"
            >
              Sign in
            </Link>
          )}
          {isAuthenticated && (
            <>
              <Link
                href={paths.APP.INDEX}
                className="rounded-full px-4 py-2 text-sm text-foreground hover:bg-foreground/10"
              >
                Dashboard
              </Link>
              <Button
                type="button"
                variant="primary"
                className="text-sm"
                disabled={isLoggingOut}
                onClick={() => logout()}
              >
                {isLoggingOut ? 'Signing out…' : 'Sign out'}
              </Button>
            </>
          )}
          <Button
            type="button"
            variant="primary"
            className="text-sm"
            onClick={() => setMode(undefined)}
            aria-label={`Theme: ${mode}. Click to cycle.`}
          >
            {mode}
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default AppHeader;
