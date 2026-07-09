import { EventSchedule } from "@/components/event-schedule";
import { PageHeader } from "@/components/page-header";

export default async function EventPage({ params }: { params: Promise<{ sheetId: string }> }) {
  const resolvedParams = await params;
  const sheetUrl = `https://docs.google.com/spreadsheets/d/${resolvedParams.sheetId}/edit?gid=0#gid=0`;

  return (
    <main className="min-h-screen container mx-auto px-4 py-8 md:py-12">
      <PageHeader />
      <EventSchedule sheetUrl={sheetUrl} />
    </main>
  );
}
