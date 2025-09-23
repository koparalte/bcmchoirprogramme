"use client";

import { useState, useMemo } from "react";
import type { Event } from "@/lib/types";
import { EventCard } from "@/components/event-card";
import { EventSummaryDialog } from "@/components/event-summary-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { format } from "date-fns";

export function EventSchedule({ events }: { events: Event[] }) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [sortBy, setSortBy] = useState("date-asc");
  
  const groupedEvents = useMemo(() => {
    const sorted = [...events].sort((a, b) => {
        switch(sortBy) {
            case 'date-asc':
                return new Date(a.startdate).getTime() - new Date(b.startdate).getTime();
            case 'date-desc':
                return new Date(b.startdate).getTime() - new Date(a.startdate).getTime();
            case 'title-asc':
                return a.title.localeCompare(b.title);
            case 'title-desc':
                return b.title.localeCompare(a.title);
            default:
                return 0;
        }
    });

    return sorted.reduce((acc, event) => {
      const month = format(new Date(event.startdate), 'MMMM yyyy');
      if (!acc[month]) {
        acc[month] = [];
      }
      acc[month].push(event);
      return acc;
    }, {} as Record<string, Event[]>);
  }, [events, sortBy]);

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsDialogOpen(true);
  };
  
  const clearFilters = () => {
    setSortBy("date-asc");
  }

  const hasActiveFilters = sortBy !== 'date-asc';
  const hasEvents = Object.keys(groupedEvents).length > 0;

  return (
    <div className="animate-in fade-in-50 duration-500">
      <div className="bg-card p-4 rounded-lg shadow-sm mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <Select value={sortBy} onValueChange={setSortBy}>
             <SelectTrigger>
               <SelectValue placeholder="Sort by" />
             </SelectTrigger>
             <SelectContent>
                <SelectItem value="date-asc">Date (Asc)</SelectItem>
                <SelectItem value="date-desc">Date (Desc)</SelectItem>
                <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                <SelectItem value="title-desc">Title (Z-A)</SelectItem>
             </SelectContent>
           </Select>
        </div>
        {hasActiveFilters && (
            <div className="mt-4 flex justify-end">
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-primary">
                    <X className="w-4 h-4 mr-2" />
                    Clear Sort
                </Button>
            </div>
        )}
      </div>

      {hasEvents ? (
        <AnimatePresence>
          {Object.entries(groupedEvents).map(([month, monthEvents]) => (
            <motion.div 
              key={month}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-primary my-6 pb-2 border-b-2 border-primary/20">
                {month}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {monthEvents.map((event) => (
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
          ))}
        </AnimatePresence>
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
