
"use client";

import { useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import type { Member } from "@/lib/types";
import { MemberCard } from "./member-card";
import { MemberDetailsDialog } from "./member-details-dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const groupMembersByPart = (members: Member[]) => {
  const grouped = members.reduce((acc, member) => {
    const part = member.part?.trim() || "Unassigned";
    if (!acc[part]) {
      acc[part] = [];
    }
    acc[part].push(member);
    return acc;
  }, {} as Record<string, Member[]>);

  const partOrder = ['Conductor', 'Soprano', 'Contralto', 'Tenor', 'Bass'];
  const sortedParts = Object.keys(grouped).sort((a, b) => {
    const indexA = partOrder.indexOf(a);
    const indexB = partOrder.indexOf(b);

    if (a === 'Conductor') return -1;
    if (b === 'Conductor') return 1;

    if (indexA > -1 && indexB > -1) return indexA - indexB;
    if (indexA > -1) return -1;
    if (indexB > -1) return 1;
    if (a === 'Unassigned') return 1;
    if (b === 'Unassigned') return -1;
    return a.localeCompare(b);
  });

  const sortedGrouped: Record<string, Member[]> = {};
  for (const part of sortedParts) {
    if (part !== 'Unassigned') {
      sortedGrouped[part] = grouped[part];
    }
  }

  return sortedGrouped;
};

const MotionMemberCard = ({ member, onSelectMember }: { member: Member, onSelectMember: (member: Member) => void }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <motion.div ref={ref} style={{ y }}>
      <MemberCard member={member} onSelectMember={onSelectMember} />
    </motion.div>
  );
};

export function MemberClientSchedule({ members }: { members: Member[] }) {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const bannerImage = PlaceHolderImages.find(img => img.id.startsWith('members-banner'));
  
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start']
  });

  const bannerY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  const handleSelectMember = (member: Member) => {
    setSelectedMember(member);
    setIsDialogOpen(true);
  };

  const groupedMembers = groupMembersByPart(members);
  const conductors = groupedMembers['Conductor'] || [];
  delete groupedMembers['Conductor'];

  const defaultOpen = Object.keys(groupedMembers);

  return (
    <div ref={containerRef} className="relative">
      {bannerImage && (
        <div className="relative h-64 md:h-80 w-full rounded-lg mb-8 shadow-lg overflow-hidden">
            <motion.div className="h-full w-full relative" style={{ y: bannerY }}>
              <Image
                src={bannerImage.imageUrl}
                alt={bannerImage.description}
                fill
                className="object-cover"
                data-ai-hint={bannerImage.imageHint}
                priority
              />
              <div className="absolute inset-0 bg-black/30" />
            </motion.div>
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <h2 className="text-4xl md:text-6xl font-bold text-white text-center shadow-md">Our Members</h2>
           </div>
        </div>
      )}
      
      {conductors.length > 0 && (
        <div className="mb-6">
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {conductors.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                onSelectMember={handleSelectMember}
              />
            ))}
          </motion.div>
        </div>
      )}

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
                  <MotionMemberCard
                    key={member.id}
                    member={member}
                    onSelectMember={handleSelectMember}
                  />
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
    </div>
  );
}
