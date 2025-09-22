"use client";

import { useState, useMemo, useTransition } from "react";
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
import { X, Search } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function EventSchedule({ events }: { events: Event[] }) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("date-asc");
  
  const categories = useMemo(
    () => ["all", ...Array.from(new Set(events.map((e) => e.category)))],
    [events]
  );
  
  const filteredAndSortedEvents = useMemo(() => {
    let filtered = events;

    if (filterCategory !== "all") {
      filtered = filtered.filter((e) => e.category === filterCategory);
    }
    
    return [...filtered].sort((a, b) => {
        switch(sortBy) {
            case 'date-asc':
                return new Date(a.date).getTime() - new Date(b.date).getTime() || a.startTime.localeCompare(b.startTime);
            case 'date-desc':
                return new Date(b.date).getTime() - new Date(a.date).getTime() || b.startTime.localeCompare(a.startTime);
            case 'title-asc':
                return a.title.localeCompare(b.title);
            case 'title-desc':
                return b.title.localeCompare(a.title);
            default:
                return 0;
        }
    });
  }, [events, filterCategory, sortBy]);
  
  const clearFilters = () => {
    setFilterCategory("all");
    setSortBy("date-asc");
  }

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsDialogOpen(true);
  };
  
  const hasActiveFilters = filterCategory !== 'all';

  return (
    <div className="animate-in fade-in-50 duration-500">
      <div className="bg-card p-4 rounded-lg shadow-sm mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                    Clear Filters
                </Button>
            </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
            {filteredAndSortedEvents.map((event) => (
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
        </AnimatePresence>
      </div>

      {filteredAndSortedEvents.length === 0 && (
         <div className="text-center col-span-full py-16 px-4 border-2 border-dashed rounded-lg">
           <Search className="mx-auto h-12 w-12 text-muted-foreground" />
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
