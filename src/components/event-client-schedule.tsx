"use client";

import { useState, useMemo } from "react";
import type { Event } from "@/lib/types";
import { EventCard } from "@/components/event-card";
import { EventSummaryDialog } from "@/components/event-summary-dialog";
import { motion } from "framer-motion";
import { endOfDay, isPast, format } from "date-fns";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const groupEventsByMonth = (events: Event[]) => {
  return events.reduce((acc, event) => {
    const month = format(new Date(event.startdate), 'MMMM yyyy');
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(event);
    return acc;
  }, {} as Record<string, Event[]>);
};

const MonthEvents = ({ month, events, onSelectEvent }: { month: string; events: Event[]; onSelectEvent: (event: Event) => void; }) => (
  <AccordionItem value={month} key={month}>
    <AccordionTrigger className="text-2xl font-bold text-primary my-2 hover:no-underline">
      {month}
    </AccordionTrigger>
    <AccordionContent>
      <motion.div
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {events.map((event) => (
            <motion.div
              key={event.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <EventCard event={event} onSelectEvent={onSelectEvent} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AccordionContent>
  </AccordionItem>
);

export function EventClientSchedule({ events }: { events: Event[] }) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { upcomingEvents, pastEvents, upcomingMonthsToOpen } = useMemo(() => {
    const sorted = [...events].sort((a, b) => {
      const dateA = new Date(a.startdate).getTime();
      const dateB = new Date(b.startdate).getTime();

      if (dateA !== dateB) {
        return dateA - dateB;
      }

      if (a.zingzan?.toLowerCase() === 'zing' && b.zingzan?.toLowerCase() !== 'zing') return -1;
      if (a.zingzan?.toLowerCase() !== 'zing' && b.zingzan?.toLowerCase() === 'zing') return 1;
      return 0;
    });

    const upcoming: Event[] = [];
    const past: Event[] = [];
    const today = endOfDay(new Date());

    sorted.forEach(event => {
      const eventEndDate = event.enddate ? new Date(event.enddate) : new Date(event.startdate);
      if (isPast(eventEndDate) && !isPast(today)) {
        past.push(event);
      } else {
        upcoming.push(event);
      }
    });

    const groupedUpcoming = groupEventsByMonth(upcoming);
    const groupedPast = groupEventsByMonth(past.reverse());

    const upcomingMonthsToOpen = Object.keys(groupedUpcoming);

    return {
      upcomingEvents: groupedUpcoming,
      pastEvents: groupedPast,
      upcomingMonthsToOpen,
    };
  }, [events]);

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsDialogOpen(true);
  };

  const hasUpcomingEvents = Object.keys(upcomingEvents).length > 0;
  const hasPastEvents = Object.keys(pastEvents).length > 0;

  return (
    <div className="animate-in fade-in-50 duration-500 w-full">
      <Accordion type="multiple" defaultValue={['upcoming-events']} className="w-full space-y-8">
        <AccordionItem value="upcoming-events">
          <AccordionTrigger className="text-3xl font-bold text-foreground my-4 hover:no-underline">
            Upcoming Events
          </AccordionTrigger>
          <AccordionContent>
            {hasUpcomingEvents ? (
              <Accordion type="multiple" defaultValue={upcomingMonthsToOpen} className="w-full">
                {Object.entries(upcomingEvents).map(([month, monthEvents]) => (
                  <MonthEvents key={month} month={month} events={monthEvents} onSelectEvent={handleSelectEvent} />
                ))}
              </Accordion>
            ) : (
              <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg">
                <h3 className="mt-4 text-xl font-semibold">No Upcoming Events</h3>
                <p className="mt-1 text-muted-foreground">Check back later for more events.</p>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {hasPastEvents && (
          <AccordionItem value="past-events">
            <AccordionTrigger className="text-3xl font-bold text-foreground my-4 hover:no-underline">
              Past Events
            </AccordionTrigger>
            <AccordionContent>
              <Accordion type="multiple" className="w-full">
                {Object.entries(pastEvents).map(([month, monthEvents]) => (
                  <MonthEvents key={month} month={month} events={monthEvents} onSelectEvent={handleSelectEvent} />
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