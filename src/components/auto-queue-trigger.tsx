"use client";

import { useEffect } from "react";
import { triggerAutoRotation } from "@/lib/actions";

export function AutoQueueTrigger({ 
   progressSheetUrl, 
   bcyaSheetUrl,
   mostRecentPastDate
}: { 
   progressSheetUrl: string, 
   bcyaSheetUrl: string,
   mostRecentPastDate: string
}) {
   useEffect(() => {
       if (!mostRecentPastDate) return;
       
       const lastChecked = localStorage.getItem('lastQueueTriggerDate');
       // If we have already checked for this specific past date, do nothing!
       if (lastChecked === mostRecentPastDate) return;

       // Fire and forget auto-rotation check in background
       triggerAutoRotation(progressSheetUrl, bcyaSheetUrl)
         .then((res) => {
             if (res.success) {
                 // Save the date so we don't trigger the server action again on refresh
                 localStorage.setItem('lastQueueTriggerDate', mostRecentPastDate);
             }
         })
         .catch(console.error);
   }, [progressSheetUrl, bcyaSheetUrl, mostRecentPastDate]);

   return null;
}
