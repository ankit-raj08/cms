import type { RemoveFnType } from '@/@types';
import type { SliceCreator } from '@/@types/store.types';
import type { User } from '@/types/auth.types';

interface AuthSlice {
  isAuthenticated: boolean;
  user: User | null;
  setUser: (payload: User) => void;
  logout: () => void;
}

export type AuthSliceInitialState = RemoveFnType<AuthSlice>;

export type CreateAuthSlice = SliceCreator<AuthSlice>;

interface AuthSliceGetUserOutput {
  isAuthenticated: true;
  user: User;
}

export type AuthSliceGetUser = (payload: User) => AuthSliceGetUserOutput;
