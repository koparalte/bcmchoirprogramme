"use client";

import { Card, CardContent } from "@/components/ui/card";
import { User, Church } from "lucide-react";
import type { Member } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type MemberCardProps = {
    member: Member;
    onSelectMember: (member: Member) => void;
}

export function MemberCard({ member, onSelectMember }: MemberCardProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const isFocusedRef = useRef(false);

  useEffect(() => {
    isFocusedRef.current = isFocused;
  }, [isFocused]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!isMobile) return;
    
    let rafId: number;
    const checkCenter = () => {
       if (!cardRef.current) return;
       const rect = cardRef.current.getBoundingClientRect();
       const screenCenter = window.innerHeight / 2;
       
       // Check if the screen center line falls inside the card (with a 10px buffer to prevent flickering in gaps)
       const isIntersectingCenter = screenCenter >= (rect.top - 10) && screenCenter <= (rect.bottom + 10);
       
       if (isIntersectingCenter && !isFocusedRef.current) {
          setIsFocused(true);
       } else if (!isIntersectingCenter && isFocusedRef.current) {
          setIsFocused(false);
       }
    };

    const onScroll = () => {
       cancelAnimationFrame(rafId);
       rafId = requestAnimationFrame(checkCenter);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    checkCenter();
    
    return () => {
       window.removeEventListener('scroll', onScroll);
       window.removeEventListener('resize', onScroll);
       cancelAnimationFrame(rafId);
    };
  }, [isMobile]);

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name.substring(0, 2);
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "0px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="h-full"
    >
      <Card 
          className={cn(
            "cursor-pointer transition-all duration-500 h-full bg-card border rounded-2xl overflow-hidden relative group",
            isFocused 
              ? "shadow-[0_0_2rem_-0.5rem_rgba(59,130,246,0.3)] -translate-y-1 border-primary/40" 
              : "border-white/10 hover:shadow-[0_0_2rem_-0.5rem_rgba(59,130,246,0.2)] hover:-translate-y-1 hover:border-primary/40"
          )}
          onClick={() => onSelectMember(member)}
      >
        <div className={cn(
          "absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent transition-opacity duration-500 z-0 pointer-events-none",
          isFocused ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}></div>
        
        <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full relative z-10">
            <div className={cn(
              "relative w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-primary/10 to-transparent flex items-center justify-center mb-5 ring-2 shadow-inner transition-all duration-500",
              isFocused ? "ring-primary/40 shadow-[0_0_15px_rgba(59,130,246,0.3)]" : "ring-white/5 group-hover:ring-primary/40 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]"
            )}>
              {member.link ? (
                <Image 
                  src={member.link} 
                  alt={member.name} 
                  layout="fill" 
                  objectFit="cover" 
                  className={cn("transition-transform duration-700 ease-out", isFocused ? "scale-110" : "group-hover:scale-110")} 
                />
              ) : (
                <span className="text-3xl font-bold text-primary/70">{getInitials(member.name)}</span>
              )}
            </div>
          
            <div className="flex flex-col items-center flex-grow">
                <div className="flex items-center gap-2">
                    <p className={cn(
                      "text-xl font-bold tracking-tight transition-colors",
                      isFocused ? "text-primary" : "text-foreground group-hover:text-primary"
                    )}>{member.name}</p>
                </div>
                {member.designation && (
                    <Badge variant="secondary" className="mt-2 bg-primary/10 text-primary border border-primary/20 font-bold tracking-widest uppercase text-[10px] px-2 py-0.5 rounded-sm">{member.designation}</Badge>
                )}
                {member.kohhran && (
                    <div className="flex items-center gap-2 mt-4 text-muted-foreground bg-secondary/20 px-3 py-1.5 rounded border border-white/5">
                        <Church className="w-3.5 h-3.5 text-primary" />
                        <p className="text-xs font-semibold">{member.kohhran}</p>
                    </div>
                )}
            </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
