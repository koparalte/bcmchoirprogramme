
"use client";

import { useState, useMemo } from "react";
import type { Event } from "@/lib/types";
import { EventCard } from "@/components/event-card";
import { EventSummaryDialog } from "@/components/event-summary-dialog";
import { motion } from "framer-motion";
import { endOfDay, isPast, parseISO, format, eachDayOfInterval } from "date-fns";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
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
          <motion.div
            key={event.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <EventCard event={event} onSelectEvent={onSelectEvent} isBcya={isBcya} isProgramme={isProgramme} />
          </motion.div>
        ))}
      </motion.div>
    </AccordionContent>
  </AccordionItem>
);

export function EventClientSchedule({ events, allEventsForCalendar, showAllEvents, isProgramme }: { events: Event[], allEventsForCalendar?: Event[], showAllEvents?: boolean, isProgramme?: boolean }) {
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
  
  const calendarEvents = allEventsForCalendar || events;

  const eventDays = useMemo(() => {
    const days: Date[] = [];
    calendarEvents.forEach(event => {
      if (event.startdate) {
        try {
          const start = parseISO(event.startdate);
          const end = event.enddate ? parseISO(event.enddate) : start;
          if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
            const interval = eachDayOfInterval({ start, end });
            days.push(...interval);
          }
        } catch (e) {
          console.warn("Invalid date format for event", event);
        }
      }
    });
    return days;
  }, [calendarEvents]);

  return (
    <div className="animate-in fade-in-50 duration-500 w-full">
      {isProgramme && (
        <>
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
        
        <Card className="mb-8">
            <CardContent className="p-2 md:p-4 flex justify-center">
              <Calendar
                mode="multiple"
                selected={eventDays}
                onSelect={() => {}}
                className="p-0 rounded-md border"
                showOutsideDays
              />
            </CardContent>
          </Card>
        </>
      )}

      <Accordion type="multiple" defaultValue={['upcoming']} className="w-full space-y-8">
        <AccordionItem value="upcoming">
          <AccordionTrigger className="text-3xl font-bold text-foreground my-4 hover:no-underline">
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
              <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg">
                <h3 className="text-xl font-semibold text-muted-foreground">Will be Updated Soon</h3>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {hasPastEvents && (
          <AccordionItem value="past">
            <AccordionTrigger className="text-3xl font-bold text-foreground my-4 hover:no-underline">
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

      <EventSummaryDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        event={selectedEvent}
      />
    </div>
  );
}
