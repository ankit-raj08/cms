'use client';

import { useMutation } from '@tanstack/react-query';

import { clearAccessToken } from '@/services/authToken';
import paths from '@/constants/paths';
import { useRouter } from '@/hooks/useRouter';
import { useStore } from '@/hooks/useStore';

export function useLogout() {
  const logout = useStore((state) => state.logout);
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      clearAccessToken();
      logout();
    },
    onSettled: () => {
      router.push(paths.LOGIN);
    },
  });
}
