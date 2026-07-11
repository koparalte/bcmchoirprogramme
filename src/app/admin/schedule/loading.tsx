import { PageHeader } from "@/components/page-header";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <main className="min-h-screen container mx-auto px-4 py-8 md:py-12 flex flex-col items-center">
      <PageHeader />
      <div className="w-full max-w-5xl mt-24 flex flex-col items-center justify-center text-center">
         <Loader2 className="w-16 h-16 text-blue-500 animate-spin opacity-50 mb-6" />
         <h2 className="text-2xl font-black uppercase tracking-widest text-muted-foreground animate-pulse">Loading Live Data...</h2>
         <p className="text-sm mt-2 font-semibold text-muted-foreground/50">Fetching schedules and member history</p>
      </div>
    </main>
  );
}
