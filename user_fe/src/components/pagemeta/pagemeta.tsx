import { ReactNode } from 'react';
import { HelmetProvider, Helmet } from 'react-helmet-async';

const PageMeta = ({ title, desc }: { title: string; desc: string }) => (
  <Helmet>
    <title>{title}</title>
    <meta name="description" content={desc} />
  </Helmet>
);

export const AppWrapper = ({ children }: { children: ReactNode }) => (
  <HelmetProvider>{children}</HelmetProvider>
);

export default PageMeta;
