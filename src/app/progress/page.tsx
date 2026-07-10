import { PageHeader } from "@/components/page-header";
import { getProgress, getMembers, getEvents, getBibleVerses } from "@/lib/actions";
import type { BibleVerse } from "@/lib/types";
import { ProgressCard } from "@/components/progress-card";
import { getISTDate } from "@/lib/utils";
import { auth } from "@/auth";

export const revalidate = 60; // Cache for 60 seconds

const PROGRESS_SHEET_URL = "https://docs.google.com/spreadsheets/d/1kMlHvUW0fR-yQDKDxvV1ONErRItvVSTMRzH8IngA-QE/edit?usp=sharing";
const MEMBERS_SHEET_URL = "https://docs.google.com/spreadsheets/d/1VLdfZVk_IrvBV1INNtCTm15onyFKQHeqCmwwCp_a6KQ/edit?gid=0#gid=0";
const BCYA_SHEET_URL = "https://docs.google.com/spreadsheets/d/1NZtNfQ9-P9KCVUUj9BYbf7mIdD2t_yO5wT5j8URquKE/edit?gid=0#gid=0";
const BIBLE_VERSES_SHEET_URL = "https://docs.google.com/spreadsheets/d/1j1witr2nLn-LYm-_8K3C03KMGZhhM_rIqRfBIsfQXC8/edit?gid=952167006#gid=952167006";

