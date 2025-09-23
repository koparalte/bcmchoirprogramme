import { cn } from "@/lib/utils";
import * as React from "react";

export function Logo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      className={cn("w-16 h-16", className)}
      {...props}
    >
      <circle cx="100" cy="100" r="100" fill="black" />
      <g>
        <circle cx="100" cy="100" r="95" fill="white" />
        <g stroke="hsl(var(--destructive))" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round">
          {/* Cross */}
          <path d="M100 35V65" />
          <path d="M85 50H115" />

          {/* Globe */}
          <circle cx="100" cy="100" r="35" />
          <path d="M65 100H135" />
          <path d="M100 65V135" />
          <ellipse cx="100" cy="100" rx="17.5" ry="34" />
          
          {/* Book */}
          <path d="M40 140 C 40 120, 60 110, 100 110 C 140 110, 160 120, 160 140" />
          <path d="M40 140 L 40 160 L 160 160 L 160 140" />
          <path d="M100 115 V 160" />
          <circle cx="100" cy="140" r="2" fill="hsl(var(--destructive))" stroke="none" />

          {/* Banner */}
          <path d="M45 155 C 60 170, 140 170, 155 155 L 165 170 C 140 185, 60 185, 35 170 Z" fill="white" />
          <path d="M45 155 C 60 170, 140 170, 155 155" />
        </g>
        <text x="100" y="168" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="bold" textAnchor="middle" fill="hsl(var(--destructive))">
            BAPTIST CHURCH OF MIZORAM
        </text>
      </g>
    </svg>
  );
}