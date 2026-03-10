import type { Metadata } from 'next';

import constants from '@/constants';

export const metadata: Metadata = {
  title: ['Dashboard', constants.APP_NAME].join(' | '),
};

