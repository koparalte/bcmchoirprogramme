"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ProgressMember, BibleVerse } from "@/lib/types";
import { CheckCircle2, Circle, ExternalLink, Quote } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useState, useMemo, useTransition, useEffect } from "react";
import { updateMemberProgress } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

const getInitials = (name: string) => {
  if (!name) return "";
  const names = name.split(' ');
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`;
  }
  return name.substring(0, 2);
}

export function ProgressCard({ member, isHero = false, theme = 'default', bibleVerse, isConductor = false }: { member: ProgressMember, isHero?: boolean, theme?: 'default' | 'red' | 'purple', bibleVerse?: BibleVerse, isConductor?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  // Local state for interactive ticking
  const [localSongs, setLocalSongs] = useState(member.songs);
  
  // Reset local state when dialog opens or member data changes
  useEffect(() => {
     setLocalSongs(member.songs);
  }, [member.songs, isOpen]);

  // Check if there are unsaved changes
  const hasChanges = useMemo(() => {
     return localSongs.some((localSong, i) => localSong.completed !== member.songs[i]?.completed);
  }, [localSongs, member.songs]);

  const handleToggle = (songName: string, currentStatus: boolean) => {
    if (!isConductor) return;
    setLocalSongs(prev => prev.map(s => s.name === songName ? { ...s, completed: !currentStatus } : s));
  };

  const handleSave = () => {
     if (!isConductor || !hasChanges) return;

     const updates: Record<string, boolean> = {};
     localSongs.forEach((localSong, i) => {
        if (localSong.completed !== member.songs[i]?.completed) {
           updates[localSong.name] = localSong.completed;
        }
     });

     startTransition(async () => {
       const result = await updateMemberProgress(
          "https://docs.google.com/spreadsheets/d/1kMlHvUW0fR-yQDKDxvV1ONErRItvVSTMRzH8IngA-QE/edit?usp=sharing",
          member.name,
          updates
       );
       
       if (result.error) {
          toast({
             title: "Save Failed",
             description: result.error,
             variant: "destructive"
          });
       } else {
          toast({
             title: "Progress Saved!",
             description: `Successfully updated songs for ${member.name}.`,
          });
          setIsOpen(false);
       }
    });
  };

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

  const partUpper = (member.part || 'CONDUCTOR').toUpperCase();
  const designationUpper = (member.designation || '').toUpperCase();
  
  // Default to slate/gray if no part matched
  let heroTheme = {
      cardBorder: "border-slate-500/50 shadow-[0_0_30px_rgba(100,116,139,0.2)]",
      bgGradient: "from-slate-500/20 via-slate-500/5",
      borderB: "border-slate-500/20",
      avatarBg: "bg-slate-500/10",
      avatarBorder: "border-slate-500/30",
      avatarShadow: "shadow-[0_0_20px_rgba(100,116,139,0.3)]",
      textPrimary: "text-slate-500",
      textPrimaryHover: "group-hover:text-slate-500",
      badgeBg: "bg-slate-500/10 border-slate-500/20",
      dropShadow: "drop-shadow-[0_0_15px_rgba(100,116,139,0.4)]",
      bibleBorder: "border-slate-500/20",
      bibleQuote: "text-slate-500/20",
      bibleText: "text-slate-500/90",
      bibleBadgeText: "text-slate-500/80",
      dialogBg: "bg-slate-500/5"
  };

  if (partUpper.includes('CONDUCTOR') || designationUpper.includes('CONDUCTOR')) {
      // All Conductors (Main and Asst) get Blue
      heroTheme = {
          cardBorder: "border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.2)]",
          bgGradient: "from-blue-500/20 via-blue-500/5",
          borderB: "border-blue-500/20",
          avatarBg: "bg-blue-500/10",
          avatarBorder: "border-blue-500/30",
          avatarShadow: "shadow-[0_0_20px_rgba(59,130,246,0.3)]",
          textPrimary: "text-blue-500",
          textPrimaryHover: "group-hover:text-blue-500",
          badgeBg: "bg-blue-500/10 border-blue-500/20",
          dropShadow: "drop-shadow-[0_0_15px_rgba(59,130,246,0.4)]",
          bibleBorder: "border-blue-500/20",
          bibleQuote: "text-blue-500/20",
          bibleText: "text-blue-500/90",
          bibleBadgeText: "text-blue-500/80",
          dialogBg: "bg-blue-500/5"
      };
  } else if (partUpper.includes('CONDUCTOR')) {
      // Main Conductor gets a higher priority color (Gold/Amber)
      heroTheme = {
          cardBorder: "border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.2)]",
          bgGradient: "from-amber-500/20 via-amber-500/5",
          borderB: "border-amber-500/20",
          avatarBg: "bg-amber-500/10",
          avatarBorder: "border-amber-500/30",
          avatarShadow: "shadow-[0_0_20px_rgba(245,158,11,0.3)]",
          textPrimary: "text-amber-500",
          textPrimaryHover: "group-hover:text-amber-500",
          badgeBg: "bg-amber-500/10 border-amber-500/20",
          dropShadow: "drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]",
          bibleBorder: "border-amber-500/20",
          bibleQuote: "text-amber-500/20",
          bibleText: "text-amber-500/90",
          bibleBadgeText: "text-amber-500/80",
          dialogBg: "bg-amber-500/5"
      };
  } else if (partUpper.includes('SOPRANO')) {
      heroTheme = {
          cardBorder: "border-rose-400/50 shadow-[0_0_30px_rgba(251,113,133,0.2)]",
          bgGradient: "from-rose-400/20 via-rose-400/5",
          borderB: "border-rose-400/20",
          avatarBg: "bg-rose-400/10",
          avatarBorder: "border-rose-400/30",
          avatarShadow: "shadow-[0_0_20px_rgba(251,113,133,0.3)]",
          textPrimary: "text-rose-400",
          textPrimaryHover: "group-hover:text-rose-400",
          badgeBg: "bg-rose-400/10 border-rose-400/20",
          dropShadow: "drop-shadow-[0_0_15px_rgba(251,113,133,0.4)]",
          bibleBorder: "border-rose-400/20",
          bibleQuote: "text-rose-400/20",
          bibleText: "text-rose-400/90",
          bibleBadgeText: "text-rose-400/80",
          dialogBg: "bg-rose-400/5"
      };
  } else if (partUpper.includes('CONTRALTO')) {
      heroTheme = {
          cardBorder: "border-purple-400/50 shadow-[0_0_30px_rgba(192,132,252,0.2)]",
          bgGradient: "from-purple-400/20 via-purple-400/5",
          borderB: "border-purple-400/20",
          avatarBg: "bg-purple-400/10",
          avatarBorder: "border-purple-400/30",
          avatarShadow: "shadow-[0_0_20px_rgba(192,132,252,0.3)]",
          textPrimary: "text-purple-400",
          textPrimaryHover: "group-hover:text-purple-400",
          badgeBg: "bg-purple-400/10 border-purple-400/20",
          dropShadow: "drop-shadow-[0_0_15px_rgba(192,132,252,0.4)]",
          bibleBorder: "border-purple-400/20",
          bibleQuote: "text-purple-400/20",
          bibleText: "text-purple-400/90",
          bibleBadgeText: "text-purple-400/80",
          dialogBg: "bg-purple-400/5"
      };
  } else if (partUpper.includes('TENOR')) {
      heroTheme = {
          cardBorder: "border-slate-300/50 shadow-[0_0_30px_rgba(203,213,225,0.2)]",
          bgGradient: "from-slate-300/20 via-slate-300/5",
          borderB: "border-slate-300/20",
          avatarBg: "bg-slate-300/10",
          avatarBorder: "border-slate-300/30",
          avatarShadow: "shadow-[0_0_20px_rgba(203,213,225,0.3)]",
          textPrimary: "text-slate-300",
          textPrimaryHover: "group-hover:text-slate-300",
          badgeBg: "bg-slate-300/10 border-slate-300/20",
          dropShadow: "drop-shadow-[0_0_15px_rgba(203,213,225,0.4)]",
          bibleBorder: "border-slate-300/20",
          bibleQuote: "text-slate-300/20",
          bibleText: "text-slate-300/90",
          bibleBadgeText: "text-slate-300/80",
          dialogBg: "bg-slate-300/5"
      };
  } else if (partUpper.includes('BASS')) {
      heroTheme = {
          cardBorder: "border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)]",
          bgGradient: "from-emerald-500/20 via-emerald-500/5",
          borderB: "border-emerald-500/20",
          avatarBg: "bg-emerald-500/10",
          avatarBorder: "border-emerald-500/30",
          avatarShadow: "shadow-[0_0_20px_rgba(16,185,129,0.3)]",
          textPrimary: "text-emerald-500",
          textPrimaryHover: "group-hover:text-emerald-500",
          badgeBg: "bg-emerald-500/10 border-emerald-500/20",
          dropShadow: "drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]",
          bibleBorder: "border-emerald-500/20",
          bibleQuote: "text-emerald-500/20",
          bibleText: "text-emerald-500/90",
          bibleBadgeText: "text-emerald-500/80",
          dialogBg: "bg-emerald-500/5"
      };
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className={cn(
           "bg-card border transition-all duration-500 rounded-2xl overflow-hidden group h-full flex flex-col cursor-pointer",
           isHero 
             ? `${heroTheme.cardBorder} md:col-span-2 xl:col-span-3 scale-[1.02] z-10 my-4` 
             : t.cardBorder
        )}>
           <CardContent className="p-0 flex flex-col h-full">
               <div className={cn(
                  "flex relative overflow-hidden flex-shrink-0 h-full",
                  isHero 
                    ? `flex-col items-center justify-center text-center p-8 md:p-10 pb-6 md:pb-8 gap-4 md:gap-6 bg-gradient-to-br ${heroTheme.bgGradient} to-transparent border-b ${heroTheme.borderB}` 
                    : `flex-row items-center p-6 pb-4 gap-4 border-b ${t.bgGradient} ${t.borderB}`
               )}>
                  {isHero && (
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center p-2 opacity-[0.03] pointer-events-none flex justify-center overflow-hidden">
                        <span className={cn(
                           "leading-none font-black italic tracking-tighter whitespace-nowrap",
                           (designationUpper || partUpper).length > 8 
                             ? "text-[3.5rem] sm:text-[5rem] md:text-[7rem] lg:text-[8rem]" 
                             : "text-[5rem] sm:text-[6rem] md:text-[9rem] lg:text-[10rem]"
                        )}>
                           {designationUpper || partUpper}
                        </span>
                     </div>
                  )}
                  {/* Progress Bar background hint */}
                  <div 
                    className="absolute bottom-0 left-0 h-1 bg-emerald-500/50 transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                    style={{ width: `${progressPercent}%` }}
                  />
                  
                  <div className={cn(
                      "relative rounded-full overflow-hidden flex-shrink-0 border flex items-center justify-center z-10",
                      isHero ? `${heroTheme.avatarBg} ${heroTheme.avatarBorder} w-24 h-24 md:w-32 md:h-32 border-2 ${heroTheme.avatarShadow}` : `w-16 h-16 ${t.avatarBg} ${t.avatarBorder}`
                   )}>
                     {member.link ? (
                       <Image 
                         src={member.link} 
                         alt={member.name} 
                         layout="fill" 
                         objectFit="cover" 
                       />
                     ) : (
                       <span className={cn("font-bold", isHero ? `${heroTheme.textPrimary} opacity-70 text-4xl md:text-5xl` : `text-xl ${t.initialsText}`)}>{getInitials(member.name)}</span>
                     )}
                  </div>
                  
                  <div className={cn("z-10", isHero ? "flex flex-col items-center" : "flex-grow")}>
                     <h3 className={cn("font-semibold tracking-wider uppercase text-foreground", isHero ? `text-2xl md:text-4xl ${heroTheme.textPrimary} ${heroTheme.dropShadow}` : "text-lg")}>
                        {isHero ? (
                           <div className="flex flex-col items-center gap-1">
                              <span className="text-sm md:text-base text-muted-foreground/80 lowercase tracking-widest font-medium">Welcome,</span>
                              <span>{member.name}</span>
                           </div>
                        ) : member.name}
                     </h3>
                     <div className={cn("flex items-center gap-2 mt-2", isHero ? "justify-center mt-4" : "")}>
                        <Badge variant="secondary" className={cn("font-bold tracking-widest uppercase text-[10px] px-2 py-0.5 rounded-sm border", isHero ? `${heroTheme.badgeBg} ${heroTheme.textPrimary}` : t.badgeBg)}>
                           {member.designation || member.part}
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
                     <div className={cn("mt-4 md:mt-2 p-4 md:p-6 bg-black/40 backdrop-blur-md rounded-xl border w-full max-w-2xl relative overflow-hidden z-10 shadow-lg", heroTheme.bibleBorder)}>
                        <Quote className={cn("absolute top-3 left-3 w-8 h-8 rotate-180", heroTheme.bibleQuote)} />
                        <p className={cn("text-base md:text-lg font-serif italic leading-relaxed drop-shadow-sm px-4 pt-2", heroTheme.bibleText)}>
                           "{bibleVerse.text}"
                        </p>
                        <div className="mt-4 text-right">
                           <span className={cn("inline-block text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full border", heroTheme.bibleBadgeText, heroTheme.badgeBg)}>
                              {bibleVerse.verse}
                           </span>
                        </div>
                     </div>
                  )}

                  <div className={cn("text-muted-foreground transition-colors z-10", isHero ? `absolute top-6 right-6 opacity-0 group-hover:opacity-100 ${heroTheme.textPrimaryHover}` : `flex-shrink-0 ${t.iconHover}`)}>
                     <ExternalLink className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </div>
               </div>
           </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-md bg-card/95 backdrop-blur-xl border-white/10 shadow-2xl p-0 overflow-hidden flex flex-col max-h-[90dvh]">
        <div className={cn(
           "p-4 md:p-8 pb-4 border-b border-white/5 flex-shrink-0",
           isHero ? heroTheme.dialogBg : "bg-white/5"
        )}>
          <DialogHeader>
            <DialogTitle className="flex flex-col items-center gap-2 md:gap-4">
              <div className={cn("relative w-32 h-32 md:w-64 md:h-64 rounded-full overflow-hidden border-4 flex items-center justify-center", isHero ? `${heroTheme.avatarBg} ${heroTheme.avatarBorder} ${heroTheme.avatarShadow}` : "bg-primary/10 border-primary/40 shadow-[0_0_30px_rgba(59,130,246,0.3)]")}>
                  {member.link ? (
                     <Image src={member.link} alt={member.name} layout="fill" objectFit="cover" />
                  ) : (
                     <span className={cn("text-6xl md:text-8xl font-bold opacity-70", isHero ? heroTheme.textPrimary : "text-primary")}>{getInitials(member.name)}</span>
                  )}
              </div>
              <div className="flex flex-col items-center text-center mt-2">
                <span className="text-xl md:text-2xl font-black tracking-wider uppercase drop-shadow-md">{member.name}</span>
                <span className={cn("text-[10px] font-bold uppercase tracking-widest mt-1 px-3 py-1 rounded-full border", isHero ? `${heroTheme.badgeBg} ${heroTheme.textPrimary}` : "bg-primary/10 text-primary border-primary/20")}>{member.part}</span>
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
              localSongs.map((song) => (
                 <button 
                    key={song.name} 
                    onClick={() => handleToggle(song.name, song.completed)}
                    disabled={!isConductor || isPending}
                    className={cn(
                       "w-full flex items-center gap-3 p-3 rounded-lg transition-all border text-left",
                       song.completed ? "bg-primary/5 border-primary/20" : "border-transparent opacity-60",
                       isConductor ? "cursor-pointer hover:bg-white/10 hover:opacity-100 active:scale-[0.98]" : "cursor-default",
                       isPending ? "opacity-50 pointer-events-none" : ""
                    )}
                 >
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
                 </button>
              ))
           )}
        </div>
        
        {/* Sticky Footer with Save (for conductors) and Close buttons */}
        <div className="p-4 border-t border-white/5 bg-black/40 flex justify-center gap-4 flex-shrink-0">
           <DialogClose asChild>
              <button disabled={isPending} className="px-8 py-2.5 bg-secondary/20 hover:bg-secondary/40 text-muted-foreground hover:text-foreground font-bold tracking-widest uppercase rounded-lg border border-white/10 transition-all">
                 Close
              </button>
           </DialogClose>
           {isConductor && (
              <button 
                 disabled={!hasChanges || isPending}
                 onClick={handleSave}
                 className={cn(
                    "px-8 py-2.5 font-bold tracking-widest uppercase rounded-lg border transition-all",
                    hasChanges && !isPending
                       ? "bg-primary/20 hover:bg-primary/30 text-primary border-primary/40 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                       : "bg-primary/5 text-primary/40 border-primary/10 cursor-not-allowed"
                 )}
              >
                 {isPending ? "Saving..." : "Save"}
              </button>
           )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
