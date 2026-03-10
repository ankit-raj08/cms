import { useMutation } from '@tanstack/react-query';

import { getUserById } from '@/services/auth.service';
import { useStore } from '@/hooks/useStore';

export function getProfileApi(userId: number) {
  return getUserById(userId);
}

export function useProfile() {
  const setUser = useStore((state) => state.setUser);

  return useMutation({
    mutationFn: (userId: number) => getProfileApi(userId),
    onSuccess: (data) => {
      if (data) setUser(data);
    },
  });
}
