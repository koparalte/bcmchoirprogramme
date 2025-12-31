
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { type Member } from "@/lib/types";
import { Church, Music } from "lucide-react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";


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

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name.substring(0, 2);
  }


  return (
    <AnimatePresence>
      {isOpen && member && (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogContent className="sm:max-w-lg p-0">
             <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
             >
                <DialogHeader className="p-6">
                  <div className="flex flex-col items-center gap-4">
                      <div className="relative w-64 h-64 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                        {member.link ? (
                          <Image src={member.link} alt={member.name} layout="fill" objectFit="cover" />
                        ) : (
                          <span className="text-8xl text-muted-foreground">{getInitials(member.name)}</span>
                        )}
                      </div>
                    <DialogTitle className="text-2xl font-headline text-primary text-center">
                      {member.name}
                    </DialogTitle>
                  </div>
                </DialogHeader>
                <Separator />
                <div className="space-y-4 p-6">
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
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
