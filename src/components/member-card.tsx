"use client";

import { Card, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";

export function MemberCard({ name }: { name: string }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        <div className="bg-secondary p-2 rounded-full">
            <User className="w-6 h-6 text-secondary-foreground" />
        </div>
        <p className="text-lg font-medium text-foreground">{name}</p>
      </CardContent>
    </Card>
  );
}
