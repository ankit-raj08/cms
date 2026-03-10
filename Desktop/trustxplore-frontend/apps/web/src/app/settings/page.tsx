'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';

import Button from '@/components/atoms/Button';
import Typography from '@/components/atoms/Typography';
import FormInput from '@/components/molecules/FormInput';
import paths from '@/constants/paths';
import { useSetPassword } from '@/features/auth/useSetPassword';
import { useRouter } from '@/hooks/useRouter';
import { useStore } from '@/hooks/useStore';

import type { Component } from '@/@types/next.types';

interface SetPasswordFormData {
  password: string;
  confirmPassword: string;
}

const SettingsPage: Component = () => {
  const router = useRouter();
  const isAuthenticated = useStore((state) => state.isAuthenticated);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<SetPasswordFormData>();

  const {
    mutateAsync: setPassword,
    isPending,
  } = useSetPassword();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(paths.LOGIN);
    }
  }, [isAuthenticated, router]);

  const onSubmit = async (data: SetPasswordFormData) => {
    await setPassword({
      password: data.password,
      confirmPassword: data.confirmPassword,
    });
    toast.success('Password has been set successfully.');
    reset();
    router.push(paths.APP.INDEX);
  };

  const passwordValue = watch('password');

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <Typography as="h1" variant="title" className="mb-6 text-center">
        Account settings
      </Typography>

      <section aria-labelledby="security-heading" className="space-y-4">
        <Typography as="h2" id="security-heading" variant="title" className="mb-2">
          Security
        </Typography>
        <Typography as="p" variant="content" className="mb-4 text-sm text-muted-foreground">
          If you signed up with Google, you can add a password to sign in with email and password as
          well.
        </Typography>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <FormInput
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters',
              },
            })}
            type="password"
            label="New password"
            labelFor="settings-password"
            id="settings-password"
            autoComplete="new-password"
            error={errors.password?.message}
            variant="primary"
            className="w-full"
          />

          <FormInput
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (value) => value === passwordValue || 'Passwords do not match',
            })}
            type="password"
            label="Confirm password"
            labelFor="settings-confirm-password"
            id="settings-confirm-password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            variant="primary"
            className="w-full"
          />

          <Button type="submit" variant="primary" disabled={isPending} className="w-full">
            {isPending ? 'Saving…' : 'Set password'}
          </Button>
        </form>
      </section>
    </div>
  );
};

export default SettingsPage;

