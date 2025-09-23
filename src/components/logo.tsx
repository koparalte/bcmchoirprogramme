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
      <g>
        <circle cx="100" cy="100" r="95" fill="white" />
        <g stroke="hsl(var(--destructive))" strokeWidth="4" fill="none">
          {/* Cross */}
          <path d="M100 20V50" />
          <path d="M85 35H115" />
          
          {/* Globe */}
          <circle cx="100" cy="90" r="35" />
          <path d="M65 90H135" />
          <path d="M100 55V125" />
          <ellipse cx="100" cy="90" rx="17.5" ry="33" />
          <ellipse cx="100" cy="90" rx="30" ry="15" />

          {/* Book */}
          <path d="M40 120 C 40 100, 60 80, 100 80 C 140 80, 160 100, 160 120" />
          <path d="M40 120 L 40 140 L 160 140 L 160 120" />
          <path d="M100 85 L 100 140" />

          {/* Banner */}
          <path d="M50 145 C 70 160, 130 160, 150 145 L 160 155 C 130 175, 70 175, 40 155 Z" fill="white"/>
          <path d="M50 145 C 70 160, 130 160, 150 145 M 40 155 C 70 175, 130 175, 160 155" />
        </g>
        <text x="100" y="165" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="bold" textAnchor="middle" fill="hsl(var(--destructive))">
            BAPTIST CHURCH OF MIZORAM
        </text>
      </g>
    </svg>
  );
}
