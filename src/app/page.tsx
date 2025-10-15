import { EventSchedule } from "@/components/event-schedule";
import { PageHeader } from "@/components/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const BCM_SHEET_URL = "https://docs.google.com/spreadsheets/d/1-U2j_G_y0k0G-n3H4t2xY4x0mJ8L3n9w5kFvX_zO_c/edit?gid=0#gid=0";
const BCYA_SHEET_URL = "https://docs.google.com/spreadsheets/d/1NZtNfQ9-P9KCVUUj9BYbf7mIdD2t_yO5wT5j8URquKE/edit?gid=0#gid=0";

export default function Home() {
  return (
    <main className="min-h-screen container mx-auto px-4 py-8 md:py-12">
      <PageHeader />
      <Tabs defaultValue="bcm" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="bcm">BCM</TabsTrigger>
          <TabsTrigger value="bcya">BCYA</TabsTrigger>
        </TabsList>
        <TabsContent value="bcm" className="mt-6">
          <EventSchedule sheetUrl={BCM_SHEET_URL} />
        </TabsContent>
        <TabsContent value="bcya" className="mt-6">
          <EventSchedule sheetUrl={BCYA_SHEET_URL} />
        </TabsContent>
      </Tabs>
    </main>
  );
}
