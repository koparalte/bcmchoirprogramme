import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"

const logoUrl = "https://lh3.googleusercontent.com/d/1yOgPWEoQhO6nWt2AmwM4lxXgRsoZs7nM";

export const metadata: Metadata = {
  title: 'BCM CHOIR PROGRAMME',
  description: 'Dynamically generate an event schedule from a Google Sheet.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/icon.ico" sizes="any" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}

