import type {Metadata} from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { auth } from "@/auth";
import { AuthButton } from "@/components/auth-button";

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: 'BCM CHOIR PROGRAMME & HLA ZIR',
  description: '',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} dark`}>
      <head>
        <link rel="icon" href="/icon.ico" sizes="any" />
      </head>
      <body className="font-body antialiased min-h-screen bg-background text-foreground selection:bg-primary/30 relative">
        <div className="absolute top-4 right-4 md:top-6 md:right-8 z-50">
          <AuthButton session={await auth()} />
        </div>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
