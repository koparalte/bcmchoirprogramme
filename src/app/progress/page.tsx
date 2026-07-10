import { PageHeader } from "@/components/page-header";
import { getProgress, getMembers } from "@/lib/actions";
import { ProgressCard } from "@/components/progress-card";
import { auth } from "@/auth";

export const revalidate = 60; // Cache for 60 seconds

const PROGRESS_SHEET_URL = "https://docs.google.com/spreadsheets/d/1kMlHvUW0fR-yQDKDxvV1ONErRItvVSTMRzH8IngA-QE/edit?usp=sharing";
const MEMBERS_SHEET_URL = "https://docs.google.com/spreadsheets/d/1VLdfZVk_IrvBV1INNtCTm15onyFKQHeqCmwwCp_a6KQ/edit?gid=0#gid=0";

export default async function ProgressPage() {
  const session = await auth();
  const userEmail = session?.user?.email;

  const [{ data: progressData, error: progressError }, { data: membersData, error: membersError }] = await Promise.all([
    getProgress(PROGRESS_SHEET_URL),
    getMembers(MEMBERS_SHEET_URL)
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

  // Create a fast lookup map for members (O(N) time complexity instead of O(N^2))
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
        email: matchingMember?.email
     };
  });

  // If the logged in user is in Members but NOT in Progress (like a Conductor), add them manually!
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

  // They are a member! Check if they need to be added to the progress list manually (like conductors)
  const existsInProgress = mergedMembers.some(m => m.email?.toLowerCase() === userEmail?.toLowerCase());
  if (!existsInProgress) {
      // Add the conductor/missing member manually to the array
      mergedMembers.push({
          id: `conductor-${loggedInMember.id}`,
          name: loggedInMember.name,
          part: loggedInMember.part || loggedInMember.designation || 'Conductor',
          songs: [], // No songs to track for conductors
          link: loggedInMember.link,
          email: loggedInMember.email
      });
  }

  // Sort so the logged-in user is exactly at the top
  const sortedMembers = [...mergedMembers].sort((a, b) => {
      if (a.email && userEmail && a.email.toLowerCase() === userEmail.toLowerCase()) return -1;
      if (b.email && userEmail && b.email.toLowerCase() === userEmail.toLowerCase()) return 1;
      return 0;
  });

  return (
    <main className="min-h-screen container mx-auto px-4 py-8 md:py-12 flex flex-col items-center">
      <PageHeader />
      
      <div className="w-full max-w-7xl mt-12">
        <div className="mb-12 text-center">
           <h2 className="text-3xl md:text-4xl font-headline font-black uppercase tracking-widest text-primary drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">Member Progress</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
           {sortedMembers.map((member, idx) => {
              const isHero = !!(userEmail && member.email && member.email.toLowerCase() === userEmail.toLowerCase() && idx === 0);
              return (
                 <ProgressCard key={member.id} member={member} isHero={isHero} />
              )
           })}
        </div>
        
        {sortedMembers.length === 0 && (
           <div className="text-center py-16 border border-white/5 bg-black/20 rounded-2xl shadow-inner">
              <h3 className="text-xl font-headline font-bold text-muted-foreground uppercase tracking-widest">No members found</h3>
           </div>
        )}
      </div>
    </main>
  );
}
