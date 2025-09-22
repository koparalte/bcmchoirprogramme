import { cn } from "@/lib/utils";
import * as React from "react";

export function Logo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-8 h-8", className)}
      {...props}
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" fill="hsl(var(--secondary))"/>
      <path d="M14 2v6h6" stroke="hsl(var(--primary))" />
      <path d="m10 12.5 5-3-5-3" stroke="hsl(var(--accent))" strokeWidth="2.5" />
      <path d="m10 19.5 5-3-5-3" stroke="hsl(var(--primary))" strokeWidth="2.5" />
    </svg>
  );
}
