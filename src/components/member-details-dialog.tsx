"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { type Member } from "@/lib/types";
import { Church, Music, Phone, ChevronLeft, ChevronRight, Calendar, AlertCircle } from "lucide-react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

type MemberDetailsDialogProps = {
  member: Member | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 140 : -140,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (dir: number) => ({
    zIndex: 0,
    x: dir < 0 ? 140 : -140,
    opacity: 0,
    scale: 0.95,
  }),
};

export function MemberDetailsDialog({
  member,
  isOpen,
  onOpenChange,
}: MemberDetailsDialogProps) {
  const [[page, direction], setPage] = useState<[number, number]>([0, 0]);
  const [failedUrls, setFailedUrls] = useState<Record<string, boolean>>({});

  // Extract all non-empty photo links
  const photos = member
    ? ([member.link, member.link2, member.link3].filter(
        (url): url is string => typeof url === "string" && url.trim().length > 0
      ) as string[])
    : [];

  // Reset to first photo whenever the dialog opens or member changes
  useEffect(() => {
    if (isOpen) {
      setPage([0, 0]);
      setFailedUrls({});
    }
  }, [isOpen, member?.id]);

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
  };

  const getInitials = (name: string) => {
    const names = name.trim().split(" ");
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name.substring(0, 2);
  };

  const currentIndex =
    photos.length > 0
      ? ((page % photos.length) + photos.length) % photos.length
      : 0;

  const paginate = (newDirection: number) => {
    if (photos.length <= 1) return;
    setPage(([prevPage]) => [prevPage + newDirection, newDirection]);
  };

  const goToPhoto = (idx: number) => {
    if (idx === currentIndex) return;
    const newDirection = idx > currentIndex ? 1 : -1;
    setPage([idx, newDirection]);
  };

  return (
    <AnimatePresence>
      {isOpen && member && (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-border/60 bg-background/95 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <DialogHeader className="p-6 pb-4">
                <div className="flex flex-col items-center gap-3">
                  {/* Photo Frame Container */}
                  <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full overflow-hidden bg-muted flex items-center justify-center ring-4 ring-primary/20 shadow-2xl select-none group">
                    {photos.length === 0 ? (
                      <span className="text-8xl font-bold text-muted-foreground/60 select-none">
                        {getInitials(member.name)}
                      </span>
                    ) : photos.length === 1 ? (
                      <div className="relative w-full h-full">
                        {failedUrls[photos[0]] ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/80 p-4 text-center">
                            <AlertCircle className="w-8 h-8 text-amber-500 mb-1" />
                            <span className="text-xs font-semibold text-foreground">Photo unavailable</span>
                            <span className="text-[10px] text-muted-foreground mt-0.5 max-w-[180px]">Link requires public sharing permissions</span>
                          </div>
                        ) : (
                          <Image
                            src={photos[0]}
                            alt={member.name}
                            fill
                            unoptimized
                            referrerPolicy="no-referrer"
                            sizes="(max-width: 640px) 256px, 288px"
                            className="object-cover object-[center_20%] select-none pointer-events-none"
                            priority
                            onError={() => {
                              setFailedUrls(prev => ({ ...prev, [photos[0]]: true }));
                            }}
                          />
                        )}
                      </div>
                    ) : (
                      <>
                        <AnimatePresence initial={false} custom={direction}>
                          {(() => {
                            const slideIndex = ((page % photos.length) + photos.length) % photos.length;
                            const slideUrl = photos[slideIndex];
                            return (
                              <motion.div
                                key={page}
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{
                                  x: { type: "spring", stiffness: 300, damping: 30 },
                                  opacity: { duration: 0.2 },
                                }}
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={0.4}
                                onDragEnd={(e, { offset, velocity }) => {
                                  const swipePower = Math.abs(offset.x) * velocity.x;
                                  if (swipePower < -10000 || offset.x < -45) {
                                    paginate(1);
                                  } else if (swipePower > 10000 || offset.x > 45) {
                                    paginate(-1);
                                  }
                                }}
                                className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing touch-pan-y"
                              >
                                {failedUrls[slideUrl] ? (
                                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/80 p-4 text-center">
                                    <AlertCircle className="w-8 h-8 text-amber-500 mb-1" />
                                    <span className="text-xs font-semibold text-foreground">Photo {slideIndex + 1} unavailable</span>
                                    <span className="text-[10px] text-muted-foreground mt-0.5 max-w-[180px]">Link requires public sharing permissions</span>
                                  </div>
                                ) : (
                                  <Image
                                    src={slideUrl}
                                    alt={`${member.name} - Photo ${slideIndex + 1}`}
                                    fill
                                    unoptimized
                                    referrerPolicy="no-referrer"
                                    sizes="(max-width: 640px) 256px, 288px"
                                    className="object-cover object-[center_20%] select-none pointer-events-none"
                                    priority
                                    onError={() => {
                                      setFailedUrls(prev => ({ ...prev, [slideUrl]: true }));
                                    }}
                                  />
                                )}
                              </motion.div>
                            );
                          })()}
                        </AnimatePresence>

                        {/* Navigation Arrows */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            paginate(-1);
                          }}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center transition-all backdrop-blur-md border border-white/20 shadow-lg active:scale-90 opacity-80 hover:opacity-100"
                          aria-label="Previous photo"
                        >
                          <ChevronLeft className="w-5 h-5 -ml-0.5" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            paginate(1);
                          }}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center transition-all backdrop-blur-md border border-white/20 shadow-lg active:scale-90 opacity-80 hover:opacity-100"
                          aria-label="Next photo"
                        >
                          <ChevronRight className="w-5 h-5 -mr-0.5" />
                        </button>

                        {/* Counter Pill */}
                        <div className="absolute bottom-3 z-20 bg-black/60 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-0.5 rounded-full border border-white/20 pointer-events-none tracking-wider shadow">
                          {currentIndex + 1} / {photos.length}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Dot Indicators */}
                  {photos.length > 1 && (
                    <div className="flex items-center justify-center gap-1.5 pt-1">
                      {photos.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            goToPhoto(idx);
                          }}
                          className={cn(
                            "h-2 rounded-full transition-all duration-300",
                            idx === currentIndex
                              ? "w-6 bg-primary"
                              : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                          )}
                          aria-label={`Go to photo ${idx + 1}`}
                        />
                      ))}
                    </div>
                  )}

                  <div className="flex flex-col items-center gap-1.5 mt-1">
                    <DialogTitle className="text-2xl font-headline font-semibold uppercase tracking-wider text-primary text-center">
                      {member.name}
                    </DialogTitle>
                    {member.designation && (
                      <Badge
                        variant="secondary"
                        className="bg-primary/10 text-primary border border-primary/20 font-bold tracking-widest uppercase text-[11px] px-2.5 py-0.5 rounded-sm"
                      >
                        {member.designation}
                      </Badge>
                    )}
                  </div>
                </div>
              </DialogHeader>

              <Separator />

              <div className="space-y-4 p-6">
                {member.kohhran && (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Church className="w-5 h-5 text-primary shrink-0" />
                    <span className="font-medium text-foreground/90">{member.kohhran}</span>
                  </div>
                )}
                {member.phone && (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Phone className="w-5 h-5 text-primary shrink-0" />
                    <a
                      href={`tel:${member.phone.trim()}`}
                      className="hover:text-primary transition-colors font-medium text-foreground/90"
                    >
                      {member.phone}
                    </a>
                  </div>
                )}
                {member.birthday && (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Calendar className="w-5 h-5 text-primary shrink-0" />
                    <span className="font-medium text-foreground/90">Birthday: {member.birthday}</span>
                  </div>
                )}
                <div className="flex items-start gap-3 text-muted-foreground">
                  <Music className="w-5 h-5 mt-0.5 text-primary shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">Part</span>
                    {member.part ? (
                      <span className="whitespace-pre-wrap text-foreground/90">{member.part}</span>
                    ) : (
                      <span>No part assigned.</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
