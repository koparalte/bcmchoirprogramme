"use client";

import { useState } from "react";
import { generateNextBatches } from "@/lib/queue-algorithm";
import { generateQueueSchedule } from "@/lib/actions";
import { ProgressMember } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export function AdminScheduleClient({ 
    members, 
    historyMap, 
    sheetUrl,
    nextEventDate
}: { 
    members: ProgressMember[], 
    historyMap: Map<string, number>,
    sheetUrl: string,
    nextEventDate: string
}) {
    const { toast } = useToast();
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        if (!confirm("Are you sure? This will overwrite the current queue assignments in Google Sheets and increment the history count for selected members.")) return;
        
        setIsGenerating(true);
        try {
            // Run algorithm
            const { batch1, batch2 } = generateNextBatches(members, historyMap);
            
            // Execute server action to save
            const result = await generateQueueSchedule(sheetUrl, batch1, batch2);
            
            if (result.success) {
                toast({
                    title: "Schedule Generated",
                    description: "Batch 1 and Batch 2 have been successfully randomized and saved to Google Sheets.",
                    variant: "default"
                });
            } else {
                throw new Error(result.error);
            }
        } catch (e: any) {
            toast({
                title: "Generation Failed",
                description: e.message || "An error occurred.",
                variant: "destructive"
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const currentBatch1 = members.filter(m => m.queue === '1');
    const currentBatch2 = members.filter(m => m.queue === '2');

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-card border rounded-xl gap-4">
               <div>
                  <h3 className="text-xl font-bold uppercase tracking-widest text-primary">Next Practice</h3>
                  <p className="text-muted-foreground font-semibold mt-1">
                     {nextEventDate ? new Date(nextEventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : "No upcoming date found"}
                  </p>
               </div>
               <div className="flex gap-4">
                  <Button 
                    onClick={handleGenerate} 
                    disabled={isGenerating}
                    className="font-bold tracking-widest uppercase bg-blue-600 hover:bg-blue-500 text-white"
                  >
                     {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                     Randomize Next Batches
                  </Button>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <BatchCard title="Batch 1" members={currentBatch1} theme="red" />
                <BatchCard title="Batch 2" members={currentBatch2} theme="purple" />
            </div>
            
            <p className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-8">
               Notice: To reschedule the date or manually swap members, please edit the Google Sheet directly for now. Full manual-override UI coming soon.
            </p>
        </div>
    );
}

function BatchCard({ title, members, theme }: { title: string, members: ProgressMember[], theme: 'red' | 'purple' }) {
    // Group members by part to display cleanly
    const byPart = new Map<string, ProgressMember[]>();
    members.forEach(m => {
        const p = (m.part || 'Unknown').toUpperCase();
        if (!byPart.has(p)) byPart.set(p, []);
        byPart.get(p)!.push(m);
    });
    
    const parts = Array.from(byPart.keys()).sort();
    
    const themeClasses = theme === 'red' 
      ? "border-red-500/20 bg-red-500/5 text-red-500" 
      : "border-purple-500/20 bg-purple-500/5 text-purple-500";

    return (
        <div className={`border rounded-xl p-6 ${themeClasses}`}>
            <h3 className="text-2xl font-black uppercase tracking-widest mb-6 text-center">{title}</h3>
            {parts.length === 0 ? (
                <p className="text-center opacity-50 uppercase tracking-widest font-semibold text-sm">Empty</p>
            ) : (
                <div className="space-y-6">
                    {parts.map(part => (
                        <div key={part}>
                            <Badge variant="outline" className="mb-3 tracking-widest font-bold opacity-80">{part}</Badge>
                            <div className="flex flex-col gap-2 pl-2">
                                {byPart.get(part)!.map(m => (
                                    <span key={m.id} className="font-semibold">{m.name}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
