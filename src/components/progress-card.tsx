"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ProgressMember } from "@/lib/types";
import { CheckCircle2, Circle, ChevronDown, Crown } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function ProgressCard({ member, isHero = false }: { member: ProgressMember, isHero?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(isHero);

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name.substring(0, 2);
  }

  const completedSongs = member.songs.filter(s => s.completed).length;
  const totalSongs = member.songs.length;
  const progressPercent = totalSongs > 0 ? (completedSongs / totalSongs) * 100 : 0;

  return (
    <Card className={cn(
       "bg-card border transition-all duration-500 rounded-2xl overflow-hidden group h-full flex flex-col",
       isHero 
         ? "border-primary/50 shadow-[0_0_30px_rgba(59,130,246,0.2)] md:col-span-2 xl:col-span-3 scale-[1.02] z-10 my-4" 
         : "border-white/5 hover:border-primary/20"
    )}>
       <CardContent className="p-0 flex flex-col h-full cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <div className={cn(
             "p-6 pb-4 flex items-center gap-4 relative overflow-hidden flex-shrink-0",
             isHero ? "bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border-b border-primary/20" : "bg-gradient-to-br from-primary/5 to-transparent border-b border-white/5"
          )}>
             {isHero && (
                <div className="absolute top-0 right-0 p-3 opacity-20 pointer-events-none">
                   <span className="text-6xl font-black italic tracking-tighter">YOU</span>
                </div>
             )}
             {/* Progress Bar background hint */}
             <div 
               className="absolute bottom-0 left-0 h-1 bg-emerald-500/50 transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
               style={{ width: `${progressPercent}%` }}
             />
             
             <div className="relative w-16 h-16 rounded-full overflow-hidden bg-primary/10 flex-shrink-0 border border-primary/20 flex items-center justify-center">
                {member.link ? (
                  <Image 
                    src={member.link} 
                    alt={member.name} 
                    layout="fill" 
                    objectFit="cover" 
                  />
                ) : (
                  <span className="text-xl font-bold text-primary/70">{getInitials(member.name)}</span>
                )}
             </div>
             
             {member.medal && (
                <div className="absolute top-2 left-2 z-20">
                    <Crown className={cn(
                       "w-7 h-7 -rotate-12",
                       member.medal === 'gold' && "text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)] fill-yellow-400/20",
                       member.medal === 'silver' && "text-slate-300 drop-shadow-[0_0_8px_rgba(203,213,225,0.6)] fill-slate-300/20",
                       member.medal === 'bronze' && "text-amber-600 drop-shadow-[0_0_8px_rgba(217,119,6,0.6)] fill-amber-600/20"
                    )} />
                </div>
             )}
             
             <div className="flex-grow z-10">
                <h3 className={cn("font-semibold tracking-wider uppercase text-foreground", isHero ? "text-2xl md:text-3xl text-primary drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]" : "text-lg")}>
                   {isHero ? `Welcome, ${member.name}` : member.name}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                   <Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/20 font-bold tracking-widest uppercase text-[10px] px-2 py-0.5 rounded-sm">
                      {member.part}
                   </Badge>
                   {totalSongs > 0 ? (
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                         {completedSongs}/{totalSongs} Done
                      </span>
                   ) : (
                      <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">
                         Choir Master
                      </span>
                   )}
                </div>
             </div>
             <div className="flex-shrink-0 text-muted-foreground group-hover:text-primary transition-colors z-10">
                <ChevronDown className={cn("w-6 h-6 transition-transform duration-300", isExpanded && "rotate-180")} />
             </div>
          </div>
          
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="p-4 md:p-6 pt-2 space-y-1.5 border-t border-white/5">
                   {totalSongs === 0 ? (
                      <div className="p-4 text-center">
                         <span className="text-muted-foreground font-medium italic">As a conductor, you oversee the choir's progress!</span>
                      </div>
                   ) : (
                      member.songs.map((song, i) => (
                         <div key={i} className={cn(
                            "flex items-center gap-2.5 p-2 rounded-lg transition-colors border",
                            song.completed ? "bg-primary/5 border-primary/20" : "border-transparent opacity-60"
                         )}>
                            {song.completed ? (
                               <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            ) : (
                               <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                            )}
                            <span className={cn(
                               "text-sm font-medium leading-tight",
                               song.completed ? "text-foreground" : "text-muted-foreground"
                            )}>
                               {song.name}
                            </span>
                         </div>
                      ))
                   )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
       </CardContent>
    </Card>
  )
}
