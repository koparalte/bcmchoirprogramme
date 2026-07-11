import { EventSchedule } from "@/components/event-schedule";
import { PageHeader } from "@/components/page-header";
import { HomeHero } from "@/components/home-hero";
import { MemberSchedule } from "@/components/member-schedule";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProgrammeTab } from "@/components/programme-tab";
import { HlaZirTab } from "@/components/hla-zir-tab";
import { AutoQueueTrigger } from "@/components/auto-queue-trigger";
import { getEvents } from "@/lib/actions";
const MEMBERS_SHEET_URL = "https://docs.google.com/spreadsheets/d/1VLdfZVk_IrvBV1INNtCTm15onyFKQHeqCmwwCp_a6KQ/edit?gid=0#gid=0";
const PROGRESS_SHEET_URL = "https://docs.google.com/spreadsheets/d/1kMlHvUW0fR-yQDKDxvV1ONErRItvVSTMRzH8IngA-QE/edit?usp=sharing";
const BCYA_SHEET_URL = "https://docs.google.com/spreadsheets/d/1NZtNfQ9-P9KCVUUj9BYbf7mIdD2t_yO5wT5j8URquKE/edit?gid=0#gid=0";

export default async function Home() {
  const [{ data: eventsData }] = await Promise.all([
    getEvents(BCYA_SHEET_URL, true)
  ]);

  let mostRecentPastDate = "";
  let nextEventDate = "";
  let secondEventDate = "";
  
  if (eventsData && eventsData.length > 0) {
      const today = new Date();
      today.setHours(0,0,0,0);
      
      const pastEvents = eventsData
         .filter((e: any) => e.startdate && new Date(e.startdate) < today)
         .sort((a: any, b: any) => new Date(b.startdate).getTime() - new Date(a.startdate).getTime());
      
      if (pastEvents.length > 0) {
          mostRecentPastDate = pastEvents[0].startdate;
      }
      
      const futureEvents = eventsData
         .filter((e: any) => e.startdate && new Date(e.startdate) >= today)
         .sort((a: any, b: any) => new Date(a.startdate).getTime() - new Date(b.startdate).getTime());
         
      if (futureEvents.length > 0) {
          nextEventDate = futureEvents[0].startdate;
      }
      if (futureEvents.length > 1) {
          secondEventDate = futureEvents[1].startdate;
      }
  }

  return (
    <main className="min-h-screen container mx-auto px-4 py-8 md:py-12 flex flex-col items-center">
      <PageHeader />
      <HomeHero nextEventDate={nextEventDate} secondEventDate={secondEventDate} />
      <AutoQueueTrigger 
         progressSheetUrl={PROGRESS_SHEET_URL} 
         bcyaSheetUrl={BCYA_SHEET_URL} 
         mostRecentPastDate={mostRecentPastDate} 
      />
      <div className="w-full max-w-5xl">
        <Tabs defaultValue="bcm" className="w-full">
          <TabsList className="flex justify-center w-full max-w-[500px] mx-auto bg-transparent mb-10 h-12 gap-2 md:gap-8 border-b border-white/10 rounded-none p-0">
            <TabsTrigger value="bcm" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary transition-all font-semibold tracking-widest text-xs md:text-sm h-full px-2 md:px-4 data-[state=active]:shadow-none text-muted-foreground uppercase hover:text-foreground">PROGRAMME</TabsTrigger>
            <TabsTrigger value="bcya" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary transition-all font-semibold tracking-widest text-xs md:text-sm h-full px-2 md:px-4 data-[state=active]:shadow-none text-muted-foreground uppercase hover:text-foreground">HLA ZIR</TabsTrigger>
            <TabsTrigger value="members" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary transition-all font-semibold tracking-widest text-xs md:text-sm h-full px-2 md:px-4 data-[state=active]:shadow-none text-muted-foreground uppercase hover:text-foreground">MEMBERS</TabsTrigger>
          </TabsList>
          
          <div className="relative">
            <TabsContent value="bcm" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <ProgrammeTab />
            </TabsContent>
            <TabsContent value="bcya" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <HlaZirTab />
            </TabsContent>
            <TabsContent value="members" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <MemberSchedule sheetUrl={MEMBERS_SHEET_URL} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </main>
  );
}
