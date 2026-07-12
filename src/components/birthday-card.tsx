"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Image from "next/image";
import { PartyPopper, Facebook, Instagram, Share2, Loader2 } from "lucide-react";
import type { Member } from "@/lib/types";
import { useRef, useState } from "react";
import { toJpeg } from "html-to-image";
import { useToast } from "@/hooks/use-toast";

const getInitials = (name: string) => {
  if (!name) return "";
  const names = name.split(' ');
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`;
  }
  return name.substring(0, 2);
};

export function BirthdayCard({ member, isCurrentUser = false }: { member: Member, isCurrentUser?: boolean }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();

  const handleShare = async (platform?: 'whatsapp' | 'instagram' | 'facebook' | 'native') => {
    if (!cardRef.current) return;
    try {
      setIsSharing(true);
      toast({
        title: "Preparing Image...",
        description: "Generating 1080x1350px image for your story.",
      });

      const node = cardRef.current;
      const targetWidth = 1080;
      const targetHeight = 1620;
      const scale = targetWidth / node.offsetWidth;

      // We use a filter to exclude the share buttons container
      const dataUrl = await toJpeg(node, {
        quality: 1.0,
        pixelRatio: scale,
        style: {
          margin: '0',
          padding: '0',
        },
        filter: (n) => {
          if (n instanceof HTMLElement && n.classList.contains('share-buttons-container')) {
            return false;
          }
          return true;
        },
      });

      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `Happy-Birthday-${member.name.replace(/\s+/g, '-')}.jpg`, { type: 'image/jpeg' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Happy Birthday!',
          text: `Happy Birthday ${member.name}! 🎉`,
        });
      } else {
        // Fallback for browsers that don't support file sharing
        const link = document.createElement('a');
        link.download = `Happy-Birthday-${member.name.replace(/\s+/g, '-')}.jpg`;
        link.href = dataUrl;
        link.click();
        toast({
          title: "Image Downloaded!",
          description: "Your browser doesn't support direct sharing, so we saved it to your device.",
        });
      }

    } catch (e) {
      console.error(e);
      toast({
        title: "Something went wrong",
        description: "Failed to generate the image.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  if (!member) return null;

  const getThemeClasses = () => {
     const part = (member.part || '').toUpperCase();
     const desig = (member.designation || '').toUpperCase();
     
     if (part.includes('CONDUCTOR') || desig.includes('CONDUCTOR')) {
         return {
             text: "text-blue-500/90",
             border: "border-blue-500/20",
             borderStrong: "border-blue-500/30",
             shadow: "shadow-[0_0_30px_rgba(59,130,246,0.2)]",
             badgeBg: "bg-blue-500/10",
             gradientFrom: "from-blue-500/15",
             avatarBg: "bg-blue-500/5",
             textOpacity: "text-blue-500/70"
         };
     }
     if (part.includes('SOPRANO')) {
         return {
             text: "text-rose-400/90",
             border: "border-rose-400/20",
             borderStrong: "border-rose-400/30",
             shadow: "shadow-[0_0_30px_rgba(251,113,133,0.2)]",
             badgeBg: "bg-rose-400/10",
             gradientFrom: "from-rose-400/15",
             avatarBg: "bg-rose-400/5",
             textOpacity: "text-rose-400/70"
         };
     }
     if (part.includes('CONTRALTO')) {
         return {
             text: "text-purple-400/90",
             border: "border-purple-400/20",
             borderStrong: "border-purple-400/30",
             shadow: "shadow-[0_0_30px_rgba(192,132,252,0.2)]",
             badgeBg: "bg-purple-400/10",
             gradientFrom: "from-purple-400/15",
             avatarBg: "bg-purple-400/5",
             textOpacity: "text-purple-400/70"
         };
     }
     if (part.includes('TENOR')) {
         return {
             text: "text-slate-300/90",
             border: "border-slate-300/20",
             borderStrong: "border-slate-300/30",
             shadow: "shadow-[0_0_30px_rgba(203,213,225,0.2)]",
             badgeBg: "bg-slate-300/10",
             gradientFrom: "from-slate-300/15",
             avatarBg: "bg-slate-300/5",
             textOpacity: "text-slate-300/70"
         };
     }
     if (part.includes('BASS')) {
         return {
             text: "text-emerald-500/90",
             border: "border-emerald-500/20",
             borderStrong: "border-emerald-500/30",
             shadow: "shadow-[0_0_30px_rgba(16,185,129,0.2)]",
             badgeBg: "bg-emerald-500/10",
             gradientFrom: "from-emerald-500/15",
             avatarBg: "bg-emerald-500/5",
             textOpacity: "text-emerald-500/70"
         };
     }
     return {
         text: "text-yellow-500/90",
         border: "border-yellow-500/20",
         borderStrong: "border-yellow-500/30",
         shadow: "shadow-[0_0_30px_rgba(234,179,8,0.2)]",
         badgeBg: "bg-yellow-500/10",
         gradientFrom: "from-yellow-500/15",
         avatarBg: "bg-yellow-500/5",
         textOpacity: "text-yellow-500/70"
     };
  };

  const t = getThemeClasses();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="w-full mb-8 cursor-pointer bg-gradient-to-r from-fuchsia-500/10 to-pink-500/10 border-fuchsia-500/30 hover:border-fuchsia-500/50 shadow-[0_0_15px_rgba(217,70,239,0.1)] transition-all duration-300 group overflow-hidden">
          <CardContent className="p-4 flex items-center justify-center gap-3 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <PartyPopper className="w-6 h-6 text-fuchsia-400 group-hover:scale-125 transition-transform duration-500 group-hover:animate-bounce" />
            <span className="font-black uppercase tracking-widest text-fuchsia-400 drop-shadow-[0_0_10px_rgba(217,70,239,0.5)] z-10 text-sm md:text-base">
              {isCurrentUser ? "It's your Birthday!" : `It's ${member.name}'s Birthday!`}
            </span>
            <PartyPopper className="w-6 h-6 text-pink-400 group-hover:scale-125 transition-transform duration-500 group-hover:animate-bounce" />
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="w-[90vw] max-w-[400px] aspect-[2/3] p-0 border-none bg-transparent shadow-none overflow-hidden flex flex-col">
        <div ref={cardRef} className="relative w-full h-full bg-gradient-to-br from-zinc-950 to-zinc-900 border border-zinc-800 shadow-2xl flex flex-col rounded-3xl overflow-hidden">
          <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] ${t.gradientFrom} via-transparent to-transparent pointer-events-none`} />
          
          <div className="relative z-10 flex flex-col items-center justify-center h-full pt-8 pb-6 w-full">
            <Badge className={`mb-4 ${t.badgeBg} ${t.text} ${t.border} font-semibold tracking-[0.2em] uppercase text-[10px]`}>
            BCM CHOIR 2025-2029
          </Badge>

          <div className="flex flex-col items-center mb-1 leading-tight mt-0 gap-0">
               <span className={`font-vibes text-3xl md:text-4xl ${t.text} drop-shadow-md font-normal`}>
                 Happy
               </span>
               <span className={`font-vibes text-3xl md:text-4xl ${t.text} drop-shadow-md font-normal`}>
                 Birthday
               </span>
          </div>
          
          <DialogTitle className="sr-only">Happy Birthday</DialogTitle>
          <div className="flex flex-col items-center gap-2 z-20 mt-2">
            <div className={`relative w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden border-2 ${t.borderStrong} ${t.shadow} flex items-center justify-center ${t.avatarBg}`}>
              {member.link ? (
                 <Image src={member.link} alt={member.name} layout="fill" objectFit="cover" crossOrigin="anonymous" />
              ) : (
                 <span className={`text-4xl font-bold opacity-70 ${t.textOpacity}`}>
                   {getInitials(member.name)}
                 </span>
              )}
            </div>

            <div className="text-center mt-1 flex flex-col items-center w-full">
              <h2 className="text-base md:text-lg font-black uppercase tracking-widest text-zinc-100 drop-shadow-md">
                {member.name}
              </h2>
              <div className="flex items-center justify-center gap-2 mt-1">
                <Badge variant="outline" className="border-white/10 text-zinc-400 uppercase tracking-widest font-medium text-[10px]">
                  {member.part || member.designation || 'Member'}
                </Badge>
                {member.designation && member.designation.toUpperCase() !== (member.part || '').toUpperCase() && (
                  <Badge variant="outline" className="border-white/10 text-zinc-400 uppercase tracking-widest font-medium text-[10px]">
                    {member.designation}
                  </Badge>
                )}
              </div>
              {member.kohhran && (
                <div className="mt-1 flex flex-col items-center gap-0">
                  <p className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase">
                    {member.kohhran}
                  </p>
                </div>
              )}
              
              <div className="share-buttons-container flex items-center justify-center gap-6 mt-6 pt-4 border-t border-white/5 w-full relative z-50">
                 <button disabled={isSharing} onClick={() => handleShare('whatsapp')} className="p-3 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-[#25D366]/20 hover:border-[#25D366]/50 transition-colors group z-50 cursor-pointer pointer-events-auto">
                    <svg className="w-6 h-6 text-[#25D366] group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                       <path d="M12.031 21.172a9.13 9.13 0 0 1-4.664-1.272l-5.07.135 1.34-4.945a9.123 9.123 0 0 1-1.233-4.636c0-5.04 4.092-9.132 9.132-9.132 5.04 0 9.132 4.092 9.132 9.132 0 5.04-4.092 9.132-9.132 9.132zm0-16.732a7.6 7.6 0 0 0-7.6 7.6c0 1.631.516 3.167 1.419 4.444l-.841 3.104 3.175-.833a7.587 7.587 0 0 0 3.847 1.042c4.191 0 7.6-3.41 7.6-7.6a7.6 7.6 0 0 0-7.6-7.6zm4.181 10.371c-.228-.114-1.353-.668-1.563-.746-.21-.077-.363-.114-.515.114-.153.228-.592.746-.725.898-.134.153-.267.172-.496.058-.228-.114-.967-.356-1.843-1.137-.682-.609-1.143-1.36-1.276-1.59-.134-.228-.014-.353.1-.466.103-.103.228-.267.343-.4.114-.134.153-.228.228-.381.077-.153.038-.287-.019-.4-.058-.114-.515-1.242-.705-1.7-.186-.445-.375-.386-.515-.393-.134-.007-.287-.007-.44-.007a.846.846 0 0 0-.61.287c-.21.228-.802.784-.802 1.912 0 1.127.822 2.217.936 2.37.114.153 1.616 2.469 3.914 3.46.547.237.974.379 1.306.485.55.176 1.05.151 1.444.092.441-.067 1.353-.553 1.544-1.088.191-.536.191-.994.134-1.088-.057-.094-.21-.151-.439-.265z" />
                    </svg>
                 </button>
                 <button disabled={isSharing} onClick={() => handleShare('native')} className="p-3 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors group z-50 cursor-pointer pointer-events-auto">
                    {isSharing ? <Loader2 className="w-6 h-6 text-zinc-300 animate-spin" /> : <Share2 className="w-6 h-6 text-zinc-300 group-hover:scale-110 transition-transform" />}
                 </button>
              </div>
            </div>
          </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
