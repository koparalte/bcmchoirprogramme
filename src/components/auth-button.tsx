"use client";

import { signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sparkles, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function AuthButton({ session }: { session: any }) {
  const pathname = usePathname();
  const isProgressPage = pathname?.startsWith("/progress");
  const isHomePage = pathname === "/";

  if (session?.user) {
    return (
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md p-1 rounded-full border border-white/10 shadow-sm">
          {/* Home Link */}
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "text-xs uppercase tracking-wider font-bold rounded-full px-3 h-7 sm:h-8 gap-1.5 transition-all cursor-pointer",
                isHomePage
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Home</span>
            </Button>
          </Link>

          {/* My Progress Link */}
          <Link href="/progress">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "text-xs uppercase tracking-wider font-bold rounded-full px-3 h-7 sm:h-8 gap-1.5 transition-all cursor-pointer",
                isProgressPage
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>My Progress</span>
            </Button>
          </Link>
        </div>

        {/* Sign Out Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="bg-transparent border-white/10 hover:border-destructive/30 hover:bg-destructive/10 text-muted-foreground hover:text-destructive text-xs uppercase tracking-wider font-bold rounded-full px-2.5 sm:px-3 h-7 sm:h-8 gap-1.5 transition-all cursor-pointer"
          title="Sign Out"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Sign Out</span>
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={() => signIn("google")}
      size="sm"
      className="bg-primary/15 hover:bg-primary/25 text-primary border border-primary/30 text-xs uppercase tracking-widest font-bold rounded-full px-3.5 sm:px-4 h-8 gap-1.5 shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all cursor-pointer"
    >
      <User className="w-3.5 h-3.5" />
      <span>Member Login</span>
    </Button>
  );
}
