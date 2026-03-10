import Typography from '@/components/atoms/Typography';

import type { Component } from '@/@types/next.types';

const VerifyEmailPage: Component = () => (
  <div className="mx-auto max-w-md px-4 py-8">
    <Typography as="h1" variant="title" className="mb-6 text-center">
      Verify your email
    </Typography>
    <Typography as="p" variant="content" className="text-center text-muted-foreground">
      OTP verification form will be wired to POST /api/v1/auth/verify-otp and resend-otp.
    </Typography>
  </div>
);

export default VerifyEmailPage;
