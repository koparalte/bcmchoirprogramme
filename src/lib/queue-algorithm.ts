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
       // Promote existing Batch 2 to Batch 1
       const existingBatch2 = partMembers.filter(m => m.queue === '2');
       existingBatch2.forEach(m => batch1.push(m.name));
       
       // If there were NO existing Batch 2 members (e.g. first time ever), we need to generate Batch 1 from scratch
       let neededForBatch1 = existingBatch2.length === 0 ? 4 : 0;
       
       // The remaining members are those NOT promoted to Batch 1
       const remainingPool = partMembers.filter(m => !batch1.includes(m.name));
       
       // Sort remaining members by times queued ascending, then shuffle the ties
       const sortedPool = remainingPool
          .map(m => ({ 
             name: m.name, 
             times: history.get(m.name) || 0,
             rand: Math.random()
          }))
          .sort((a, b) => {
             if (a.times !== b.times) return a.times - b.times;
             return a.rand - b.rand;
          });
          
       // If we need to build Batch 1 from scratch (first run)
       if (neededForBatch1 > 0) {
           const maxForBatch1 = Math.min(neededForBatch1, Math.ceil(sortedPool.length / 2));
           const newlySelectedForBatch1 = sortedPool.splice(0, maxForBatch1);
           newlySelectedForBatch1.forEach(m => batch1.push(m.name));
       }
       
       // Now generate a fresh Batch 2 from whatever is left in the sorted pool
       // We cap the new Batch 2 size to 4, or whatever is appropriate if the pool is small.
       // Actually, if the pool is very small (like Tenors), they just take the remaining pool (up to 4).
       const maxForBatch2 = Math.min(4, sortedPool.length);
       const newlySelectedForBatch2 = sortedPool.slice(0, maxForBatch2);
       
       newlySelectedForBatch2.forEach(m => batch2.push(m.name));
   }
   
   return { batch1, batch2 };
}

