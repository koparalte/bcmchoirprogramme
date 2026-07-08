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
  
  if (loggedInMember) {
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
  }

  // --- Leaderboard Calculation ---
  const scores = Array.from(new Set(mergedMembers.map(m => m.songs.filter(s => s.completed).length)))
      .filter(score => score > 0)
      .sort((a, b) => b - a);
      
  const goldScore = scores[0];
  const silverScore = scores[1];
  const bronzeScore = scores[2];

  // Assign medals to the members
  const membersWithMedals = mergedMembers.map(member => {
      const completed = member.songs.filter(s => s.completed).length;
      let medal: 'gold' | 'silver' | 'bronze' | undefined = undefined;
      
      if (completed > 0) {
          if (completed === goldScore) medal = 'gold';
          else if (completed === silverScore) medal = 'silver';
          else if (completed === bronzeScore) medal = 'bronze';
      }
      
      return {
          ...member,
          medal
      };
  });

  // Sort so the logged-in user is exactly at the top
  const sortedMembers = [...membersWithMedals].sort((a, b) => {
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
        
        {membersWithMedals.length === 0 && (
           <div className="text-center py-16 border border-white/5 bg-black/20 rounded-2xl shadow-inner">
              <h3 className="text-xl font-headline font-bold text-muted-foreground uppercase tracking-widest">No members found</h3>
           </div>
        )}
      </div>
    </main>
  );
}
