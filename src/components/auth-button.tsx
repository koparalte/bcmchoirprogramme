"use client";

import { signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AuthButton({ session }: { session: any }) {
  const pathname = usePathname();
  const isProgressPage = pathname?.startsWith('/progress');

  if (session?.user) {
    return (
      <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md p-1.5 rounded-full border border-white/10 shadow-lg">
        <Link href={isProgressPage ? "/" : "/progress"}>
          <Button 
            variant="ghost" 
            className="text-primary hover:text-primary hover:bg-primary/10 text-xs uppercase tracking-widest font-bold rounded-full px-4 h-8"
          >
            {isProgressPage ? "Home" : "My Progress"}
          </Button>
        </Link>
        <Button 
          variant="outline" 
          onClick={() => signOut()}
          className="bg-transparent border-white/10 hover:bg-white/5 text-muted-foreground hover:text-foreground text-xs uppercase tracking-widest font-bold rounded-full px-4 h-8"
        >
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <Button 
      onClick={() => signIn("google")}
      className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/20 text-xs uppercase tracking-widest font-bold shadow-[0_0_15px_rgba(59,130,246,0.2)]"
    >
      Member Login
    </Button>
  );
}
