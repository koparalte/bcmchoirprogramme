"use client";

import { useState } from "react";
import { generateNextBatches } from "@/lib/queue-algorithm";
import { generateQueueSchedule, saveManualOverrides } from "@/lib/actions";
import { ProgressMember } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Loader2, Edit2, Save, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function AdminScheduleClient({ 
    members, 
    historyMap, 
    sheetUrl,
    nextEventDate,
    secondEventDate
}: { 
    members: ProgressMember[], 
    historyMap: Map<string, number>,
    sheetUrl: string,
    nextEventDate: string,
    secondEventDate: string
}) {
    const { toast } = useToast();
    const [isGenerating, setIsGenerating] = useState(false);
    
    // Edit mode state
    const [isEditMode, setIsEditMode] = useState(false);
    const [isSavingOverrides, setIsSavingOverrides] = useState(false);
    const [localOverrides, setLocalOverrides] = useState<Record<string, '1' | '2' | ''>>({});

    const handleGenerate = async () => {
        if (!confirm("Are you sure? This will overwrite the current queue assignments in Google Sheets and increment the history count for selected members.")) return;
        
        setIsGenerating(true);
        try {
            const { batch1, batch2 } = generateNextBatches(members, historyMap);
            const result = await generateQueueSchedule(sheetUrl, batch1, batch2);
            
            if (result.success) {
                toast({ title: "Schedule Generated", description: "Batches saved successfully." });
                setLocalOverrides({});
                setIsEditMode(false);
            } else {
                throw new Error(result.error);
            }
        } catch (e: any) {
            toast({ title: "Generation Failed", description: e.message, variant: "destructive" });
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleSaveOverrides = async () => {
        if (Object.keys(localOverrides).length === 0) {
            setIsEditMode(false);
            return;
        }
        
        setIsSavingOverrides(true);
        try {
            const result = await saveManualOverrides(sheetUrl, localOverrides);
            if (result.success) {
                toast({ title: "Overrides Saved", description: "Member assignments updated." });
                setLocalOverrides({});
                setIsEditMode(false);
            } else {
                throw new Error(result.error);
            }
        } catch (e: any) {
            toast({ title: "Save Failed", description: e.message, variant: "destructive" });
        } finally {
            setIsSavingOverrides(false);
        }
    };

    const handleOverrideChange = (name: string, val: string) => {
        setLocalOverrides(prev => ({
            ...prev,
            [name]: val as '1' | '2' | ''
        }));
    };

    const getEffectiveQueue = (m: ProgressMember) => {
        if (localOverrides[m.name] !== undefined) return localOverrides[m.name];
        return m.queue;
    };

    // Filter out conductors entirely from the view, they don't get queued
    const activeMembers = members.filter(m => {
        const p = (m.part || '').toUpperCase();
        const d = (m.designation || '').toUpperCase();
        return !p.includes('CONDUCTOR') && !d.includes('CONDUCTOR');
    });

    const currentBatch1 = activeMembers.filter(m => getEffectiveQueue(m) === '1');
    const currentBatch2 = activeMembers.filter(m => getEffectiveQueue(m) === '2');
    const unassigned = activeMembers.filter(m => getEffectiveQueue(m) !== '1' && getEffectiveQueue(m) !== '2');

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
                    disabled={isGenerating || isEditMode}
                    className="font-bold tracking-widest uppercase bg-blue-600 hover:bg-blue-500 text-white"
                  >
                     {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                     Randomize Next Batches
                  </Button>
               </div>
            </div>

            <div className="flex justify-between items-center px-2">
               <h2 className="text-2xl font-black uppercase tracking-widest text-foreground">Current Assignments</h2>
               
               {isEditMode ? (
                   <div className="flex gap-2">
                       <Button variant="ghost" onClick={() => { setIsEditMode(false); setLocalOverrides({}); }} disabled={isSavingOverrides}>
                           <X className="w-4 h-4 mr-2" /> Cancel
                       </Button>
                       <Button onClick={handleSaveOverrides} disabled={isSavingOverrides} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold tracking-widest uppercase">
                           {isSavingOverrides ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save Changes
                       </Button>
                   </div>
               ) : (
                   <Button variant="outline" onClick={() => setIsEditMode(true)} className="font-bold tracking-widest uppercase border-white/20">
                       <Edit2 className="w-4 h-4 mr-2" /> Edit Members
                   </Button>
               )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <BatchCard 
                   title="Batch 1" 
                   date={nextEventDate}
                   members={currentBatch1} 
                   theme="red" 
                   isEditMode={isEditMode} 
                   onOverride={handleOverrideChange} 
                />
                <BatchCard 
                   title="Batch 2" 
                   date={secondEventDate}
                   members={currentBatch2} 
                   theme="purple" 
                   isEditMode={isEditMode} 
                   onOverride={handleOverrideChange} 
                />
            </div>
            
            {isEditMode && (
                <div className="mt-8 border rounded-xl p-6 border-slate-500/20 bg-slate-500/5 text-slate-400">
                    <h3 className="text-2xl font-black uppercase tracking-widest mb-6 text-center">Unassigned Members</h3>
                    <BatchCardContent members={unassigned} isEditMode={true} onOverride={handleOverrideChange} />
                </div>
            )}
        </div>
    );
}

function BatchCard({ title, date, members, theme, isEditMode, onOverride }: { title: string, date?: string, members: ProgressMember[], theme: 'red' | 'purple', isEditMode: boolean, onOverride: (name: string, val: string) => void }) {
    const themeClasses = theme === 'red' 
      ? "border-red-500/20 bg-red-500/5 text-red-500" 
      : "border-purple-500/20 bg-purple-500/5 text-purple-500";

    return (
        <div className={`border rounded-xl p-6 ${themeClasses}`}>
            <div className="text-center mb-6">
               <h3 className="text-2xl font-black uppercase tracking-widest leading-none">{title}</h3>
               {date && (
                  <p className="text-xs font-bold uppercase tracking-widest opacity-70 mt-2">
                     {new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
               )}
            </div>
            <BatchCardContent members={members} isEditMode={isEditMode} onOverride={onOverride} />
        </div>
    );
}

function BatchCardContent({ members, isEditMode, onOverride }: { members: ProgressMember[], isEditMode: boolean, onOverride: (name: string, val: string) => void }) {
    const byPart = new Map<string, ProgressMember[]>();
    members.forEach(m => {
        let p = (m.part || 'Unknown').toUpperCase();
        if (p.includes('SOPRANO')) p = 'SOPRANO';
        else if (p.includes('CONTRALTO')) p = 'CONTRALTO';
        else if (p.includes('TENOR')) p = 'TENOR';
        else if (p.includes('BASS')) p = 'BASS';
        
        if (!byPart.has(p)) byPart.set(p, []);
        byPart.get(p)!.push(m);
    });
    
    const parts = Array.from(byPart.keys()).sort();

    if (parts.length === 0) {
        return <p className="text-center opacity-50 uppercase tracking-widest font-semibold text-sm">Empty</p>;
    }

    return (
        <div className="space-y-6">
            {parts.map(part => (
                <div key={part}>
                    <Badge variant="outline" className="mb-3 tracking-widest font-bold opacity-80">{part}</Badge>
                    <div className="flex flex-col gap-3 pl-2">
                        {byPart.get(part)!.map(m => (
                            <div key={m.id} className="flex items-center justify-between">
                                <span className="font-semibold">{m.name}</span>
                                {isEditMode && (
                                    <Select 
                                       defaultValue={m.queue || "none"} 
                                       onValueChange={(val) => onOverride(m.name, val === "none" ? "" : val)}
                                    >
                                      <SelectTrigger className="w-[120px] h-8 text-xs bg-black/50 border-white/20">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="1">Batch 1</SelectItem>
                                        <SelectItem value="2">Batch 2</SelectItem>
                                        <SelectItem value="none">None</SelectItem>
                                      </SelectContent>
                                    </Select>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
