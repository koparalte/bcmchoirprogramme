"use client";

import { useState, useEffect } from "react";
import { Loader2, PartyPopper } from "lucide-react";

import type { Event } from "@/lib/types";
import { getEvents } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { EventSchedule } from "@/components/event-schedule";
import { Logo } from "@/components/logo";

const SHEET_URL = "https://docs.google.com/spreadsheets/d/1xeyiLqMDULNfycqE2zStdsABz_I1eXqXBvqnOqEhs3U/edit?gid=0#gid=0";

export default function Home() {
  const [events, setEvents] = useState<Event[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  const loadEvents = async () => {
    setIsLoading(true);
    setError(null);
    setEvents(null);

    const result = await getEvents(SHEET_URL);

    if (result.error) {
      setError(result.error);
      toast({
        variant: "destructive",
        title: "Error fetching events",
        description: result.error,
      });
    } else {
      setEvents(result.data || []);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    loadEvents();
  }, []);

  return (
    <main className="min-h-screen container mx-auto px-4 py-8 md:py-12">
      <header className="flex flex-col items-center text-center mb-8 md:mb-12">
        <Logo className="w-16 h-16 mb-4" />
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-primary uppercase">
          BCM Choir Programme
        </h1>
      </header>

      {isLoading && (
        <div className="text-center p-8">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary"/>
            <p className="mt-4 text-muted-foreground">Fetching your events...</p>
        </div>
      )}

      {error && !isLoading && (
         <Card className="max-w-3xl mx-auto text-center p-8 border-destructive/50 bg-destructive/10">
           <CardContent className="pt-6">
            <h3 className="text-xl font-semibold text-destructive">An Error Occurred</h3>
            <p className="mt-2 text-destructive/80">{error}</p>
            <Button variant="destructive" className="mt-4" onClick={loadEvents}>Try Again</Button>
           </CardContent>
         </Card>
      )}

      {events && !isLoading && (
        events.length > 0
          ? <EventSchedule events={events} />
          : (
            <div className="text-center p-8 mt-8 border-2 border-dashed rounded-lg">
              <PartyPopper className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-xl font-semibold">All Clear!</h3>
              <p className="mt-1 text-muted-foreground">No events found in the sheet, or the sheet is empty.</p>
            </div>
          )
      )}
    </main>
  );
}
