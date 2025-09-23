import { Loader2, PartyPopper, AlertTriangle } from "lucide-react";
import Image from "next/image";

import type { Event } from "@/lib/types";
import { getEvents } from "@/lib/actions";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { EventSchedule } from "@/components/event-schedule";

const SHEET_URL = "https://docs.google.com/spreadsheets/d/1xeyiLqMDULNfycqE2zStdsABz_I1eXqXBvqnOqEhs3U/edit?gid=0#gid=0";

export default async function Home() {
  const { data: events, error } = await getEvents(SHEET_URL);

  return (
    <main className="min-h-screen container mx-auto px-4 py-8 md:py-12">
      <header className="flex flex-col items-center text-center mb-8 md:mb-12">
        <Image src="/logo.png" alt="BCM Choir Programme Logo" width="64" height="64" className="mb-4" />
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-primary uppercase">
          BCM CHOIR PROGRAMME
        </h1>
      </header>

      {error && (
         <Card className="max-w-3xl mx-auto text-center p-8 border-destructive/50 bg-destructive/10">
           <CardContent className="pt-6">
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
            <h3 className="mt-4 text-xl font-semibold text-destructive">An Error Occurred</h3>
            <p className="mt-2 text-destructive/80">{error}</p>
            <p className="mt-4 text-sm text-muted-foreground">Please check your Google Sheet URL and make sure it's published to the web.</p>
           </CardContent>
         </Card>
      )}

      {events && (
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
