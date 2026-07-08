
"use client";

import { useState, useMemo, type CSSProperties } from "react";
import type { Event } from "@/lib/types";
import { EventCard } from "@/components/event-card";
import { EventSummaryDialog } from "@/components/event-summary-dialog";
import { motion } from "framer-motion";
import { endOfDay, isPast, parseISO, format, eachDayOfInterval, isSameDay } from "date-fns";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Calendar as CalendarIcon, CheckCircle } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

const groupEventsByMonth = (events: Event[]) => {
  return events.reduce((acc, event) => {
    const month = format(parseISO(event.startdate), 'MMMM yyyy');
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(event);
    return acc;
  }, {} as Record<string, Event[]>);
};

const MonthEvents = ({ month, events, onSelectEvent, isBcya, isProgramme }: { month: string; events: Event[]; onSelectEvent: (event: Event) => void; isBcya?: boolean; isProgramme?: boolean; }) => (
  <AccordionItem value={month} key={month}>
    <AccordionTrigger className="text-2xl font-bold text-primary my-2 hover:no-underline">
      {month}
    </AccordionTrigger>
    <AccordionContent>
      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {events.map((event) => (
          <div key={event.id}>
            <EventCard event={event} onSelectEvent={onSelectEvent} isBcya={isBcya} isProgramme={isProgramme} />
          </div>
        ))}
      </motion.div>
    </AccordionContent>
  </AccordionItem>
);

export function EventClientSchedule({ events, allEventsForCalendar, showAllEvents, isProgramme, isHlaZirTab }: { events: Event[], allEventsForCalendar?: Event[], showAllEvents?: boolean, isProgramme?: boolean, isHlaZirTab?: boolean }) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { upcomingEvents, pastEvents } = useMemo(() => {
    const sorted = [...events].sort((a, b) => new Date(a.startdate).getTime() - new Date(b.startdate).getTime());

    const upcoming: Event[] = [];
    const past: Event[] = [];

    sorted.forEach(event => {
      const eventEndDate = event.enddate ? parseISO(event.enddate) : parseISO(event.startdate);
      if (isPast(endOfDay(eventEndDate))) {
        past.push(event);
      } else {
        upcoming.push(event);
      }
    });

    return {
      upcomingEvents: upcoming,
      pastEvents: past.reverse(),
    };
  }, [events]);

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsDialogOpen(true);
  };
  
  const groupedUpcomingEvents = groupEventsByMonth(upcomingEvents);
  const groupedPastEvents = groupEventsByMonth(pastEvents);
  
  const upcomingMonthsToOpen = Object.keys(groupedUpcomingEvents);

  const hasUpcomingEvents = upcomingEvents.length > 0;
  const hasPastEvents = pastEvents.length > 0;
  
  const { programmeDays, hlazirDays } = useMemo(() => {
    const pDays: Date[] = [];
    const hDays: Date[] = [];
    const calendarEvents = allEventsForCalendar || events;

    calendarEvents.forEach(event => {
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
                        // Default for events without type
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
  }, [allEventsForCalendar, events]);

  const eventDays = useMemo(() => [...programmeDays, ...hlazirDays], [programmeDays, hlazirDays]);

  const modifiers = {
    sunday: { dayOfWeek: [0] },
    programme: programmeDays,
    hlazir: hlazirDays,
  };

  const modifiersStyles: Record<string, CSSProperties> = {
    programme: { 
        color: 'hsl(var(--destructive-foreground))',
        backgroundColor: 'hsl(var(--destructive))',
        borderRadius: '50%',
    },
    hlazir: {
        color: 'hsl(var(--primary-foreground))',
        backgroundColor: 'hsl(var(--primary))',
        borderRadius: '50%',
    },
    sunday: {
        color: 'hsl(var(--destructive))'
    }
  };

  const showCalendar = isProgramme || isHlaZirTab;

  return (
    <div className="animate-in fade-in-50 duration-500 w-full">
      {isProgramme && (
        <Card className="mb-8 bg-secondary/30 border-primary/20">
          <CardContent className="p-4 text-center">
            <p className="font-semibold text-primary">
              Upcoming Programme(s) - <span className="font-bold">{upcomingEvents.length}</span>
            </p>
            <p className="font-semibold text-primary">
              Past Programme(s) - <span className="font-bold">{pastEvents.length}</span>
            </p>
          </CardContent>
        </Card>
      )}

      {showCalendar && (
        <Card className="mb-10 bg-card border border-white/5 shadow-[0_0_3rem_-1rem_rgba(0,0,0,0.5)] rounded-3xl overflow-hidden relative group transition-all duration-700 hover:border-primary/20 hover:shadow-[0_0_4rem_-1rem_rgba(59,130,246,0.15)]">
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
      )}


      {isProgramme ? (
        <div className="w-full space-y-12 mt-8">
          {hasUpcomingEvents && (
            <div>
              <h2 className="text-2xl md:text-3xl font-headline font-black uppercase tracking-widest text-primary mb-6">Upcoming</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} onSelectEvent={handleSelectEvent} isProgramme={true} />
                ))}
              </div>
            </div>
          )}
          {hasPastEvents && (
            <div>
              <h2 className="text-2xl md:text-3xl font-headline font-black uppercase tracking-widest text-muted-foreground mb-6">Past</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-70">
                {pastEvents.map((event) => (
                  <EventCard key={event.id} event={event} onSelectEvent={handleSelectEvent} isProgramme={true} />
                ))}
              </div>
            </div>
          )}
          {!hasUpcomingEvents && !hasPastEvents && (
            <div className="text-center py-16 px-4 border border-white/5 rounded-2xl bg-black/20">
              <h3 className="text-xl font-headline font-bold text-muted-foreground uppercase tracking-widest">Will be Updated Soon</h3>
            </div>
          )}
        </div>
      ) : (
        <Accordion type="multiple" defaultValue={['upcoming']} className="w-full space-y-8 mt-8">
          <AccordionItem value="upcoming">
            <AccordionTrigger className="text-2xl font-headline font-bold text-foreground my-2 hover:no-underline uppercase tracking-widest">
              Upcoming
            </AccordionTrigger>
            <AccordionContent>
              {hasUpcomingEvents ? (
                 <Accordion type="multiple" defaultValue={upcomingMonthsToOpen} className="w-full">
                  {Object.entries(groupedUpcomingEvents).map(([month, monthEvents]) => (
                    <MonthEvents key={month} month={month} events={monthEvents} onSelectEvent={handleSelectEvent} isBcya={showAllEvents} isProgramme={isProgramme} />
                  ))}
                </Accordion>
              ) : (
                <div className="text-center py-16 px-4 border border-white/5 rounded-2xl bg-black/20">
                  <h3 className="text-xl font-headline font-bold text-muted-foreground uppercase tracking-widest">Will be Updated Soon</h3>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
  
          {hasPastEvents && (
            <AccordionItem value="past">
              <AccordionTrigger className="text-2xl font-headline font-bold text-foreground my-2 hover:no-underline uppercase tracking-widest">
                Past {showAllEvents && `(${pastEvents.length})`}
              </AccordionTrigger>
              <AccordionContent>
                <Accordion type="multiple" className="w-full">
                  {Object.entries(groupedPastEvents).map(([month, monthEvents]) => (
                    <MonthEvents key={month} month={month} events={monthEvents} onSelectEvent={handleSelectEvent} isBcya={showAllEvents} isProgramme={isProgramme} />
                  ))}
                </Accordion>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      )}

      <EventSummaryDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        event={selectedEvent}
      />
    </div>
  );
}
