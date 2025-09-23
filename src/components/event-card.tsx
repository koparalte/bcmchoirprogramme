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
import { Calendar, ArrowRight } from "lucide-react";

type EventCardProps = {
  event: Event;
  onSelectEvent: (event: Event) => void;
};

export function EventCard({ event, onSelectEvent }: EventCardProps) {
  const descriptionSnippet = event.description.substring(0, 140) + (event.description.length > 140 ? "..." : "");

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="p-4">
        <CardTitle className="font-headline text-lg text-primary">{event.title}</CardTitle>
        {event.subtitle && <p className="text-xs text-muted-foreground mt-1">{event.subtitle}</p>}
      </CardHeader>
      <CardContent className="px-4 pb-2 pt-0 flex-grow">
        <p className="text-xs text-muted-foreground">{descriptionSnippet}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center bg-secondary/30 p-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date(event.date).toLocaleDateString(undefined, {
                year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC'
            })}</span>
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
