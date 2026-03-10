import type { ThemeSliceInitialState } from '@/store/slices/theme/theme.types';

export interface RootLayoutAppProps extends Pick<ThemeSliceInitialState, 'mode' | 'preferredMode'> {}

export type ZustandState = RootLayoutAppProps;
export type ZustandProviderProps = RootLayoutAppProps;
