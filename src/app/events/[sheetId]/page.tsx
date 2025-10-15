import { EventSchedule } from "@/components/event-schedule";
import { PageHeader } from "@/components/page-header";

export default function EventPage({ params }: { params: { sheetId: string } }) {
  const sheetUrl = `https://docs.google.com/spreadsheets/d/${params.sheetId}/edit?gid=0#gid=0`;

  return (
    <main className="min-h-screen container mx-auto px-4 py-8 md:py-12">
      <PageHeader />
      <EventSchedule sheetUrl={sheetUrl} />
    </main>
  );
}
