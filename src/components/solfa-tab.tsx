import { getSolfaTracks } from "@/lib/actions";
import { Music, Youtube, FileText, Download, Play, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

function extractDriveId(url: string) {
  const match = url.match(/[-\w]{25,}/);
  return match ? match[0] : null;
}

export async function SolfaTab({ sheetUrl }: { sheetUrl: string }) {
  if (!sheetUrl) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-white/10 rounded-3xl bg-zinc-900/30 mt-6">
        <h3 className="text-xl font-bold text-zinc-100 mb-2 font-headline uppercase tracking-widest">Coming Soon</h3>
        <p className="text-zinc-400 text-sm">The Solfa & Track database is being prepared.</p>
      </div>
    );
  }

  const { data: tracks, error } = await getSolfaTracks(sheetUrl);

  if (error) {
    return (
      <div className="text-red-400 p-8 text-center bg-red-950/20 border border-red-900/50 rounded-2xl">
        <p>Error loading Solfa & Tracks.</p>
        <p className="text-xs mt-2 opacity-70">{error}</p>
      </div>
    );
  }

  if (!tracks || tracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-white/10 rounded-3xl bg-zinc-900/30 mt-6">
        <p className="text-zinc-400 text-sm">No tracks found in the sheet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
      {tracks.map((track) => {
        const driveId = track.music ? extractDriveId(track.music) : null;
        const isDriveAudio = !!driveId;
        const sheetDriveId = track.sheet ? extractDriveId(track.sheet) : null;
        const sheetHref = sheetDriveId ? `https://drive.google.com/uc?export=download&id=${sheetDriveId}` : track.sheet;

        return (
          <Card key={track.id} className="bg-zinc-900/50 border-white/5 overflow-hidden group hover:border-primary/30 transition-colors">
            <CardContent className="p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Music className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-100 text-lg leading-tight">{track.name}</h3>
                  </div>
                </div>
              </div>

              {isDriveAudio ? (
                <div className="w-full mt-2 rounded-xl overflow-hidden border border-white/5 bg-black/10">
                  <iframe 
                    src={`https://drive.google.com/file/d/${driveId}/preview`} 
                    width="100%" 
                    height="180" 
                    allow="autoplay" 
                    className="w-full border-none"
                  ></iframe>
                </div>
              ) : track.music && (
                <div className="w-full mt-2 bg-black/30 rounded-xl p-3 border border-white/5">
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2 block ml-1">Audio Track</span>
                  <audio controls className="w-full h-10 rounded-md bg-transparent [&::-webkit-media-controls-panel]:bg-zinc-800" src={track.music}>
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-auto pt-2">
                {track.sheet && (
                  <a href={sheetHref} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-[120px] flex items-center justify-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg py-2.5 px-3 transition-colors text-xs font-bold uppercase tracking-widest">
                    <FileText className="w-4 h-4" />
                    <span>Solfa PDF</span>
                  </a>
                )}
                
                {track.songlink && (
                  <a href={track.songlink} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-[120px] flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg py-2.5 px-3 transition-colors text-xs font-bold uppercase tracking-widest">
                    <Youtube className="w-4 h-4" />
                    <span>YouTube</span>
                  </a>
                )}
                
                {track.music && (
                  <a 
                    href={isDriveAudio ? `https://drive.google.com/uc?export=download&id=${driveId}` : track.music} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex-1 min-w-[120px] flex items-center justify-center gap-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-lg py-2.5 px-3 transition-colors text-xs font-bold uppercase tracking-widest"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Track</span>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
