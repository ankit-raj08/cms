'use client';

import Typography from '@/components/atoms/Typography';
import Button from '@/components/atoms/Button';
import paths from '@/constants/paths';
import { useRouter } from '@/hooks/useRouter';

import type { Component } from '@/@types/next.types';

const DashboardPage: Component = () => {
  const router = useRouter();

  const handleGoToSettings = () => {
    router.push(paths.SETTINGS);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-4">
      <Typography as="h1" variant="title" className="mb-2">
        Dashboard
      </Typography>
      <Typography as="p" variant="content" className="text-muted-foreground">
        Welcome. You are signed in.
      </Typography>
      <Button variant="primary" className="mt-4" onClick={handleGoToSettings}>
        Go to settings
      </Button>
    </div>
  );
};

export default DashboardPage;
