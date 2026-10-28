import { PageHeader } from "@/components/page-header";
import { HomeHero } from "@/components/home-hero";
import { MemberSchedule } from "@/components/member-schedule";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProgrammeTab } from "@/components/programme-tab";
import { HlaZirTab } from "@/components/hla-zir-tab";
import { SolfaTab } from "@/components/solfa-tab";
import { CalendarOnly } from "@/components/calendar-only";
import { AutoQueueTrigger } from "@/components/auto-queue-trigger";
import { getEvents, getMembers } from "@/lib/actions";
import { auth } from "@/auth";
import type { Event } from "@/lib/types";

const MEMBERS_SHEET_URL = "https://docs.google.com/spreadsheets/d/1VLdfZVk_IrvBV1INNtCTm15onyFKQHeqCmwwCp_a6KQ/edit?gid=0#gid=0";
const PROGRESS_SHEET_URL = "https://docs.google.com/spreadsheets/d/1kMlHvUW0fR-yQDKDxvV1ONErRItvVSTMRzH8IngA-QE/edit?usp=sharing";
const BCM_SHEET_URL = "https://docs.google.com/spreadsheets/d/1xeyiLqMDULNfycqE2zStdsABz_I1eXqXBvqnOqEhs3U/edit?gid=0#gid=0";
const BCYA_SHEET_URL = "https://docs.google.com/spreadsheets/d/1NZtNfQ9-P9KCVUUj9BYbf7mIdD2t_yO5wT5j8URquKE/edit?gid=0#gid=0";
const SOLFA_SHEET_URL = "https://docs.google.com/spreadsheets/d/1rDQk-t0aKI1OqsiYHUYg6i-KJXhF2QdlnPnjViBvkgU/edit?usp=sharing";

export default async function Home() {
  const [{ data: eventsData }, session, { data: membersData }, { data: programmeData }] = await Promise.all([
    getEvents(BCYA_SHEET_URL, true),
    auth(),
    getMembers(MEMBERS_SHEET_URL),
    getEvents(BCM_SHEET_URL),
  ]);

  const userEmail = session?.user?.email;
  const isMember = !!(userEmail && (membersData || []).some(m => m.email && m.email.toLowerCase() === userEmail.toLowerCase()));

  let mostRecentPastDate = "";
  let nextEventDate = "";
  let secondEventDate = "";
  
  if (eventsData && eventsData.length > 0) {
      const { getISTDate } = await import("@/lib/utils");
      const today = getISTDate();
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

  // Build calendar events for the standalone calendar (non-members)
  const allEventsForCalendar: Event[] = [
    ...(programmeData || []).map(e => ({ ...e, type: 'programme' })),
    ...(eventsData || []).map(e => ({ ...e, type: 'hlazir' })),
  ];

  const defaultTab = isMember ? "bcm" : "members";
  const tabTriggerClass = "rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary transition-all font-semibold tracking-widest text-[11px] sm:text-xs md:text-sm h-full px-2 md:px-4 data-[state=active]:shadow-none text-muted-foreground uppercase hover:text-foreground whitespace-nowrap";

  return (
    <main className="min-h-screen container mx-auto px-4 py-8 md:py-12 flex flex-col items-center">
      <PageHeader />
      <HomeHero nextEventDate={nextEventDate} secondEventDate={secondEventDate} />
      <AutoQueueTrigger 
         progressSheetUrl={PROGRESS_SHEET_URL} 
         bcyaSheetUrl={BCYA_SHEET_URL} 
         mostRecentPastDate={mostRecentPastDate} 
      />

      {/* Calendar shown to everyone */}
      {!isMember && allEventsForCalendar.length > 0 && (
        <div className="w-full max-w-5xl mb-10">
          <CalendarOnly events={allEventsForCalendar} />
        </div>
      )}

      <div className="w-full max-w-5xl">
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="flex justify-between sm:justify-center w-full max-w-[650px] mx-auto bg-transparent mb-10 h-12 gap-0 sm:gap-2 md:gap-8 border-b border-white/10 rounded-none p-0 overflow-x-auto hide-scrollbar">
            {isMember && (
              <>
                <TabsTrigger value="bcm" className={tabTriggerClass}>PROGRAMME</TabsTrigger>
                <TabsTrigger value="bcya" className={tabTriggerClass}>HLA ZIR</TabsTrigger>
              </>
            )}
            <TabsTrigger value="members" className={tabTriggerClass}>MEMBERS</TabsTrigger>
            <TabsTrigger value="solfa" className={tabTriggerClass}>SOLFA & TRACK</TabsTrigger>
          </TabsList>
          
          <div className="relative">
            {isMember && (
              <>
                <TabsContent value="bcm" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                  <ProgrammeTab />
                </TabsContent>
                <TabsContent value="bcya" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                  <HlaZirTab />
                </TabsContent>
              </>
            )}
            <TabsContent value="members" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <MemberSchedule sheetUrl={MEMBERS_SHEET_URL} />
            </TabsContent>
            <TabsContent value="solfa" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <SolfaTab sheetUrl={SOLFA_SHEET_URL} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </main>
  );
}
