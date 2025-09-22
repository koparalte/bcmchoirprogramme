"use client";

import {
  Card,
  CardContent,
  CardDescription,
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
  const descriptionSnippet = event.description.substring(0, 100) + (event.description.length > 100 ? "..." : "");

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <CardTitle className="font-headline text-xl text-primary">{event.title}</CardTitle>
          <CategoryIcon category={event.category} className="w-6 h-6 text-muted-foreground shrink-0 mt-1" />
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground pt-1">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>{new Date(event.date).toLocaleDateString(undefined, {
                year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC'
            })}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{event.startTime}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">{descriptionSnippet}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center bg-secondary/50 p-4">
        <Badge variant="outline">{event.category}</Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSelectEvent(event)}
          className="text-primary hover:text-primary"
        >
          View Details <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
