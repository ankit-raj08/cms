import { Suspense } from 'react';

import App from '@/app/app';
import Loader from '@/components/atoms/Loader';
import constants from '@/constants';
import cn from '@/lib/cn';
import cookieStore from '@/lib/cookieStore';
import { getMode, getPreferredMode } from '@/store/slices/theme/theme.slice';
import { interFont } from '@/styles/font';
import '@/styles/globals.css';

import type { Metadata } from 'next';

import type { Layout } from '@/@types/next.types';

export const metadata: Metadata = {
  title: constants.APP_NAME,
  description: `${constants.APP_NAME} Description`,
};

const RootLayout: Layout = async ({ children }) => {
  const { mode, preferredMode, theme } = await (async () => {
    const [modeString, preferredModeString] = await Promise.all([
      cookieStore.getAsync(constants.COOKIES.THEME_NAME),
      cookieStore.getAsync(constants.COOKIES.SYSTEM_THEME),
    ]);

    const themeMode = getMode(modeString);
    const preferredThemeMode = getPreferredMode(preferredModeString);
    const dataTheme = themeMode === constants.THEME.SYSTEM ? preferredThemeMode : themeMode;

    return { mode: themeMode, preferredMode: preferredThemeMode, theme: dataTheme };
  })();

  return (
    <html data-theme={theme} lang="en">
      <body className={cn(interFont.className, 'bg-background text-foreground')}>
        <Suspense fallback={<Loader />}>
          <App mode={mode} preferredMode={preferredMode}>
            {children}
          </App>
        </Suspense>
      </body>
    </html>
  );
};

export default RootLayout;
