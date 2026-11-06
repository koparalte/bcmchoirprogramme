"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { AlbumPhoto } from "@/lib/types";
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Calendar, 
  Tag as TagIcon, 
  ZoomIn
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Disperse photos so same parts/groups are never grouped adjacent to each other
function dispersePhotos(photoList: AlbumPhoto[]): AlbumPhoto[] {
  if (!photoList || photoList.length <= 2) return photoList;

  const buckets: Record<string, AlbumPhoto[]> = {};
  photoList.forEach(p => {
    const key = p.tag || p.title || 'Group';
    if (!buckets[key]) buckets[key] = [];
    buckets[key].push(p);
  });

  // Alternating choir order so adjacent items always differ
  const alternatingKeys = ['Group', 'Tenors', 'Sopranos', 'Basses', 'Contraltos'];
  const allKeys = Object.keys(buckets).sort((a, b) => {
    const idxA = alternatingKeys.indexOf(a);
    const idxB = alternatingKeys.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });

  const result: AlbumPhoto[] = [];
  let added = true;
  let round = 0;

  while (added) {
    added = false;
    for (let i = 0; i < allKeys.length; i++) {
      const key = allKeys[(i + round) % allKeys.length];
      const bucket = buckets[key];
      if (bucket && bucket.length > 0) {
        result.push(bucket.shift()!);
        added = true;
      }
    }
    round++;
  }

  return result;
}

