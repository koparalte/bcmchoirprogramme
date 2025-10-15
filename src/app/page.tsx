import { EventSchedule } from "@/components/event-schedule";
import { PageHeader } from "@/components/page-header";

const SHEET_URL = "https://docs.google.com/spreadsheets/d/1NZtNfQ9-P9KCVUUj9BYbf7mIdD2t_yO5wT5j8URquKE/edit?gid=0#gid=0";

export default function Home() {
  return (
    <main className="min-h-screen container mx-auto px-4 py-8 md:py-12">
      <PageHeader />
      <EventSchedule sheetUrl={SHEET_URL} />
    </main>
  );
}
