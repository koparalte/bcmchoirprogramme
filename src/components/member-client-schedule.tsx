
"use client";

import { motion } from "framer-motion";
import type { Member } from "@/lib/types";
import { MemberCard } from "./member-card";

export function MemberClientSchedule({ members }: { members: Member[] }) {
  return (
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
          <MemberCard member={member} />
        </motion.div>
      ))}
    </motion.div>
  );
}
