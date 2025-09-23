"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { type Event } from "@/lib/types";
import { Calendar } from "lucide-react";
import { format } from "date-fns";

type EventSummaryDialogProps = {
  event: Event | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EventSummaryDialog({
  event,
  isOpen,
  onOpenChange,
}: EventSummaryDialogProps) {

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
  }

  const formatDateRange = (start: string, end?: string) => {
    const startDate = new Date(start);
    // Adjust for timezone offset to show correct date
    startDate.setMinutes(startDate.getMinutes() + startDate.getTimezoneOffset());

    if (end) {
      const endDate = new Date(end);
      endDate.setMinutes(endDate.getMinutes() + endDate.getTimezoneOffset());
      return `${format(startDate, 'PPPP')} - ${format(endDate, 'PPPP')}`;
    }
    return format(startDate, 'PPPP');
  }

  if (!event) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90svh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline text-primary pr-10">{event.title}</DialogTitle>
          {event.programme && <p className="text-muted-foreground mt-1">{event.programme}</p>}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>{formatDateRange(event.startdate, event.enddate)}</span>
            </div>
          </div>
        </DialogHeader>
        <Separator />
        <ScrollArea className="flex-grow">
          <div className="pr-6 space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Full Description</h3>
              <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
                {event.description || "No description available."}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
