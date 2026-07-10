"use client";

import { useEffect } from "react";
import { triggerAutoRotation } from "@/lib/actions";

export function AutoQueueTrigger({ 
   progressSheetUrl, 
   bcyaSheetUrl 
}: { 
   progressSheetUrl: string, 
   bcyaSheetUrl: string 
}) {
   useEffect(() => {
       // Fire and forget auto-rotation check on background
       triggerAutoRotation(progressSheetUrl, bcyaSheetUrl).catch(console.error);
   }, [progressSheetUrl, bcyaSheetUrl]);

   return null;
}
