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

type EventCardProps = {
  event: Event;
  onSelectEvent: (event: Event) => void;
  isBcya?: boolean;
  isProgramme?: boolean;
};

export function EventCard({ event, onSelectEvent, isBcya, isProgramme }: EventCardProps) {
  const formatDateRange = (start: string, end?: string) => {
    const startDate = new Date(start);
    if (end) {
      const endDate = new Date(end);
      const startMonth = startDate.toLocaleDateString(undefined, { month: 'short', timeZone: 'UTC' });
      const endMonth = endDate.toLocaleDateString(undefined, { month: 'short', timeZone: 'UTC' });

      if (startMonth === endMonth) {
         return `${startDate.toLocaleDateString(undefined, { weekday: 'short', timeZone: 'UTC' })} ${startDate.getUTCDate()} - ${endDate.toLocaleDateString(undefined, { weekday: 'short', timeZone: 'UTC' })} ${endDate.getUTCDate()} ${startMonth}, ${startDate.getUTCFullYear()}`;
      }
      return `${startDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' })} - ${endDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}`;
    }
    return startDate.toLocaleDateString(undefined, {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
    });
  }

  const zingZanText = event.zingzan?.trim().toLowerCase();

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 min-h-[170px]">
      <CardHeader className="p-4 flex-grow">
        <CardTitle className="font-headline text-lg text-primary">{event.title}</CardTitle>
        {isBcya ? (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{event.designation}</p>
        ) : (
            event.programme && !event.time && <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{event.programme}</p>
        )}
        {event.time && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
              <Clock className="w-4 h-4" />
              <span>{event.time}</span>
          </div>
        )}
      </CardHeader>
      <CardFooter className="flex justify-between items-center bg-secondary/30 p-3 mt-auto">
        <div className="flex flex-col items-start gap-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDateRange(event.startdate, event.enddate)}</span>
            </div>
            {isProgramme && (zingZanText === 'zing' || zingZanText === 'zan') && (
              <span className={`font-semibold capitalize ${zingZanText === 'zing' ? 'text-accent' : 'text-foreground'}`}>
                {zingZanText}
              </span>
            )}
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
  );
}
