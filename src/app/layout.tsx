import type {Metadata} from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: 'BCM CHOIR PROGRAMME & HLA ZIR',
  description: '',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} dark`}>
      <head>
        <link rel="icon" href="/icon.ico" sizes="any" />
      </head>
      <body className="font-body antialiased min-h-screen bg-background text-foreground selection:bg-primary/30">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
