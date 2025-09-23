import Image from "next/image";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { EventSchedule } from "@/components/event-schedule";
import { AlertTriangle } from "lucide-react";

export default async function Home() {
  return (
    <main className="min-h-screen container mx-auto px-4 py-8 md:py-12">
      <header className="flex flex-col items-center text-center mb-8 md:mb-12">
        <Image src="/logo.png" alt="BCM Choir Programme Logo" width="64" height="64" className="mb-4" unoptimized />
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-primary uppercase">
          BCM CHOIR PROGRAMME
        </h1>
      </header>

      <EventSchedule />
      
    </main>
  );
}
