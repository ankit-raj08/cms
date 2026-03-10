import Link from 'next/link';

import Typography from '@/components/atoms/Typography';
import constants from '@/constants';
import paths from '@/constants/paths';

import type { Metadata } from 'next';

import type { Component } from '@/@types/next.types';

export const metadata: Metadata = {
  title: ['Home', constants.APP_NAME].join(' | '),
};

const HomePage: Component = () => (
  <div className="mx-auto max-w-2xl px-4 py-12 text-center">
    <Typography as="h1" variant="title" className="mb-4">
      {constants.APP_NAME}
    </Typography>
    <Typography as="p" variant="content" className="mb-6 text-muted-foreground">
      Welcome. Sign in or create an account to continue.
    </Typography>
    <div className="flex justify-center gap-4">
      <Link
        href={paths.LOGIN}
        className="rounded-full bg-foreground px-4 py-2 text-sm text-background transition-opacity hover:opacity-90"
      >
        Sign in
      </Link>
    </div>
  </div>
);

export default HomePage;
