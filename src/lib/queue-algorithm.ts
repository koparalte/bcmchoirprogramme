import { ProgressMember } from "./types";

export function generateNextBatches(
   members: ProgressMember[], 
   history: Map<string, number>
) {
   // Filter out conductors
   const activeMembers = members.filter(m => {
       const p = (m.part || '').toUpperCase();
       const d = (m.designation || '').toUpperCase();
       return !p.includes('CONDUCTOR') && !d.includes('CONDUCTOR');
   });
   
   // Group by part
   const byPart = new Map<string, ProgressMember[]>();
   activeMembers.forEach(m => {
       let part = (m.part || 'UNKNOWN').toUpperCase();
       // Normalize part names just in case
       if (part.includes('SOPRANO')) part = 'SOPRANO';
       else if (part.includes('CONTRALTO')) part = 'CONTRALTO';
       else if (part.includes('TENOR')) part = 'TENOR';
       else if (part.includes('BASS')) part = 'BASS';

       if (!byPart.has(part)) byPart.set(part, []);
       byPart.get(part)!.push(m);
   });
   
   const batch1: string[] = [];
   const batch2: string[] = [];
   
   for (const [part, partMembers] of byPart.entries()) {
       // Sort members by times queued ascending, then shuffle the ties
       const sorted = partMembers
          .map(m => ({ 
             name: m.name, 
             times: history.get(m.name) || 0,
             rand: Math.random()
          }))
          .sort((a, b) => {
             if (a.times !== b.times) return a.times - b.times;
             return a.rand - b.rand;
          });
          
       // To ensure batch 1 and batch 2 consist of DIFFERENT people, we must divide the available pool.
       // If there are 8+ members, maxPerBatch is 4.
       // If there are 4 members, maxPerBatch is 2.
       // If there are 5 members, maxPerBatch is 3 (Batch 1 gets 3, Batch 2 gets 2).
       const totalAvailable = sorted.length;
       const maxPerBatch = Math.min(4, Math.ceil(totalAvailable / 2));
       
       const selectedForBatch1 = sorted.slice(0, maxPerBatch);
       const selectedForBatch2 = sorted.slice(maxPerBatch, maxPerBatch + 4); // Take up to 4 of the remaining
       
       selectedForBatch1.forEach(m => batch1.push(m.name));
       selectedForBatch2.forEach(m => batch2.push(m.name));
   }
   
   return { batch1, batch2 };
}
