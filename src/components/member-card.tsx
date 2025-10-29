"use client";

import { Card, CardContent } from "@/components/ui/card";
import { User, Church } from "lucide-react";
import type { Member } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

type MemberCardProps = {
    member: Member;
    onSelectMember: (member: Member) => void;
}

export function MemberCard({ member, onSelectMember }: MemberCardProps) {
  return (
    <Card 
        className="cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
        onClick={() => onSelectMember(member)}
    >
      <CardContent className="p-4 flex items-start gap-4">
        <div className="bg-secondary p-3 rounded-full mt-1">
            <User className="w-6 h-6 text-secondary-foreground" />
        </div>
        <div className="flex flex-col flex-grow">
            <div className="flex items-center gap-2">
                <p className="text-lg font-medium text-foreground">{member.name}</p>
                {member.designation && (
                    <Badge variant="destructive" className="ml-auto">{member.designation}</Badge>
                )}
            </div>
            {member.kohhran && (
                <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                    <Church className="w-4 h-4" />
                    <p className="text-sm">{member.kohhran}</p>
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
