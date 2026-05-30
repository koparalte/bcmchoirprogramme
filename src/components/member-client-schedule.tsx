

"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import type { Member, Banner } from "@/lib/types";
import { MemberCard } from "./member-card";
import { MemberDetailsDialog } from "./member-details-dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";

const groupMembersByPart = (members: Member[]) => {
  const grouped = members.reduce((acc, member) => {
    const part = member.part?.trim() || "Unassigned";
    if (!acc[part]) {
      acc[part] = [];
    }
    acc[part].push(member);
    return acc;
  }, {} as Record<string, Member[]>);

  const partOrder = ['Conductor', 'Soprano', 'Contralto', 'Tenor', 'Bass'];
  const sortedParts = Object.keys(grouped).sort((a, b) => {
    const indexA = partOrder.indexOf(a);
    const indexB = partOrder.indexOf(b);

    if (a === 'Conductor') return -1;
    if (b === 'Conductor') return 1;

    if (indexA > -1 && indexB > -1) return indexA - indexB;
    if (indexA > -1) return -1;
    if (indexB > -1) return 1;
    if (a === 'Unassigned') return 1;
    if (b === 'Unassigned') return -1;
    return a.localeCompare(b);
  });

  const sortedGrouped: Record<string, Member[]> = {};
  for (const part of sortedParts) {
    if (part !== 'Unassigned') {
      sortedGrouped[part] = grouped[part];
    }
  }

  return sortedGrouped;
};

export function MemberClientSchedule({ members, banners }: { members: Member[], banners?: Banner[] }) {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  
  const containerRef = useRef(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start']
  });

  const bannerY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  const resetTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (banners && banners.length > 1) {
      timerRef.current = setInterval(() => {
        setCurrentBannerIndex((prevIndex) => (prevIndex + 1) % banners.length);
      }, 5000);
    }
  };

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [banners]);

  const nextImage = () => {
    if (banners) {
      setCurrentBannerIndex((prevIndex) => (prevIndex + 1) % banners.length);
      resetTimer();
    }
  };

  const prevImage = () => {
    if (banners) {
      setCurrentBannerIndex((prevIndex) => (prevIndex - 1 + banners.length) % banners.length);
      resetTimer();
    }
  };

  const downloadImage = () => {
    if (banners) {
        const imageUrl = banners[currentBannerIndex].url;
        // Open in new tab is a reliable fallback for cross-origin images
        window.open(imageUrl, '_blank');
    }
  };


  const handleSelectMember = (member: Member) => {
    setSelectedMember(member);
    setIsDialogOpen(true);
  };

  const groupedMembers = groupMembersByPart(members);
  const conductors = groupedMembers['Conductor'] || [];
  delete groupedMembers['Conductor'];

  const defaultOpen = Object.keys(groupedMembers);

  const hasBanner = banners && banners.length > 0;

  return (
    <div ref={containerRef} className="relative">
      {hasBanner && (
        <>
          <div className="relative h-[22rem] md:h-[28rem] w-full rounded-3xl border border-white/10 shadow-[0_0_4rem_-1rem_rgba(59,130,246,0.2)] overflow-hidden group mb-4 bg-black">
            <AnimatePresence initial={false}>
                <motion.div
                  key={currentBannerIndex}
                  className="h-full w-full absolute inset-0"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                    <motion.div className="h-full w-full relative" style={{ y: bannerY }}>
                        <Image
                          src={banners[currentBannerIndex].url}
                          alt={`Members Banner ${currentBannerIndex + 1}`}
                          fill
                          className="object-cover"
                          priority={currentBannerIndex === 0}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30" />
                    </motion.div>
                </motion.div>
            </AnimatePresence>

            {/* Title Overlay in Glassmorphism */}
            {banners[currentBannerIndex].name && (
                <div className="absolute bottom-6 left-6 z-20">
                    <div className="backdrop-blur-md bg-black/30 border border-white/10 px-4 py-2 rounded-full inline-flex items-center shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                        <p className="text-white font-headline tracking-[0.2em] text-[10px] md:text-xs font-bold uppercase">{banners[currentBannerIndex].name}</p>
                    </div>
                </div>
            )}

            {/* Pagination Dots */}
            {banners && banners.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20 items-center bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5">
                    {banners.map((_, idx) => (
                        <div 
                            key={idx} 
                            className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentBannerIndex ? 'w-6 bg-primary shadow-[0_0_10px_rgba(59,130,246,0.8)]' : 'w-1.5 bg-white/40 hover:bg-white cursor-pointer'}`}
                            onClick={() => {
                                setCurrentBannerIndex(idx);
                                resetTimer();
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Auto-play Progress Bar */}
            {banners && banners.length > 1 && (
              <motion.div 
                key={`progress-${currentBannerIndex}`}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 5, ease: "linear" }}
                className="absolute top-0 left-0 h-[3px] bg-primary shadow-[0_0_15px_rgba(59,130,246,1)] z-30"
              />
            )}

            {/* Navigation Arrows */}
            {banners && banners.length > 1 && (
                <>
                    <Button onClick={prevImage} variant="ghost" size="icon" className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 md:h-12 md:w-12 rounded-full backdrop-blur-md bg-black/20 border border-white/10 text-white hover:bg-black/50 hover:border-white/30 opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:translate-x-0 -translate-x-4 z-20">
                        <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
                    </Button>
                    <Button onClick={nextImage} variant="ghost" size="icon" className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 md:h-12 md:w-12 rounded-full backdrop-blur-md bg-black/20 border border-white/10 text-white hover:bg-black/50 hover:border-white/30 opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:translate-x-0 translate-x-4 z-20">
                        <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
                    </Button>
                </>
            )}
            
            {/* Download Button */}
             <Button onClick={downloadImage} variant="outline" size="sm" className="absolute top-6 right-6 backdrop-blur-md bg-black/20 text-white border-white/10 hover:bg-black/50 hover:border-white/30 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] rounded-full px-4 h-9 z-20">
                <Download className="mr-2 h-3.5 w-3.5" />
                <span className="text-xs tracking-wider uppercase font-bold">Download</span>
            </Button>
          </div>
          
          <div className="flex flex-col items-center justify-center mt-8 mb-12 opacity-60">
            <p className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-black mb-3">Scroll to explore</p>
            <div className="w-px h-10 bg-gradient-to-b from-primary via-primary/50 to-transparent animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
          </div>
        </>
      )}
      
      {conductors.length > 0 && (
        <div className="mb-6">
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {conductors.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                onSelectMember={handleSelectMember}
              />
            ))}
          </motion.div>
        </div>
      )}

      <Accordion type="multiple" defaultValue={defaultOpen} className="w-full space-y-4">
        {Object.entries(groupedMembers).map(([part, partMembers]) => (
          <AccordionItem value={part} key={part}>
            <AccordionTrigger className="text-2xl font-bold text-primary hover:no-underline capitalize">
              {part} ({partMembers.length})
            </AccordionTrigger>
            <AccordionContent>
              <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                {partMembers.map((member) => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    onSelectMember={handleSelectMember}
                  />
                ))}
              </motion.div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <MemberDetailsDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        member={selectedMember}
      />
    </div>
  );
}
