"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { type Member } from "@/lib/types";
import { User, Church, Music } from "lucide-react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


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

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name.substring(0, 2);
  }


  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex flex-col items-center gap-4">
              <Avatar className="w-24 h-24 text-3xl">
                <AvatarImage src={member.link} alt={member.name} />
                <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
              </Avatar>
            <DialogTitle className="text-2xl font-headline text-primary text-center">
              {member.name}
            </DialogTitle>
          </div>
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
