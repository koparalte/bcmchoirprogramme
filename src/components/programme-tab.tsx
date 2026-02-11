import { getEvents } from "@/lib/actions";
import { EventClientSchedule } from "./event-client-schedule";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, PartyPopper } from "lucide-react";

const BCM_SHEET_URL = "https://docs.google.com/spreadsheets/d/1xeyiLqMDULNfycqE2zStdsABz_I1eXqXBvqnOqEhs3U/edit?gid=0#gid=0";
const BCYA_SHEET_URL = "https://docs.google.com/spreadsheets/d/1NZtNfQ9-P9KCVUUj9BYbf7mIdD2t_yO5wT5j8URquKE/edit?gid=0#gid=0";

export async function ProgrammeTab() {
  const programmePromise = getEvents(BCM_SHEET_URL);
  const hlazirPromise = getEvents(BCYA_SHEET_URL, true);

  const [programmeResult, hlazirResult] = await Promise.all([programmePromise, hlazirPromise]);

  const { data: programmeEvents, error: programmeError } = programmeResult;
  const { data: hlazirEvents, error: hlazirError } = hlazirResult;

  const error = programmeError || hlazirError;

  if (error && (!programmeEvents || programmeEvents.length === 0)) {
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

  const eventsForList = programmeEvents || [];

  if (eventsForList.length === 0) {
    return (
      <div className="text-center p-8 mt-8 border-2 border-dashed rounded-lg">
        <PartyPopper className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-xl font-semibold">All Clear!</h3>
        <p className="mt-1 text-muted-foreground">No events found in the sheet, or the sheet is empty.</p>
      </div>
    )
  }
  
  const allEventsForCalendar = [...(programmeEvents || []), ...(hlazirEvents || [])];

  return <EventClientSchedule events={eventsForList} allEventsForCalendar={allEventsForCalendar} isProgramme={true} />;
}