export default async function ProgressPage() {
  const session = await auth();
  const userEmail = session?.user?.email;

  const [
    { data: progressData, error: progressError }, 
    { data: membersData, error: membersError },
    { data: hlazirEvents },
    { data: bibleVerses }
  ] = await Promise.all([
    getProgress(PROGRESS_SHEET_URL),
    getMembers(MEMBERS_SHEET_URL),
    getEvents(BCYA_SHEET_URL, true),
    getBibleVerses(BIBLE_VERSES_SHEET_URL)
  ]);

  if (progressError) {
    return (
      <main className="min-h-screen container mx-auto px-4 py-8 flex flex-col items-center">
        <PageHeader />
        <div className="w-full max-w-5xl mt-12 text-center text-destructive">
           <h2 className="text-xl font-bold">Failed to load progress data</h2>
           <p className="mt-2">{progressError}</p>
        </div>
      </main>
    );
  }

  // Create a fast lookup map for members
  const membersMap = new Map();
  (membersData || []).forEach(m => {
     if (m.name) {
         membersMap.set(m.name.trim().toLowerCase(), m);
     }
  });

  // Merge the image links and emails from the Members sheet into the Progress data
  const mergedMembers = (progressData || []).map(progressMember => {
     const matchingMember = membersMap.get(progressMember.name.trim().toLowerCase());
     return {
        ...progressMember,
        link: matchingMember?.link,
        email: matchingMember?.email,
        designation: matchingMember?.designation
     };
  });

  const loggedInMember = (membersData || []).find(m => m.email && userEmail && m.email.toLowerCase() === userEmail.toLowerCase());
  
  // AUTHORIZATION CHECK: Block non-members
  if (!loggedInMember) {
     return (
       <main className="min-h-screen container mx-auto px-4 py-8 flex flex-col items-center justify-center text-center">
         <PageHeader />
         <div className="w-full max-w-2xl mt-24 p-8 border border-white/10 bg-black/40 rounded-3xl shadow-2xl backdrop-blur-sm">
            <h2 className="text-3xl font-black text-destructive uppercase tracking-widest drop-shadow-md">Access Denied</h2>
            <p className="mt-4 text-muted-foreground text-lg">
               You are logged in, but your Google account (<span className="text-foreground font-semibold">{userEmail}</span>) is not registered as a member of the choir.
            </p>
            <p className="mt-2 text-muted-foreground">
               Only official choir members can view the progress tracking page.
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

  const existsInProgress = mergedMembers.some(m => m.email?.toLowerCase() === userEmail?.toLowerCase());
  if (!existsInProgress) {
      mergedMembers.push({
          id: `conductor-${loggedInMember.id}`,
          name: loggedInMember.name,
          part: loggedInMember.part || loggedInMember.designation || 'Conductor',
          songs: [],
          queue: '',
          link: loggedInMember.link,
          email: loggedInMember.email
      });
  }

  let date1Str = "UPCOMING";
  let date2Str = "UPCOMING";
  if (hlazirEvents && hlazirEvents.length > 0) {
    const today = getISTDate();
    today.setHours(0,0,0,0);
    
    // Filter and sort upcoming events to be safe
    const sortedUpcoming = hlazirEvents
       .filter(e => e.startdate && new Date(e.startdate) >= today)
       .sort((a, b) => new Date(a.startdate!).getTime() - new Date(b.startdate!).getTime());

    const nextEvent = sortedUpcoming[0];
    if (nextEvent && nextEvent.startdate) {
      date1Str = `ON ${new Date(nextEvent.startdate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()}`;
    }
    
    const followingEvent = sortedUpcoming[1];
    if (followingEvent && followingEvent.startdate) {
      date2Str = `ON ${new Date(followingEvent.startdate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()}`;
    }
  }

  // Groups
  const heroMember = mergedMembers.find(m => m.email && userEmail && m.email.toLowerCase() === userEmail.toLowerCase());
  
  let assignedVerse: BibleVerse | undefined = undefined;
  if (heroMember && bibleVerses && bibleVerses.length > 0) {
      const today = getISTDate();
      
      // Calculate day of year (1-365)
      const start = new Date(today.getFullYear(), 0, 0);
      const diff = today.getTime() - start.getTime();
      const oneDay = 1000 * 60 * 60 * 24;
      const dayOfYear = Math.floor(diff / oneDay);
      
      // Create a perfectly unique offset for each of the 24 members
      // We sort the names alphabetically from the base membersData to guarantee a stable index across all pages
      const allNames = (membersData || []).filter(m => m.name).map(m => m.name).sort();
      const memberIndex = allNames.indexOf(heroMember.name);
      
      // Spread the members evenly across the 365 verses to maximize variety
      const spacing = Math.floor(bibleVerses.length / Math.max(allNames.length, 1));
      const memberOffset = memberIndex > -1 ? memberIndex * spacing : 0;
      
      // Select the verse index
      const verseIndex = (dayOfYear + memberOffset) % bibleVerses.length;
      assignedVerse = bibleVerses[verseIndex];
  }
  
  const isConductor = heroMember?.part.toUpperCase().includes('CONDUCTOR') || heroMember?.designation?.toUpperCase().includes('CONDUCTOR') || false;

  const queue1Members = mergedMembers.filter(m => m.queue === '1');
  const queue2Members = mergedMembers.filter(m => m.queue === '2');
  const restMembers = mergedMembers.filter(m => m !== heroMember && m.queue !== '1' && m.queue !== '2');

  return (
    <main className="min-h-screen container mx-auto px-4 py-8 md:py-12 flex flex-col items-center">
      <PageHeader />
      
      <div className="w-full max-w-7xl mt-12">
        <div className="mb-12 text-center">
           <h2 className="text-3xl md:text-4xl font-headline font-black uppercase tracking-widest text-primary drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">Member Progress</h2>
        </div>
        
        {heroMember && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 mb-12">
             <ProgressCard member={heroMember} isHero={true} bibleVerse={assignedVerse} isConductor={isConductor} />
          </div>
        )}

        {queue1Members.length > 0 && (
          <div className="mb-12">
            <div className="flex flex-col items-center mb-6">
               <h3 className="text-xl md:text-2xl font-black uppercase tracking-widest text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.3)]">ZAI TURTE</h3>
               <p className="text-muted-foreground font-semibold uppercase tracking-widest text-xs md:text-sm mt-1">{date1Str}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
               {queue1Members.map(member => (
                  <ProgressCard key={member.id} member={member} theme="red" isConductor={isConductor} />
               ))}
            </div>
          </div>
        )}

        {queue2Members.length > 0 && (
          <div className="mb-12">
            <div className="flex flex-col items-center mb-6">
               <h3 className="text-xl md:text-2xl font-black uppercase tracking-widest text-purple-500 drop-shadow-[0_0_10px_rgba(168,85,247,0.3)]">ZAI TURTE</h3>
               <p className="text-muted-foreground font-semibold uppercase tracking-widest text-xs md:text-sm mt-1">{date2Str}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
               {queue2Members.map(member => (
                  <ProgressCard key={member.id} member={member} theme="purple" isConductor={isConductor} />
               ))}
            </div>
          </div>
        )}

        {restMembers.length > 0 && (
          <div className="mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
               {restMembers.map(member => (
                  <ProgressCard key={member.id} member={member} theme="default" isConductor={isConductor} />
               ))}
            </div>
          </div>
        )}

        {mergedMembers.length === 0 && (
           <div className="text-center py-16 border border-white/5 bg-black/20 rounded-2xl shadow-inner">
              <h3 className="text-xl font-headline font-bold text-muted-foreground uppercase tracking-widest">No members found</h3>
           </div>
        )}
      </div>
    </main>
  );
}
