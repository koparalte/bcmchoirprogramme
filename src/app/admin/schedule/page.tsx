import { auth } from "@/auth";
import { getProgress, getMembers, getEvents, getQueueHistory, getPracticeCanceled } from "@/lib/actions";
import { PageHeader } from "@/components/page-header";
import { AdminScheduleClient } from "./client-page";

const PROGRESS_SHEET_URL = "https://docs.google.com/spreadsheets/d/1kMlHvUW0fR-yQDKDxvV1ONErRItvVSTMRzH8IngA-QE/edit?usp=sharing";
const MEMBERS_SHEET_URL = "https://docs.google.com/spreadsheets/d/1VLdfZVk_IrvBV1INNtCTm15onyFKQHeqCmwwCp_a6KQ/edit?gid=0#gid=0";
const BCYA_SHEET_URL = "https://docs.google.com/spreadsheets/d/1NZtNfQ9-P9KCVUUj9BYbf7mIdD2t_yO5wT5j8URquKE/edit?gid=0#gid=0";

export default async function AdminSchedulePage() {
  const session = await auth();
  const userEmail = session?.user?.email;
  
  if (!userEmail) return null;

  const [
    { data: progressData }, 
    { data: membersData },
    { history: queueHistory },
    { data: hlazirEvents },
    { canceled: isCanceled }
  ] = await Promise.all([
    getProgress(PROGRESS_SHEET_URL),
    getMembers(MEMBERS_SHEET_URL),
    getQueueHistory(PROGRESS_SHEET_URL),
    getEvents(BCYA_SHEET_URL, true),
    getPracticeCanceled(PROGRESS_SHEET_URL)
  ]);

  const loggedInMember = (membersData || []).find(m => m.email && m.email.toLowerCase() === userEmail.toLowerCase());
  
  if (!loggedInMember) {
     return <AccessDenied email={userEmail} />;
  }

  const isConductor = loggedInMember.part?.toUpperCase().includes('CONDUCTOR') || loggedInMember.designation?.toUpperCase().includes('CONDUCTOR') || false;

  if (!isConductor) {
     return <AccessDenied email={userEmail} isMemberButNotConductor={true} />;
  }

  // Next Practice Dates
  let nextEventDate = "";
  let secondEventDate = "";
  if (hlazirEvents && hlazirEvents.length > 0) {
      const { getISTDate } = await import("@/lib/utils");
      const today = getISTDate();
      today.setHours(0,0,0,0);
      const sortedUpcoming = hlazirEvents
         .filter(e => e.startdate && new Date(e.startdate) >= today)
         .sort((a, b) => new Date(a.startdate!).getTime() - new Date(b.startdate!).getTime());
      
      if (sortedUpcoming.length > 0) {
          nextEventDate = sortedUpcoming[0].startdate;
      }
      if (sortedUpcoming.length > 1) {
          secondEventDate = sortedUpcoming[1].startdate;
      }
  }

  return (
    <main className="min-h-screen container mx-auto px-4 py-8 md:py-12 flex flex-col items-center">
      <PageHeader />
      <div className="w-full max-w-5xl mt-8">
         <div className="mb-12 text-center">
            <h2 className="text-3xl md:text-4xl font-headline font-black uppercase tracking-widest text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">Queue Management</h2>
            <p className="text-muted-foreground uppercase tracking-widest mt-2 text-sm font-semibold">Conductor Access Only</p>
         </div>
         
         <AdminScheduleClient 
            members={progressData || []} 
            historyMap={queueHistory || new Map()} 
            sheetUrl={PROGRESS_SHEET_URL} 
            nextEventDate={nextEventDate}
            secondEventDate={secondEventDate}
            initialCanceled={isCanceled}
         />
      </div>
    </main>
  );
}

function AccessDenied({ email, isMemberButNotConductor }: { email: string, isMemberButNotConductor?: boolean }) {
   return (
       <main className="min-h-screen container mx-auto px-4 py-8 flex flex-col items-center justify-center text-center">
         <PageHeader />
         <div className="w-full max-w-2xl mt-24 p-8 border border-white/10 bg-black/40 rounded-3xl shadow-2xl backdrop-blur-sm">
            <h2 className="text-3xl font-black text-destructive uppercase tracking-widest drop-shadow-md">Access Denied</h2>
            <p className="mt-4 text-muted-foreground text-lg">
               {isMemberButNotConductor 
                  ? "This page is strictly restricted to Conductors and Assistant Conductors."
                  : `Your Google account (${email}) is not registered as a member of the choir.`
               }
            </p>
            <div className="mt-8">
               <a href="/" className="px-8 py-3 bg-primary text-primary-foreground font-bold tracking-widest uppercase rounded-lg hover:bg-primary/90 transition-colors">
                  Return Home
               </a>
            </div>
         </div>
       </main>
   );
}
