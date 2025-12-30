
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { User, Church } from "lucide-react";
import type { Member } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import Image from "next/image";

type MemberCardProps = {
    member: Member;
    onSelectMember: (member: Member) => void;
}

export function MemberCard({ member, onSelectMember }: MemberCardProps) {

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name.substring(0, 2);
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
          className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full"
          onClick={() => onSelectMember(member)}
      >
        <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-muted flex items-center justify-center mb-4">
              {member.link ? (
                <Image src={member.link} alt={member.name} layout="fill" objectFit="cover" />
              ) : (
                <span className="text-3xl text-muted-foreground">{getInitials(member.name)}</span>
              )}
            </div>
          
            <div className="flex flex-col items-center flex-grow">
                <div className="flex items-center gap-2">
                    <p className="text-lg font-medium text-foreground">{member.name}</p>
                    
                </div>
                {member.designation && (
                    <Badge variant="destructive" className="mt-1">{member.designation}</Badge>
                )}
                {member.kohhran && (
                    <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                        <Church className="w-4 h-4" />
                        <p className="text-sm">{member.kohhran}</p>
                    </div>
                )}
            </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
