
"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type Event } from "@/lib/types";
import { Calendar, ArrowRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

type EventCardProps = {
  event: Event;
  onSelectEvent: (event: Event) => void;
  isBcya?: boolean;
  isProgramme?: boolean;
};

export function EventCard({ event, onSelectEvent, isBcya, isProgramme }: EventCardProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
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

  const formatDateRange = (start: string, end?: string) => {
    const startDate = new Date(start);
    if (end) {
      const endDate = new Date(end);
      const startMonth = startDate.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
      const endMonth = endDate.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });

      if (startMonth === endMonth) {
         return `${startDate.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' })} ${startDate.getUTCDate()} - ${endDate.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' })} ${endDate.getUTCDate()} ${startMonth}, ${startDate.getUTCFullYear()}`;
      }
      return `${startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' })} - ${endDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}`;
    }
    return startDate.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
    });
  }

  const zingZanText = event.zingzan?.trim().toLowerCase();

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "0px" }}
      transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      className="h-full"
    >
      <Card className={cn(
        "flex flex-col h-full overflow-hidden transition-all duration-500 hover:shadow-[0_0_2rem_-0.5rem_rgba(59,130,246,0.3)] hover:-translate-y-1 bg-card border border-white/10 hover:border-primary/40 rounded-2xl group",
        (isProgramme || isBcya) && "min-h-[170px]",
        isFocused && "shadow-[0_0_2rem_-0.5rem_rgba(59,130,246,0.3)] -translate-y-1 border-primary/40"
      )}>
        <CardHeader className="p-5 flex-grow relative z-10">
          <CardTitle className="font-headline text-xl text-primary font-bold tracking-tight mb-1 group-hover:text-primary transition-colors">{event.title}</CardTitle>
          {isBcya ? (
              <>
                  <p className="text-sm font-medium text-muted-foreground mt-1 line-clamp-1">{event.programme}</p>
                  <p className="text-xs text-muted-foreground/80 mt-1 line-clamp-1">{event.designation}</p>
              </>
          ) : (
              event.programme && <p className="text-sm font-medium text-muted-foreground mt-1 line-clamp-1">{event.programme}</p>
          )}
          {isProgramme && zingZanText && (
              <div className={`mt-2 inline-flex items-center rounded-sm px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest transition-colors ${zingZanText === 'zing' ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-primary/10 text-primary border border-primary/20'}`}>
                  {event.zingzan}
              </div>
          )}
          {event.time && (
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mt-4 bg-secondary/30 w-fit px-2 py-1 rounded border border-white/5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>{event.time}</span>
            </div>
          )}
        </CardHeader>
        <CardFooter className="flex justify-between items-center bg-secondary/10 p-4 mt-auto border-t border-white/5 relative z-10">
          <div className="flex flex-col items-start gap-1 text-xs font-medium text-muted-foreground">
              <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDateRange(event.startdate, event.enddate)}</span>
              </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelectEvent(event)}
            className="text-primary hover:text-primary h-auto py-1 px-2 text-xs self-end"
          >
            View Details <ArrowRight className="ml-1.5 w-3.h-3.5" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
