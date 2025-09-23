import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <header className="flex flex-col items-center text-center mb-8 md:mb-12">
        <Image src="/logo.png" alt="BCM Choir Programme Logo" width="64" height="64" className="mb-4" />
        <Skeleton className="h-12 w-1/2" />
        <Skeleton className="h-6 w-3/4 mt-4" />
      </header>

      <div className="max-w-3xl mx-auto mb-8">
        <Skeleton className="h-40 w-full" />
      </div>

      <div className="mb-8">
        <Skeleton className="h-24 w-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    </div>
  );
}
