
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Member } from "@/lib/types";
import { MemberCard } from "./member-card";
import { MemberDetailsDialog } from "./member-details-dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const groupMembersByPart = (members: Member[]) => {
  const grouped = members.reduce((acc, member) => {
    const part = member.part?.trim();
    if (part) {
        if (!acc[part]) {
            acc[part] = [];
        }
        acc[part].push(member);
    }
    return acc;
  }, {} as Record<string, Member[]>);

  // Sort parts to have Conductor, Soprano, Contralto, Tenor, Bass first, then others alphabetically.
  const partOrder = ['Conductor', 'Soprano', 'Contralto', 'Tenor', 'Bass'];
  const sortedParts = Object.keys(grouped).sort((a, b) => {
      const indexA = partOrder.indexOf(a);
      const indexB = partOrder.indexOf(b);

      if (indexA > -1 && indexB > -1) return indexA - indexB; // Both in order list
      if (indexA > -1) return -1; // Only A is in order list
      if (indexB > -1) return 1;  // Only B is in order list
      return a.localeCompare(b); // Neither in order list, sort alphabetically
  });
  
  const sortedGrouped: Record<string, Member[]> = {};
  for(const part of sortedParts){
    sortedGrouped[part] = grouped[part];
  }

  return sortedGrouped;
};

export function MemberClientSchedule({ members }: { members: Member[] }) {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSelectMember = (member: Member) => {
    setSelectedMember(member);
    setIsDialogOpen(true);
  };

  const groupedMembers = groupMembersByPart(members);
  const defaultOpen = Object.keys(groupedMembers);

  return (
    <>
      <Accordion type="multiple" defaultValue={defaultOpen} className="w-full space-y-4">
        {Object.entries(groupedMembers).map(([part, partMembers]) => (
          <AccordionItem value={part} key={part}>
            <AccordionTrigger className="text-2xl font-bold text-primary hover:no-underline capitalize">
              {part} ({partMembers.length})
            </AccordionTrigger>
            <AccordionContent>
              <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                {partMembers.map((member) => (
                  <motion.div
                    key={member.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MemberCard member={member} onSelectMember={handleSelectMember} />
                  </motion.div>
                ))}
              </motion.div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <MemberDetailsDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        member={selectedMember}
      />
    </>
  );
}
