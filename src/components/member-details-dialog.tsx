"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { type Member } from "@/lib/types";
import { User, Church, Music } from "lucide-react";

type MemberDetailsDialogProps = {
  member: Member | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

export function MemberDetailsDialog({
  member,
  isOpen,
  onOpenChange,
}: MemberDetailsDialogProps) {

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
  }

  if (!member) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline text-primary flex items-center gap-3">
            <User className="w-6 h-6" />
            {member.name}
          </DialogTitle>
        </DialogHeader>
        <Separator />
        <div className="space-y-4 py-2">
            {member.kohhran && (
                <div className="flex items-center gap-3 text-muted-foreground">
                    <Church className="w-5 h-5" />
                    <span>{member.kohhran}</span>
                </div>
            )}
            <div className="flex items-start gap-3 text-muted-foreground">
                <Music className="w-5 h-5 mt-0.5" />
                <div className="flex flex-col">
                    <span className="font-semibold text-foreground">Part</span>
                    {member.part ? (
                        <span className="whitespace-pre-wrap">{member.part}</span>
                    ) : (
                        <span>No part assigned.</span>
                    )}
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
