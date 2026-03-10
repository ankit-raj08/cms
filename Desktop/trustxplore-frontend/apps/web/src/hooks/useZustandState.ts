import type { RootLayoutAppProps, ZustandState } from '@/@types/zustandState.types';

type ZustandStateHook = (props: RootLayoutAppProps) => ZustandState;

export const useZustandState: ZustandStateHook = (props) => ({ ...props });
