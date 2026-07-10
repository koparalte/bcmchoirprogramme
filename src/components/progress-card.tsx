"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ProgressMember } from "@/lib/types";
import { CheckCircle2, Circle, Crown, ExternalLink } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

// Helper function moved outside component so it isn't recreated every render
const getInitials = (name: string) => {
  if (!name) return "";
  const names = name.split(' ');
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`;
  }
  return name.substring(0, 2);
}

export function ProgressCard({ member, isHero = false }: { member: ProgressMember, isHero?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);

  // Memoize the derived calculations so they don't re-run on simple state changes (like hovering or opening the dialog)
  const { completedSongs, totalSongs, progressPercent } = useMemo(() => {
    const total = member.songs.length;
    let completed = 0;
    for (let i = 0; i < total; i++) {
      if (member.songs[i].completed) completed++;
    }
    return {
      completedSongs: completed,
      totalSongs: total,
      progressPercent: total > 0 ? (completed / total) * 100 : 0
    };
  }, [member.songs]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className={cn(
           "bg-card border transition-all duration-500 rounded-2xl overflow-hidden group h-full flex flex-col cursor-pointer",
           isHero 
             ? "border-primary/50 shadow-[0_0_30px_rgba(59,130,246,0.2)] md:col-span-2 xl:col-span-3 scale-[1.02] z-10 my-4" 
             : "border-white/5 hover:border-primary/20"
        )}>
           <CardContent className="p-0 flex flex-col h-full">
              <div className={cn(
                 "flex items-center relative overflow-hidden flex-shrink-0 h-full",
                 isHero 
                   ? "p-8 md:p-10 pb-6 md:pb-8 gap-6 md:gap-8 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border-b border-primary/20" 
                   : "p-6 pb-4 gap-4 bg-gradient-to-br from-primary/5 to-transparent border-b border-white/5"
              )}>
                 {isHero && (
                    <div className="absolute top-0 right-0 p-3 opacity-20 pointer-events-none">
                       <span className="text-6xl md:text-8xl font-black italic tracking-tighter">YOU</span>
                    </div>
                 )}
                 {/* Progress Bar background hint */}
                 <div 
                   className="absolute bottom-0 left-0 h-1 bg-emerald-500/50 transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                   style={{ width: `${progressPercent}%` }}
                 />
                 
                 <div className={cn(
                     "relative rounded-full overflow-hidden bg-primary/10 flex-shrink-0 border border-primary/20 flex items-center justify-center",
                     isHero ? "w-20 h-20 md:w-28 md:h-28 border-2" : "w-16 h-16"
                  )}>
                    {member.link ? (
                      <Image 
                        src={member.link} 
                        alt={member.name} 
                        layout="fill" 
                        objectFit="cover" 
                      />
                    ) : (
                      <span className={cn("font-bold text-primary/70", isHero ? "text-3xl md:text-4xl" : "text-xl")}>{getInitials(member.name)}</span>
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
                    <ExternalLink className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
                 </div>
              </div>
           </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-md bg-card/95 backdrop-blur-xl border-white/10 shadow-2xl p-0 overflow-hidden flex flex-col max-h-[90dvh]">
        <div className={cn(
           "p-4 md:p-8 pb-4 border-b border-white/5 flex-shrink-0",
           isHero ? "bg-primary/5" : "bg-white/5"
        )}>
          <DialogHeader>
            <DialogTitle className="flex flex-col items-center gap-2 md:gap-4">
              <div className="relative w-32 h-32 md:w-64 md:h-64 rounded-full overflow-hidden bg-primary/10 border-4 border-primary/40 shadow-[0_0_30px_rgba(59,130,246,0.3)] flex items-center justify-center">
                  {member.link ? (
                     <Image src={member.link} alt={member.name} layout="fill" objectFit="cover" />
                  ) : (
                     <span className="text-6xl md:text-8xl font-bold text-primary/70">{getInitials(member.name)}</span>
                  )}
              </div>
              <div className="flex flex-col items-center text-center mt-2">
                <span className="text-xl md:text-2xl font-black tracking-wider uppercase drop-shadow-md">{member.name}</span>
                <span className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1 bg-primary/10 px-3 py-1 rounded-full border border-primary/20">{member.part}</span>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto space-y-1.5 custom-scrollbar min-h-0">
           {totalSongs === 0 ? (
              <div className="p-6 text-center">
                 <span className="text-muted-foreground font-medium italic">As a conductor, you oversee the choir's progress!</span>
              </div>
           ) : (
              member.songs.map((song) => (
                 <div key={song.name} className={cn(
                    "flex items-center gap-3 p-3 rounded-lg transition-colors border",
                    song.completed ? "bg-primary/5 border-primary/20" : "border-transparent opacity-60"
                 )}>
                    {song.completed ? (
                       <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    ) : (
                       <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    )}
                    <span className={cn(
                       "text-sm font-bold tracking-wide uppercase",
                       song.completed ? "text-foreground" : "text-muted-foreground"
                    )}>
                       {song.name}
                    </span>
                 </div>
              ))
           )}
        </div>
        
        {/* Sticky Footer with a clear Close button */}
        <div className="p-4 border-t border-white/5 bg-black/40 flex justify-center flex-shrink-0">
           <DialogClose asChild>
              <button className="px-8 py-2.5 bg-secondary/20 hover:bg-secondary/40 text-muted-foreground hover:text-foreground font-bold tracking-widest uppercase rounded-lg border border-white/10 transition-all">
                 Close
              </button>
           </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}
