import Providers from '@/app/providers';
import AppHeader from '@/components/organisms/AppHeader';
import AppClient from '@/components/templates/AppClient';

import type { Layout } from '@/@types/next.types';
import type { RootLayoutAppProps } from '@/@types/zustandState.types';

const App: Layout<RootLayoutAppProps> = ({ children, ...props }) => (
  <Providers {...props}>
    <AppClient />
    <AppHeader />
    <main id="main" className="min-h-[calc(100vh-4rem)]">
      {children}
    </main>
  </Providers>
);

export default App;
