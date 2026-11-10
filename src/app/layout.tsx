import type {Metadata} from 'next';
import { Inter, Outfit } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { auth } from "@/auth";
import { AuthButton } from "@/components/auth-button";
import Link from 'next/link';
import Image from 'next/image';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });
const cursiveFont = localFont({
  src: '../../public/fonts/RusticRoadway.otf',
  variable: '--font-cursive',
  display: 'swap',
});

const LOGO_URL = "https://lh3.googleusercontent.com/d/1yOgPWEoQhO6nWt2AmwM4lxXgRsoZs7nM";

export const metadata: Metadata = {
  title: 'BCM CHOIR PROGRAMME & HLA ZIR',
  description: '',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} ${cursiveFont.variable} dark`}>
      <head>
        <link rel="icon" href="/icon.ico" sizes="any" />
      </head>
      <body className="font-body antialiased min-h-screen bg-background text-foreground selection:bg-primary/30 relative flex flex-col">
        {/* Sticky Global Top Header Navigation Bar */}
        <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl">
          <div className="container mx-auto px-4 h-14 md:h-16 flex items-center justify-between">
            {/* Left Brand: Logo + BCM Choir Home link */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-card border border-white/10 flex items-center justify-center overflow-hidden shadow-sm group-hover:border-primary/40 transition-colors">
                <Image 
                  src={LOGO_URL} 
                  alt="BCM Choir Logo" 
                  width={22} 
                  height={22} 
                  className="opacity-90 grayscale group-hover:grayscale-0 transition-all duration-300" 
                />
              </div>
              <span className="font-headline font-bold uppercase tracking-wider text-sm md:text-base text-foreground group-hover:text-primary transition-colors">
                BCM Choir
              </span>
            </Link>

            {/* Right: Clean Header Navigation (Home, My Progress, Sign Out / Login) */}
            <AuthButton session={session} />
          </div>
        </header>

        <div className="flex-grow">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
