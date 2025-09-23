"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { getEventSummary } from "@/lib/actions";
import { type Event } from "@/lib/types";
import { Loader2, Sparkles, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

type EventSummaryDialogProps = {
  event: Event | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EventSummaryDialog({
  event,
  isOpen,
  onOpenChange,
}: EventSummaryDialogProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const { toast } = useToast();

  const handleGenerateSummary = async () => {
    if (!event?.description) return;
    setIsSummarizing(true);
    setSummary(null);
    const result = await getEventSummary(event.description);
    if (result.error) {
      toast({
        variant: "destructive",
        title: "Summarization Error",
        description: result.error,
      });
    } else {
      setSummary(result.summary || "No summary could be generated.");
    }
    setIsSummarizing(false);
  };
  
  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      setSummary(null);
      setIsSummarizing(false);
    }
  }

  if (!event) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90svh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline text-primary pr-10">{event.title}</DialogTitle>
          {event.programme && <p className="text-muted-foreground mt-1">{event.programme}</p>}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(event.date), 'PPP')}</span>
            </div>
          </div>
        </DialogHeader>
        <Separator />
        <ScrollArea className="flex-grow">
          <div className="pr-6 space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent" />
                  AI Summary
                </h3>
                <Button
                  size="sm"
                  onClick={handleGenerateSummary}
                  disabled={isSummarizing}
                  variant="outline"
                  className="bg-accent/10 text-accent-foreground hover:bg-accent/20 border-accent/30"
                >
                  {isSummarizing ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating</>
                  ) : (
                    "Generate Summary"
                  )}
                </Button>
              </div>

              {isSummarizing && (
                <div className="rounded-lg border bg-card p-4 space-y-2 animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              )}
              {summary && (
                <div className="prose prose-sm dark:prose-invert max-w-none p-4 bg-primary/5 border border-primary/20 rounded-lg text-foreground">
                  <p>{summary}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Full Description</h3>
              <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
                {event.description || "No description available."}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
