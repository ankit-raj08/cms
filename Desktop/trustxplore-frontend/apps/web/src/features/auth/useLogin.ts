import { useMutation } from '@tanstack/react-query';

import * as authService from '@/services/auth.service';
import paths from '@/constants/paths';
import { useRouter } from '@/hooks/useRouter';
import { useStore } from '@/hooks/useStore';

import type { LoginBody } from '@/types/auth.types';

export function useLogin() {
  const setUser = useStore((state) => state.setUser);
  const router = useRouter();

  return useMutation({
    mutationFn: (body: LoginBody) => authService.login(body),
    onSuccess: (data) => {
      if (data?.user) setUser(data.user);
      router.push(paths.APP.INDEX);
    },
  });
}
