
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Member } from "@/lib/types";
import { MemberCard } from "./member-card";
import { MemberDetailsDialog } from "./member-details-dialog";

export function MemberClientSchedule({ members }: { members: Member[] }) {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSelectMember = (member: Member) => {
    setSelectedMember(member);
    setIsDialogOpen(true);
  };

  return (
    <>
      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {members.map((member) => (
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
      <MemberDetailsDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        member={selectedMember}
      />
    </>
  );
}
