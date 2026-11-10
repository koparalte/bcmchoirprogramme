"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function BackToHomeButton() {
  return (
    <Link
      href="/"
      onClick={() => {
        window.scrollTo({ top: 0, behavior: "instant" });
      }}
      className="inline-flex items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/40 px-4 py-2 rounded-full backdrop-blur-md shadow-sm group cursor-pointer"
    >
      <ArrowLeft className="w-4 h-4 text-primary group-hover:-translate-x-1 transition-transform" />
      <span>Back to Home</span>
    </Link>
  );
}
