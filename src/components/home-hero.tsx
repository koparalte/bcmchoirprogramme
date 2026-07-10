import { getProgress, getMembers, getBibleVerses } from "@/lib/actions";
import { ProgressCard } from "@/components/progress-card";
import { auth } from "@/auth";
import type { BibleVerse } from "@/lib/types";
import { getISTDate } from "@/lib/utils";

const PROGRESS_SHEET_URL = "https://docs.google.com/spreadsheets/d/1kMlHvUW0fR-yQDKDxvV1ONErRItvVSTMRzH8IngA-QE/edit?usp=sharing";
const MEMBERS_SHEET_URL = "https://docs.google.com/spreadsheets/d/1VLdfZVk_IrvBV1INNtCTm15onyFKQHeqCmwwCp_a6KQ/edit?gid=0#gid=0";
const BIBLE_VERSES_SHEET_URL = "https://docs.google.com/spreadsheets/d/1j1witr2nLn-LYm-_8K3C03KMGZhhM_rIqRfBIsfQXC8/edit?gid=952167006#gid=952167006";

export async function HomeHero() {
  const session = await auth();
  const userEmail = session?.user?.email;
  
  if (!userEmail) return null;

  const [
    { data: progressData }, 
    { data: membersData },
    { data: bibleVerses }
  ] = await Promise.all([
    getProgress(PROGRESS_SHEET_URL),
    getMembers(MEMBERS_SHEET_URL),
    getBibleVerses(BIBLE_VERSES_SHEET_URL)
  ]);

  const loggedInMember = (membersData || []).find(m => m.email && m.email.toLowerCase() === userEmail.toLowerCase());
  if (!loggedInMember) return null;

  let heroMember = (progressData || []).find(m => m.name.trim().toLowerCase() === loggedInMember.name.trim().toLowerCase());
  
  if (heroMember) {
     heroMember = {
        ...heroMember,
        link: loggedInMember.link,
        email: loggedInMember.email,
        designation: loggedInMember.designation
     };
  } else {
      heroMember = {
          id: `conductor-${loggedInMember.id}`,
          name: loggedInMember.name,
          part: loggedInMember.part || loggedInMember.designation || 'Conductor',
          songs: [],
          queue: '',
          link: loggedInMember.link,
          email: loggedInMember.email,
          designation: loggedInMember.designation
      };
  }

  let assignedVerse: BibleVerse | undefined = undefined;
  if (bibleVerses && bibleVerses.length > 0) {
      const today = getISTDate();
      const start = new Date(today.getFullYear(), 0, 0);
      const diff = today.getTime() - start.getTime();
      const oneDay = 1000 * 60 * 60 * 24;
      const dayOfYear = Math.floor(diff / oneDay);
      
      const allNames = (membersData || []).filter(m => m.name).map(m => m.name).sort();
      const memberIndex = allNames.indexOf(heroMember.name);
      
      const spacing = Math.floor(bibleVerses.length / Math.max(allNames.length, 1));
      const memberOffset = memberIndex > -1 ? memberIndex * spacing : 0;
      
      const verseIndex = (dayOfYear + memberOffset) % bibleVerses.length;
      assignedVerse = bibleVerses[verseIndex];
  }
  
  const isConductor = heroMember?.part.toUpperCase().includes('CONDUCTOR') || heroMember?.designation?.toUpperCase().includes('CONDUCTOR') || false;

  return (
    <div className="w-full max-w-5xl mb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
         <ProgressCard member={heroMember} isHero={true} bibleVerse={assignedVerse} isConductor={isConductor} />
      </div>
    </div>
  );
}
