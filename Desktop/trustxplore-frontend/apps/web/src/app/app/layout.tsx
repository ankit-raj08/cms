'use client';

import { useEffect } from 'react';

import Loader from '@/components/atoms/Loader';
import paths from '@/constants/paths';
import { hasAccessToken } from '@/services/authToken';
import { useRouter } from '@/hooks/useRouter';

import type { Layout } from '@/@types/next.types';

const AppLayout: Layout = ({ children }) => {
  const router = useRouter();

  useEffect(() => {
    if (!hasAccessToken()) router.replace(paths.LOGIN);
  }, [router]);

  if (!hasAccessToken()) return <Loader />;

  return <>{children}</>;
};

export default AppLayout;
