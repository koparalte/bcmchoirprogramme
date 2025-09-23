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
import { Calendar, ArrowRight, Sun, Moon } from "lucide-react";

type EventCardProps = {
  event: Event;
  onSelectEvent: (event: Event) => void;
};

export function EventCard({ event, onSelectEvent }: EventCardProps) {
  const descriptionSnippet = event.description.substring(0, 100) + (event.description.length > 100 ? "..." : "");

  const formatDateRange = (start: string, end?: string) => {
    const startDate = new Date(start);
    if (end) {
      const endDate = new Date(end);
      const startMonth = startDate.toLocaleDateString(undefined, { month: 'short', timeZone: 'UTC' });
      const endMonth = endDate.toLocaleDateString(undefined, { month: 'short', timeZone: 'UTC' });

      if (startMonth === endMonth) {
         return `${startDate.getUTCDate()} - ${endDate.getUTCDate()} ${startMonth}, ${startDate.getUTCFullYear()}`;
      }
      return `${startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' })} - ${endDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}`;
    }
    return startDate.toLocaleDateString(undefined, {
      year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
    });
  }

  const renderZingZanIcon = () => {
    if (!event.zingzan) return null;
    const lowerZingzan = event.zingzan.toLowerCase();
    if (lowerZingzan === 'zing') {
      return <Sun className="w-3.5 h-3.5 text-accent" />;
    }
    if (lowerZingzan === 'zan') {
      return <Moon className="w-3.5 h-3.5" />;
    }
    return null;
  }

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="p-4">
        <CardTitle className="font-headline text-lg text-primary">{event.title}</CardTitle>
        {event.programme && <p className="text-md text-muted-foreground mt-1">{event.programme}</p>}
      </CardHeader>
      <CardContent className="px-4 pb-2 pt-0 flex-grow">
        <p className="text-sm text-muted-foreground">{descriptionSnippet}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center bg-secondary/30 p-3 mt-auto">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDateRange(event.startdate, event.enddate)}</span>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-2">
              {renderZingZanIcon()}
            </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSelectEvent(event)}
          className="text-primary hover:text-primary h-auto py-1 px-2 text-xs"
        >
          View Details <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
