import { env } from '@/config/env';

const envs = {
  NODE_ENV: env.NODE_ENV,
  ENV_NAME: env.NODE_ENV,
  NEXT_PUBLIC_API_PATH: env.apiBase,
} as const;

export default envs;
