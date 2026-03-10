import { useMutation } from '@tanstack/react-query';

import * as authService from '@/services/auth.service';

import type { SetPasswordBody } from '@/types/auth.types';

export function useSetPassword() {
  return useMutation({
    mutationFn: (body: SetPasswordBody) => authService.setPassword(body),
  });
}

