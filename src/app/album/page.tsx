import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Images, AlertTriangle } from "lucide-react";
import { getAlbumPhotos } from "@/lib/actions";
import { AlbumGallery } from "@/components/album-gallery";
import { Card, CardContent } from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Photo Album | BCM Choir",
  description: "BCM Choir Photo Gallery",
};

export const revalidate = 60; // Revalidate every 60 seconds

const BANNER_SHEET_URL = "https://docs.google.com/spreadsheets/d/1EeZKOlNySd3VG93XPWMAs5moSGfzsPQ0kjl9Bqugu7s/edit?usp=sharing";
const LOGO_URL = "https://lh3.googleusercontent.com/d/1yOgPWEoQhO6nWt2AmwM4lxXgRsoZs7nM";

export default async function AlbumPage() {
  const { data: photos, error } = await getAlbumPhotos(BANNER_SHEET_URL);

  return (
    <main className="min-h-screen bg-background text-foreground py-6 md:py-12 px-3 sm:px-4 md:px-8 container mx-auto flex flex-col items-center">
      {/* Top Navigation */}
      <div className="w-full max-w-7xl flex items-center justify-between mb-6 md:mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[11px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors bg-white/5 hover:bg-white/10 border border-white/10 px-3.5 py-1.5 md:px-4 md:py-2 rounded-full backdrop-blur-md"
        >
          <ArrowLeft className="w-3.5 h-3.5 md:w-4 md:h-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Cinematic Header */}
      <header className="flex flex-col items-center text-center mb-6 md:mb-10 max-w-2xl mx-auto">
        <div className="relative p-3 md:p-4 mb-3 md:mb-4 rounded-2xl bg-card border border-white/5 shadow-2xl">
          <Image
            src={LOGO_URL}
            alt="BCM Choir Logo"
            width={44}
            height={44}
            className="opacity-90 grayscale hover:grayscale-0 transition-all duration-500"
          />
        </div>
        <h1 className="font-headline text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground uppercase pb-1">
          BCM Choir Album
        </h1>
        <div className="h-0.5 md:h-1 w-16 md:w-20 bg-primary mt-3 md:mt-4 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
      </header>

      {/* Main Content */}
      <div className="w-full max-w-7xl">
        {error && (!photos || photos.length === 0) ? (
          <Card className="max-w-md mx-auto text-center p-8 border-destructive/50 bg-destructive/10 rounded-2xl">
            <CardContent className="pt-6">
              <AlertTriangle className="mx-auto h-10 w-10 text-destructive mb-3" />
              <h3 className="text-lg font-bold text-destructive">Failed to Load Photos</h3>
              <p className="mt-2 text-xs text-destructive/80">{error}</p>
            </CardContent>
          </Card>
        ) : !photos || photos.length === 0 ? (
          <div className="text-center p-12 border border-dashed border-white/10 rounded-3xl max-w-md mx-auto bg-black/20">
            <Images className="mx-auto h-12 w-12 text-muted-foreground mb-3 opacity-50" />
            <h3 className="text-lg font-bold text-foreground">No Photos Found</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Add photo links to your Google Sheet to display them here.
            </p>
          </div>
        ) : (
          <AlbumGallery photos={photos} />
        )}
      </div>
    </main>
  );
}
