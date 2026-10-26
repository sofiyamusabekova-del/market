import './globals.css';
import { metadata as siteMetadata } from '@/lib/metadata';
import { StoreProvider } from '@/lib/store';
import { AuthProvider } from '@/components/providers/AuthProvider';

export const metadata = siteMetadata;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>
        <AuthProvider>
          <StoreProvider>{children}</StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