// Organic, pseudo-randomized thumbnail sizing (some big, some small, some wide, some tall)
function getPhotoSpan(photo: AlbumPhoto, index: number): string {
  const str = photo.id || `${index}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  const val = Math.abs(hash + index * 11) % 12;

  if (val === 0 || val === 6) {
    // Featured large showcase photo
    return "col-span-2 row-span-2";
  }
  if (val === 2 || val === 8) {
    // Tall portrait snapshot
    return "col-span-1 row-span-2";
  }
  if (val === 4 || val === 10) {
    // Wide horizontal snapshot
    return "col-span-2 row-span-1";
  }
  // Compact snapshot (smaller thumbnail)
  return "col-span-1 row-span-1";
}

export function AlbumGallery({ photos }: { photos: AlbumPhoto[] }) {
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Extract unique tags and count photos per tag (only from photos that actually have a tag)
  const { tags, tagCounts, hasTags } = useMemo(() => {
    const counts: Record<string, number> = { All: photos.length };
    const tagSet = new Set<string>();

    photos.forEach(photo => {
      if (photo.tag && photo.tag.trim() !== '') {
        const tag = photo.tag.trim();
        tagSet.add(tag);
        counts[tag] = (counts[tag] || 0) + 1;
      }
    });

    const uniqueTags = Array.from(tagSet);

    // Order choir parts logically: Group, Conductor, Sopranos, Contraltos, Tenors, Basses, then others
    const preferredOrder = ['Group', 'Conductor', 'Sopranos', 'Contraltos', 'Tenors', 'Basses'];
    uniqueTags.sort((a, b) => {
      const idxA = preferredOrder.indexOf(a);
      const idxB = preferredOrder.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });

    return {
      tags: uniqueTags.length > 0 ? ["All", ...uniqueTags] : [],
      tagCounts: counts,
      hasTags: uniqueTags.length > 0
    };
  }, [photos]);

  // Dispersed photos for "All" so groups and parts are mixed up organically
  const dispersedAllPhotos = useMemo(() => {
    return dispersePhotos([...photos]);
  }, [photos]);

  // Filter photos by selected tag (mixed for All, filtered for specific part)
  const filteredPhotos = useMemo(() => {
    if (selectedTag === "All" || !hasTags) return dispersedAllPhotos;
    return photos.filter(p => p.tag?.trim() === selectedTag);
  }, [photos, dispersedAllPhotos, selectedTag, hasTags]);

  // Lightbox navigation
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const nextPhoto = useCallback(() => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % filteredPhotos.length);
    }
  }, [lightboxIndex, filteredPhotos.length]);

  const prevPhoto = useCallback(() => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + filteredPhotos.length) % filteredPhotos.length);
    }
  }, [lightboxIndex, filteredPhotos.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") nextPhoto();
      if (e.key === "ArrowLeft") prevPhoto();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, nextPhoto, prevPhoto]);

  // Prevent background scroll when lightbox is open
  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [lightboxIndex]);

  const currentPhoto = lightboxIndex !== null ? filteredPhotos[lightboxIndex] : null;

  return (
    <div className="w-full">
      {/* Category / Tag Filter Tabs (Only shown if custom tags exist in the sheet) */}
      {hasTags && (
        <div className="flex items-center justify-center flex-wrap gap-1.5 sm:gap-2 mb-6 sm:mb-8 pb-3 border-b border-white/5">
          {tags.map((tag) => {
            const isActive = selectedTag === tag;
            const count = tagCounts[tag] || 0;
            return (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`relative px-3 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 ${
                  isActive
                    ? "text-white bg-primary shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-105"
                    : "text-muted-foreground bg-white/5 hover:bg-white/10 hover:text-foreground border border-white/5"
                }`}
              >
                <span>{tag}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${
                  isActive ? "bg-black/30 text-white" : "bg-white/10 text-muted-foreground"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Counter bar */}
      <div className="flex justify-between items-center mb-4 px-1 text-[11px] sm:text-xs text-muted-foreground font-medium">
        <span>
          <span className="text-foreground font-bold">{filteredPhotos.length}</span> {filteredPhotos.length === 1 ? "photo" : "photos"}
        </span>
        {selectedTag !== "All" && hasTags && (
          <button 
            onClick={() => setSelectedTag("All")}
            className="text-primary hover:underline text-[11px] uppercase tracking-wider font-semibold"
          >
            Show all
          </button>
        )}
      </div>

      {/* Mosaic Scrapbook Photo Album Grid: Dense interlocking layout with small & big photos */}
      <motion.div 
        layout
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 auto-rows-[105px] sm:auto-rows-[125px] md:auto-rows-[140px] gap-2 sm:gap-2.5 md:gap-3 grid-flow-dense"
      >
        <AnimatePresence>
          {filteredPhotos.map((photo, index) => {
            const displayTitle = photo.title || "Group";
            const spanClass = getPhotoSpan(photo, index);
            const isLarge = spanClass.includes("col-span-2 row-span-2");

            return (
              <motion.div
                layout
                key={photo.id}
                initial={{ opacity: 0, y: 30 + (index % 3) * 15, scale: 0.92 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-20px" }}
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ 
                  duration: 0.5, 
                  type: "spring", 
                  stiffness: 110, 
                  damping: 16,
                  delay: (index % 4) * 0.04 
                }}
                className={`${spanClass} group relative rounded-xl sm:rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 hover:border-primary/60 transition-colors duration-300 shadow-md hover:shadow-[0_12px_35px_-5px_rgba(59,130,246,0.4)] cursor-pointer`}
                onClick={() => openLightbox(index)}
              >
                <Image
                  src={photo.url}
                  alt={displayTitle}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-cover object-[center_20%] md:object-center transition-transform duration-700 ease-out group-hover:scale-108"
                  loading="lazy"
                  quality={80}
                />

                {/* Subtle vignette gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />

                {/* Tag Badge Top Left (Only if tag is distinct from title) */}
                {photo.tag && photo.tag !== displayTitle && (
                  <div className="absolute top-2 left-2 z-10">
                    <Badge variant="outline" className="backdrop-blur-md bg-black/60 text-white/90 border-white/15 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
                      {photo.tag}
                    </Badge>
                  </div>
                )}

                {/* Quick Zoom Icon Top Right */}
                <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:block">
                  <div className="h-6 w-6 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-lg">
                    <ZoomIn className="h-3 w-3" />
                  </div>
                </div>

                {/* Bottom Content: Title & Date (Compact for smaller thumbnails) */}
                <div className="absolute bottom-0 inset-x-0 p-2 sm:p-2.5 z-10 flex flex-col justify-end">
                  <p className={`text-white font-headline font-bold line-clamp-1 group-hover:text-primary transition-colors ${
                    isLarge ? "text-xs sm:text-sm md:text-base" : "text-[11px] sm:text-xs"
                  }`}>
                    {displayTitle}
                  </p>

                  {photo.date && (
                    <div className="flex items-center gap-1 mt-0.5 text-[9px] sm:text-[10px] text-zinc-400 font-medium line-clamp-1">
                      <Calendar className="w-2.5 h-2.5 text-primary/80 shrink-0" />
                      <span>{photo.date}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {currentPhoto && lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-3 sm:p-6"
            onClick={closeLightbox}
          >
            {/* Top Toolbar */}
            <div 
              className="absolute top-3 inset-x-3 sm:top-5 sm:inset-x-6 flex justify-between items-center z-50 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2">
                <span className="text-[11px] sm:text-xs uppercase tracking-widest font-bold text-white/80 bg-white/10 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                  {lightboxIndex + 1} / {filteredPhotos.length}
                </span>
                {currentPhoto.tag && (
                  <Badge variant="outline" className="hidden sm:inline-flex bg-primary/20 text-primary border-primary/30 uppercase text-[10px] font-bold tracking-widest px-2.5 py-0.5 rounded-full">
                    {currentPhoto.tag}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={currentPhoto.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider bg-white/10 text-white hover:bg-primary hover:text-white border border-white/15 transition-all shadow-lg"
                >
                  <Download className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span>Download</span>
                </a>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeLightbox}
                  className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-white/10 text-white hover:bg-white/20 border border-white/10"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>
            </div>

            {/* Navigation Arrows */}
            {filteredPhotos.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevPhoto();
                  }}
                  className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-50 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/60 hover:bg-black/80 border border-white/15 text-white flex items-center justify-center backdrop-blur-md transition-all hover:scale-105 shadow-2xl"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextPhoto();
                  }}
                  className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-50 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/60 hover:bg-black/80 border border-white/15 text-white flex items-center justify-center backdrop-blur-md transition-all hover:scale-105 shadow-2xl"
                  aria-label="Next photo"
                >
                  <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </>
            )}

            {/* Main Lightbox Image Container */}
            <div 
              className="relative w-full max-w-5xl h-[70vh] sm:h-[75vh] md:h-[80vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPhoto.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.25 }}
                  className="relative w-full h-full flex items-center justify-center"
                >
                  <Image
                    src={currentPhoto.fullUrl}
                    alt={currentPhoto.title || "Group"}
                    fill
                    className="object-contain"
                    priority
                    sizes="(max-width: 1200px) 100vw, 1200px"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom Caption Bar */}
            <div 
              className="absolute bottom-3 inset-x-3 sm:bottom-4 sm:inset-x-6 max-w-xl mx-auto text-center z-50 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="backdrop-blur-md bg-black/70 border border-white/10 px-5 py-2.5 rounded-2xl shadow-2xl inline-block max-w-full">
                <h3 className="text-white font-headline font-bold text-xs sm:text-sm tracking-wide">
                  {currentPhoto.title || "Group"}
                </h3>
                <div className="flex items-center justify-center gap-3 mt-0.5 text-[10px] sm:text-xs text-zinc-400">
                  {currentPhoto.date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5 text-primary" />
                      {currentPhoto.date}
                    </span>
                  )}
                  {currentPhoto.tag && (
                    <span className="flex items-center gap-1 sm:hidden">
                      <TagIcon className="w-2.5 h-2.5 text-primary" />
                      {currentPhoto.tag}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
