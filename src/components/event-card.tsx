"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type Event } from "@/lib/types";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { CategoryIcon } from "@/components/icons";

type EventCardProps = {
  event: Event;
  onSelectEvent: (event: Event) => void;
};

export function EventCard({ event, onSelectEvent }: EventCardProps) {
  const descriptionSnippet = event.description.substring(0, 80) + (event.description.length > 80 ? "..." : "");

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="p-4">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-grow">
            <CardTitle className="font-headline text-lg text-primary">{event.title}</CardTitle>
            {event.subtitle && <p className="text-xs text-muted-foreground mt-1">{event.subtitle}</p>}
          </div>
          <CategoryIcon category={event.category} className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground pt-1">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date(event.date).toLocaleDateString(undefined, {
                year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC'
            })}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{event.startTime}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-2 pt-0 flex-grow">
        <p className="text-xs text-muted-foreground">{descriptionSnippet}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center bg-secondary/30 p-3">
        <Badge variant="outline" className="text-xs">{event.category}</Badge>
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
