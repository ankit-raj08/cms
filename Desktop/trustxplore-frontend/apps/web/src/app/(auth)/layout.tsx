import constants from '@/constants';

import type { Layout } from '@/@types/next.types';

export const metadata = {
  title: ['Auth', constants.APP_NAME].join(' | '),
};

const AuthLayout: Layout = ({ children }) => <>{children}</>;

export default AuthLayout;
