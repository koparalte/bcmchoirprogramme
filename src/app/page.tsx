import { EventSchedule } from "@/components/event-schedule";
import { PageHeader } from "@/components/page-header";
import { MemberSchedule } from "@/components/member-schedule";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const BCM_SHEET_URL = "https://docs.google.com/spreadsheets/d/1xeyiLqMDULNfycqE2zStdsABz_I1eXqXBvqnOqEhs3U/edit?gid=0#gid=0";
const BCYA_SHEET_URL = "https://docs.google.com/spreadsheets/d/1NZtNfQ9-P9KCVUUj9BYbf7mIdD2t_yO5wT5j8URquKE/edit?gid=0#gid=0";
const MEMBERS_SHEET_URL = "https://docs.google.com/spreadsheets/d/1VLdfZVk_IrvBV1INNtCTm15onyFKQHeqCmwwCp_a6KQ/edit?usp=sharing";

export default function Home() {
  return (
    <main className="min-h-screen container mx-auto px-4 py-8 md:py-12">
      <PageHeader />
      <Tabs defaultValue="bcm" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
          <TabsTrigger value="bcm">PROGRAMME</TabsTrigger>
          <TabsTrigger value="bcya">HLA ZIR</TabsTrigger>
          <TabsTrigger value="members">MEMBERS</TabsTrigger>
        </TabsList>
        <TabsContent value="bcm" className="mt-6">
          <EventSchedule sheetUrl={BCM_SHEET_URL} />
        </TabsContent>
        <TabsContent value="bcya" className="mt-6">
          <EventSchedule sheetUrl={BCYA_SHEET_URL} showAllEvents={true} />
        </TabsContent>
        <TabsContent value="members" className="mt-6">
          <MemberSchedule sheetUrl={MEMBERS_SHEET_URL} />
        </TabsContent>
      </Tabs>
    </main>
  );
}
