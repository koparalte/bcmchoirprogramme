import { getEvents } from "@/lib/actions";
import { EventClientSchedule } from "./event-client-schedule";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, PartyPopper } from "lucide-react";

export async function EventSchedule({ sheetUrl }: { sheetUrl: string }) {
  const { data: events, error } = await getEvents(sheetUrl);

  if (error) {
    return (
       <Card className="max-w-3xl mx-auto text-center p-8 border-destructive/50 bg-destructive/10">
         <CardContent className="pt-6">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
          <h3 className="mt-4 text-xl font-semibold text-destructive">An Error Occurred</h3>
          <p className="mt-2 text-destructive/80">{error}</p>
          <p className="mt-4 text-sm text-muted-foreground">Please check your Google Sheet URL and make sure it's published to the web.</p>
         </CardContent>
       </Card>
    )
  }

  if (!events || events.length === 0) {
    return (
      <div className="text-center p-8 mt-8 border-2 border-dashed rounded-lg">
        <PartyPopper className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-xl font-semibold">All Clear!</h3>
        <p className="mt-1 text-muted-foreground">No events found in the sheet, or the sheet is empty.</p>
      </div>
    )
  }

  return <EventClientSchedule events={events} />;
}
