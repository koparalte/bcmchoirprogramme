"use client";

import Image from 'next/image';
import { motion } from 'framer-motion';

const logoUrl = "https://lh3.googleusercontent.com/d/1yOgPWEoQhO6nWt2AmwM4lxXgRsoZs7nM";

export function PageHeader() {
  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col items-center text-center mb-12 md:mb-16 pt-8"
    >
      <div className="relative p-5 mb-8 rounded-2xl bg-card border border-white/5 shadow-2xl group transition-all duration-700 hover:border-primary/40 hover:shadow-[0_0_2rem_-0.5rem_rgba(59,130,246,0.3)]">
        <Image src={logoUrl} alt="BCM Choir Programme Logo" width={64} height={64} className="opacity-90 grayscale group-hover:grayscale-0 transition-all duration-700 relative z-10" />
      </div>
      <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter text-foreground uppercase pb-2 px-4">
        BCM Choir <br className="md:hidden" /> Programme
      </h1>
      <div className="h-1 w-24 bg-primary mt-6 mb-6"></div>
    </motion.header>
  );
}
