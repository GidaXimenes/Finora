import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import 'driver.js/dist/driver.css';
import './globals.css';
import { Providers } from '@/components/providers';

const font = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });

export const metadata: Metadata = {
  title: 'Finora - suas finanças, com clareza',
  description: 'Controle financeiro pessoal: contas, transações, orçamentos e um painel simples de entender.',
  icons: { icon: '/favicon.svg' },
};

export const viewport: Viewport = { themeColor: '#F6F8F7' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={font.variable}>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
