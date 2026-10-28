"use client";

import { useMemo, type CSSProperties } from "react";
import type { Event } from "@/lib/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { parseISO, eachDayOfInterval, isSameDay } from "date-fns";

export function CalendarOnly({ events }: { events: Event[] }) {
  const { programmeDays, hlazirDays } = useMemo(() => {
    const pDays: Date[] = [];
    const hDays: Date[] = [];

    events.forEach(event => {
      if (event.startdate) {
        try {
          const start = parseISO(event.startdate);
          const end = event.enddate ? parseISO(event.enddate) : start;
          if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
            const interval = eachDayOfInterval({ start, end });
            if (event.type === 'programme') {
              pDays.push(...interval);
            } else if (event.type === 'hlazir') {
              hDays.push(...interval);
            } else {
              pDays.push(...interval);
            }
          }
        } catch (e) {
          console.warn("Invalid date format for event", event);
        }
      }
    });

    const uniqueProgrammeDays = pDays.filter(pDay => !hDays.some(hDay => isSameDay(pDay, hDay)));
    return { programmeDays: uniqueProgrammeDays, hlazirDays: hDays };
  }, [events]);

  const eventDays = useMemo(() => [...programmeDays, ...hlazirDays], [programmeDays, hlazirDays]);

  const modifiers = {
    sunday: { dayOfWeek: [0] },
    programme: programmeDays,
    hlazir: hlazirDays,
  };

  return (
    <Card className="bg-card border border-white/5 shadow-[0_0_3rem_-1rem_rgba(0,0,0,0.5)] rounded-3xl overflow-hidden relative group transition-all duration-700 hover:border-primary/20 hover:shadow-[0_0_4rem_-1rem_rgba(59,130,246,0.15)]">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-destructive/5 z-0 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
      <CardContent className="p-4 md:p-8 flex justify-center relative z-10">
        <Calendar
          mode="multiple"
          selected={eventDays}
          onSelect={() => {}}
          className="p-0 w-full max-w-sm mx-auto font-body"
          showOutsideDays
          modifiers={modifiers}
          modifiersStyles={{
            programme: {
              color: 'hsl(var(--foreground))',
              backgroundColor: 'transparent',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              boxShadow: 'inset 0 0 10px rgba(239, 68, 68, 0.2), 0 0 15px rgba(239, 68, 68, 0.2)',
              borderRadius: '0.5rem',
              fontWeight: 'bold',
            },
            hlazir: {
              color: 'hsl(var(--foreground))',
              backgroundColor: 'transparent',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              boxShadow: 'inset 0 0 10px rgba(59, 130, 246, 0.2), 0 0 15px rgba(59, 130, 246, 0.2)',
              borderRadius: '0.5rem',
              fontWeight: 'bold',
            },
            sunday: {
              color: 'rgba(239, 68, 68, 0.8)',
            }
          }}
          classNames={{
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full",
            month: "space-y-6 w-full",
            caption: "flex justify-center pt-1 relative items-center mb-2",
            caption_label: "text-lg font-black uppercase tracking-[0.2em] text-primary",
            nav: "space-x-1 flex items-center",
            nav_button: "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100 border border-white/10 rounded-md transition-all hover:bg-white/5 flex items-center justify-center text-foreground",
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse space-y-1",
            head_row: "flex justify-between w-full mb-2",
            head_cell: "text-muted-foreground rounded-md w-10 font-bold text-[0.7rem] uppercase tracking-wider",
            row: "flex justify-between w-full mt-2",
            cell: "h-10 w-10 md:h-12 md:w-12 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
            day: "h-10 w-10 md:h-12 md:w-12 p-0 font-medium transition-all hover:bg-white/5 rounded-md aria-selected:opacity-100 text-foreground",
            day_today: "bg-transparent text-foreground ring-1 ring-emerald-500/40 shadow-[inset_0_0_10px_rgba(16,185,129,0.2),0_0_15px_rgba(16,185,129,0.2)] rounded-md font-bold",
            day_outside: "text-muted-foreground/30",
          }}
        />
      </CardContent>
      <CardFooter className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 p-4 bg-black/20 border-t border-white/5 text-[10px] font-bold tracking-widest uppercase text-muted-foreground relative z-10">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm border border-destructive shadow-[0_0_10px_rgba(239,68,68,0.4)]" />
          <span className="text-destructive">Programme</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm border border-primary shadow-[0_0_10px_rgba(59,130,246,0.4)]" />
          <span className="text-primary">Hla Zir</span>
        </div>
      </CardFooter>
    </Card>
  );
}
