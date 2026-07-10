"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ProgressMember, BibleVerse } from "@/lib/types";
import { CheckCircle2, Circle, ExternalLink, Quote } from "lucide-react";
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

export function ProgressCard({ member, isHero = false, theme = 'default', bibleVerse }: { member: ProgressMember, isHero?: boolean, theme?: 'default' | 'red' | 'purple', bibleVerse?: BibleVerse }) {
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

  const themeConfig = {
     default: {
        cardBorder: "border-white/5 hover:border-primary/20",
        bgGradient: "bg-gradient-to-br from-primary/5 to-transparent",
        borderB: "border-white/5",
        avatarBg: "bg-primary/10",
        avatarBorder: "border-primary/20",
        initialsText: "text-primary/70",
        badgeBg: "bg-primary/10 text-primary border-primary/20",
        iconHover: "group-hover:text-primary",
     },
     red: {
        cardBorder: "border-red-500/30 hover:border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.15)]",
        bgGradient: "bg-gradient-to-br from-red-500/20 via-red-500/5 to-transparent",
        borderB: "border-red-500/20",
        avatarBg: "bg-red-500/10",
        avatarBorder: "border-red-500/30",
        initialsText: "text-red-500/70",
        badgeBg: "bg-red-500/10 text-red-500 border-red-500/30",
        iconHover: "group-hover:text-red-500",
     },
     purple: {
        cardBorder: "border-purple-500/30 hover:border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)]",
        bgGradient: "bg-gradient-to-br from-purple-500/20 via-purple-500/5 to-transparent",
        borderB: "border-purple-500/20",
        avatarBg: "bg-purple-500/10",
        avatarBorder: "border-purple-500/30",
        initialsText: "text-purple-500/70",
        badgeBg: "bg-purple-500/10 text-purple-500 border-purple-500/30",
        iconHover: "group-hover:text-purple-500",
     }
  };

  const t = themeConfig[theme];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className={cn(
           "bg-card border transition-all duration-500 rounded-2xl overflow-hidden group h-full flex flex-col cursor-pointer",
           isHero 
             ? "border-primary/50 shadow-[0_0_30px_rgba(59,130,246,0.2)] md:col-span-2 xl:col-span-3 scale-[1.02] z-10 my-4" 
             : t.cardBorder
        )}>
           <CardContent className="p-0 flex flex-col h-full">
               <div className={cn(
                  "flex relative overflow-hidden flex-shrink-0 h-full",
                  isHero 
                    ? "flex-col items-center justify-center text-center p-8 md:p-10 pb-6 md:pb-8 gap-4 md:gap-6 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border-b border-primary/20" 
                    : `flex-row items-center p-6 pb-4 gap-4 border-b ${t.bgGradient} ${t.borderB}`
               )}>
                  {isHero && (
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-3 opacity-[0.03] pointer-events-none w-full text-center">
                        <span className="text-[8rem] md:text-[12rem] leading-none font-black italic tracking-tighter">YOU</span>
                     </div>
                  )}
                  {/* Progress Bar background hint */}
                  <div 
                    className="absolute bottom-0 left-0 h-1 bg-emerald-500/50 transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                    style={{ width: `${progressPercent}%` }}
                  />
                  
                  <div className={cn(
                      "relative rounded-full overflow-hidden flex-shrink-0 border flex items-center justify-center z-10",
                      isHero ? "bg-primary/10 border-primary/20 w-24 h-24 md:w-32 md:h-32 border-2 shadow-[0_0_20px_rgba(59,130,246,0.3)]" : `w-16 h-16 ${t.avatarBg} ${t.avatarBorder}`
                   )}>
                     {member.link ? (
                       <Image 
                         src={member.link} 
                         alt={member.name} 
                         layout="fill" 
                         objectFit="cover" 
                       />
                     ) : (
                       <span className={cn("font-bold", isHero ? "text-primary/70 text-4xl md:text-5xl" : `text-xl ${t.initialsText}`)}>{getInitials(member.name)}</span>
                     )}
                  </div>
                  
                  <div className={cn("z-10", isHero ? "flex flex-col items-center" : "flex-grow")}>
                     <h3 className={cn("font-semibold tracking-wider uppercase text-foreground", isHero ? "text-2xl md:text-4xl text-primary drop-shadow-[0_0_15px_rgba(59,130,246,0.4)]" : "text-lg")}>
                        {isHero ? (
                           <div className="flex flex-col items-center gap-1">
                              <span className="text-sm md:text-base text-muted-foreground/80 lowercase tracking-widest font-medium">Welcome,</span>
                              <span>{member.name}</span>
                           </div>
                        ) : member.name}
                     </h3>
                     <div className={cn("flex items-center gap-2 mt-2", isHero ? "justify-center mt-4" : "")}>
                        <Badge variant="secondary" className={cn("font-bold tracking-widest uppercase text-[10px] px-2 py-0.5 rounded-sm border", isHero ? "bg-primary/10 text-primary border-primary/20" : t.badgeBg)}>
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

                  {isHero && bibleVerse && (
                     <div className="mt-4 md:mt-2 p-4 md:p-6 bg-black/40 backdrop-blur-md rounded-xl border border-primary/20 w-full max-w-2xl relative overflow-hidden z-10 shadow-lg">
                        <Quote className="absolute top-3 left-3 w-8 h-8 text-primary/10 rotate-180" />
                        <p className="text-base md:text-lg text-primary/90 font-serif italic leading-relaxed drop-shadow-sm px-4 pt-2">
                           "{bibleVerse.text}"
                        </p>
                        <div className="mt-4 text-right">
                           <span className="inline-block text-xs font-bold tracking-widest uppercase text-primary/80 bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                              {bibleVerse.verse}
                           </span>
                        </div>
                     </div>
                  )}

                  <div className={cn("text-muted-foreground transition-colors z-10", isHero ? "absolute top-6 right-6 opacity-0 group-hover:opacity-100 group-hover:text-primary" : `flex-shrink-0 ${t.iconHover}`)}>
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
