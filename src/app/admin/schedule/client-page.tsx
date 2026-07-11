"use client";

import { useState, useTransition } from "react";
import { saveManualOverrides, setPracticeCanceled } from "@/lib/actions";
import { ProgressMember } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Loader2, Edit2, Save, X, Ban } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export function AdminScheduleClient({ 
    members, 
    historyMap, 
    sheetUrl,
    nextEventDate,
    secondEventDate,
    initialCanceled
}: { 
    members: ProgressMember[], 
    historyMap: Map<string, number>,
    sheetUrl: string,
    nextEventDate: string,
    secondEventDate: string,
    initialCanceled: boolean
}) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    
    // Edit mode state
    const [isEditMode, setIsEditMode] = useState(false);
    const [isSavingOverrides, setIsSavingOverrides] = useState(false);
    const [localOverrides, setLocalOverrides] = useState<Record<string, '1' | '2' | ''>>({});

    const handleToggleCancel = async (checked: boolean) => {
        startTransition(async () => {
           const res = await setPracticeCanceled(sheetUrl, checked);
           if (res.success) {
               toast({ 
                  title: checked ? "Practice Canceled" : "Practice Restored", 
                  description: checked ? "The queue will NOT advance when this date passes." : "The queue will advance normally." 
               });
           } else {
               toast({ title: "Failed", description: res.error, variant: "destructive" });
           }
        });
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
        <div className="space-y-6 md:space-y-8">
            <div className={`flex flex-col md:flex-row items-center justify-between p-4 md:p-6 border rounded-xl gap-4 transition-colors ${initialCanceled ? 'bg-destructive/10 border-destructive/30' : 'bg-card'}`}>
               <div className="text-center md:text-left">
                  <h3 className="text-lg md:text-xl font-bold uppercase tracking-widest text-primary flex items-center justify-center md:justify-start gap-2">
                      Next Practice {initialCanceled && <Badge variant="destructive" className="ml-2 uppercase font-black">Canceled</Badge>}
                  </h3>
                  <p className="text-muted-foreground font-semibold mt-1">
                     {nextEventDate ? new Date(nextEventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : "No upcoming date found"}
                  </p>
               </div>
               <div className="flex items-center gap-3 md:gap-4 bg-black/40 px-4 py-2 md:px-6 md:py-3 rounded-xl border border-white/10 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-left md:text-right">
                     <p className="text-sm font-bold uppercase tracking-widest">Cancel Practice</p>
                     <p className="text-xs text-muted-foreground font-semibold">Freeze the queue</p>
                  </div>
                  <Switch 
                     checked={initialCanceled}
                     onCheckedChange={handleToggleCancel}
                     disabled={isPending}
                     className="data-[state=checked]:bg-destructive"
                  />
               </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center px-2 gap-4">
               <h2 className="text-xl md:text-2xl font-black uppercase tracking-widest text-foreground">Current Assignments</h2>
               
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
                <div className="mt-8 border rounded-xl p-4 md:p-6 border-slate-500/20 bg-slate-500/5 text-slate-400">
                    <h3 className="text-xl md:text-2xl font-black uppercase tracking-widest mb-4 md:mb-6 text-center">Unassigned Members</h3>
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
        <div className={`border rounded-xl p-4 md:p-6 ${themeClasses} shadow-sm`}>
            <div className="text-center mb-4 md:mb-6">
               <h3 className="text-xl md:text-2xl font-black uppercase tracking-widest leading-none">{title}</h3>
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
                    <div className="flex flex-col gap-2 md:gap-3 pl-1 md:pl-2">
                        {byPart.get(part)!.map(m => (
                            <div key={m.id} className="flex items-center justify-between py-1 border-b border-white/5 last:border-0 last:pb-0 gap-2">
                                <span className="font-semibold text-sm md:text-base leading-tight">{m.name}</span>
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
