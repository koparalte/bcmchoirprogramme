"use client";

import { useState, useMemo } from "react";
import type { Event } from "@/lib/types";
import { EventCard } from "@/components/event-card";
import { EventSummaryDialog } from "@/components/event-summary-dialog";
import { motion } from "framer-motion";
import { format, getMonth, getYear, isPast, endOfMonth } from "date-fns";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function EventSchedule({ events }: { events: Event[] }) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { defaultOpenMonths, groupedEvents } = useMemo(() => {
    const sorted = [...events].sort((a, b) => {
        return new Date(a.startdate).getTime() - new Date(b.startdate).getTime();
    });
    
    const groups = sorted.reduce((acc, event) => {
      const month = format(new Date(event.startdate), 'MMMM yyyy');
      if (!acc[month]) {
        acc[month] = [];
      }
      acc[month].push(event);
      return acc;
    }, {} as Record<string, Event[]>);

    const now = new Date();
    const openMonths = Object.keys(groups).filter(monthKey => {
      const monthDate = new Date(monthKey);
      return !isPast(endOfMonth(monthDate));
    });

    return { defaultOpenMonths: openMonths, groupedEvents: groups };
  }, [events]);

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsDialogOpen(true);
  };
  
  const hasEvents = Object.keys(groupedEvents).length > 0;

  const monthKeys = Object.keys(groupedEvents);

  return (
    <div className="animate-in fade-in-50 duration-500">
      {hasEvents ? (
        <Accordion type="multiple" defaultValue={defaultOpenMonths} className="w-full">
          {monthKeys.map((month) => (
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
                    {groupedEvents[month].map((event) => (
                      <motion.div
                        key={event.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                      >
                          <EventCard event={event} onSelectEvent={handleSelectEvent} />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
       ) : (
         <div className="text-center col-span-full py-16 px-4 border-2 border-dashed rounded-lg">
           <h3 className="mt-4 text-xl font-semibold">No Matching Events</h3>
           <p className="mt-1 text-muted-foreground">Try adjusting your filter criteria.</p>
         </div>
       )}

      <EventSummaryDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        event={selectedEvent}
      />
    </div>
  );
}
