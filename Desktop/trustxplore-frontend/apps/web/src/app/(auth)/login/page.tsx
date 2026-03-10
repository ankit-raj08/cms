'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';

import Button from '@/components/atoms/Button';
import FormInput from '@/components/molecules/FormInput';
import Typography from '@/components/atoms/Typography';
import paths from '@/constants/paths';
import { useLogin } from '@/features/auth/useLogin';
import * as authService from '@/services/auth.service';

import type { Component } from '@/@types/next.types';

interface LoginFormData {
  email: string;
  password: string;
}

const LoginPage: Component = () => {
  const { mutateAsync: login, isPending, error } = useLogin();
  const { register, handleSubmit, formState } = useForm<LoginFormData>();
  const { errors } = formState;

  const onSubmit = async (data: LoginFormData) => {
    await login({ email: data.email, password: data.password });
  };

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <Typography as="h1" variant="title" className="mb-6 text-center">
        Sign in
      </Typography>

      {error && (
        <div
          className="mb-4 rounded-md border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          {(error as Error)?.message ?? 'Invalid email or password'}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <FormInput
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Enter a valid email',
            },
          })}
          type="email"
          label="Email"
          labelFor="login-email"
          id="login-email"
          autoComplete="email"
          error={errors.email?.message}
          variant="primary"
          className="w-full"
        />
        <FormInput
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 8, message: 'Password must be at least 8 characters' },
          })}
          type="password"
          label="Password"
          labelFor="login-password"
          id="login-password"
          autoComplete="current-password"
          error={errors.password?.message}
          variant="primary"
          className="w-full"
        />
        <div className="flex flex-col gap-3">
          <Button type="submit" variant="primary" disabled={isPending} className="w-full">
            {isPending ? 'Signing in…' : 'Sign in'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              const url = authService.getGoogleLoginUrl();
              if (!url) return;
              window.location.href = url;
            }}
            className="w-full"
          >
            Sign in with Google
          </Button>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href={paths.FORGOT_PASSWORD} className="underline hover:no-underline">
          Forgot password?
        </Link>
        {' · '}
        <Link href={paths.REGISTER} className="underline hover:no-underline">
          Create account
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
