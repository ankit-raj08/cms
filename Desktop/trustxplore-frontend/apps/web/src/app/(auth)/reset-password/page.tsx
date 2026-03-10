import Link from 'next/link';

import Typography from '@/components/atoms/Typography';
import paths from '@/constants/paths';

import type { Component } from '@/@types/next.types';

const ResetPasswordPage: Component = () => (
  <div className="mx-auto max-w-md px-4 py-8">
    <Typography as="h1" variant="title" className="mb-6 text-center">
      Reset password
    </Typography>
    <Typography as="p" variant="content" className="mb-6 text-center text-muted-foreground">
      Form will be wired to POST /api/v1/auth/reset-password.
    </Typography>
    <p className="text-center text-sm text-muted-foreground">
      <Link href={paths.LOGIN} className="underline hover:no-underline">
        Back to sign in
      </Link>
    </p>
  </div>
);

export default ResetPasswordPage;
