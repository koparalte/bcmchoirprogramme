
import { getMembers, getBannerUrl } from "@/lib/actions";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, PartyPopper } from "lucide-react";
import { MemberClientSchedule } from "./member-client-schedule";

const BANNER_SHEET_URL = "https://docs.google.com/spreadsheets/d/1EeZKOlNySd3VG93XPWMAs5moSGfzsPQ0kjl9Bqugu7s/edit?usp=sharing";

export async function MemberSchedule({ sheetUrl }: { sheetUrl: string }) {
  const { data: members, error: membersError } = await getMembers(sheetUrl);
  const { data: bannerUrl, error: bannerError } = await getBannerUrl(BANNER_SHEET_URL);

  const error = membersError || bannerError;

  if (error) {
    return (
       <Card className="max-w-3xl mx-auto text-center p-8 border-destructive/50 bg-destructive/10">
         <CardContent className="pt-6">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
          <h3 className="mt-4 text-xl font-semibold text-destructive">An Error Occurred</h3>
          <p className="mt-2 text-destructive/80">{error}</p>
          <p className="mt-4 text-sm text-muted-foreground">Please check your Google Sheet URL and make sure it's published to the web.</p>
         </CardContent>
       </Card>
    )
  }

  if (!members || members.length === 0) {
    return (
      <div className="text-center p-8 mt-8 border-2 border-dashed rounded-lg">
        <PartyPopper className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-xl font-semibold">No Members Found</h3>
        <p className="mt-1 text-muted-foreground">The sheet is empty or no names are listed.</p>
      </div>
    )
  }

  return <MemberClientSchedule members={members} bannerUrl={bannerUrl} />;
}
