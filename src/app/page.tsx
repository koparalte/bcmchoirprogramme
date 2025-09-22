"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, PartyPopper } from "lucide-react";

import type { Event } from "@/lib/types";
import { getEvents } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { EventSchedule } from "@/components/event-schedule";
import { Logo } from "@/components/logo";

const FormSchema = z.object({
  sheetUrl: z.string().url({ message: "Please enter a valid Google Sheet URL." }),
});

export default function Home() {
  const [events, setEvents] = useState<Event[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      sheetUrl: "",
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true);
    setError(null);
    setEvents(null);

    const result = await getEvents(data.sheetUrl);

    if (result.error) {
      setError(result.error);
      toast({
        variant: "destructive",
        title: "Error fetching events",
        description: result.error,
      });
    } else {
      setEvents(result.data || []);
    }
    setIsLoading(false);
  }

  return (
    <main className="min-h-screen container mx-auto px-4 py-8 md:py-12">
      <header className="flex flex-col items-center text-center mb-8 md:mb-12">
        <Logo className="w-16 h-16 mb-4" />
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-primary">
          SheetSync Events
        </h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-2xl">
          Instantly create a beautiful, filterable event schedule from your Google Sheet.
        </p>
      </header>

      <Card className="max-w-3xl mx-auto mb-8 shadow-lg">
        <CardHeader>
          <CardTitle>Enter Google Sheet URL</CardTitle>
          <CardDescription>
            Publish your sheet to the web and paste the URL here to load events.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row items-start gap-4">
              <FormField
                control={form.control}
                name="sheetUrl"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="sr-only">Google Sheet URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://docs.google.com/spreadsheets/d/..."
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto bg-accent hover:bg-accent/90">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading
                  </>
                ) : (
                  "Load Events"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {isLoading && (
        <div className="text-center p-8">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary"/>
            <p className="mt-4 text-muted-foreground">Fetching your events...</p>
        </div>
      )}

      {error && !isLoading && (
         <Card className="max-w-3xl mx-auto text-center p-8 border-destructive/50 bg-destructive/10">
           <h3 className="text-xl font-semibold text-destructive">An Error Occurred</h3>
           <p className="mt-2 text-destructive/80">{error}</p>
           <Button variant="destructive" className="mt-4" onClick={() => onSubmit(form.getValues())}>Try Again</Button>
         </Card>
      )}

      {events && !isLoading && (
        events.length > 0 
          ? <EventSchedule events={events} />
          : (
            <div className="text-center p-8 mt-8 border-2 border-dashed rounded-lg">
              <PartyPopper className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-xl font-semibold">All Clear!</h3>
              <p className="mt-1 text-muted-foreground">No events found in the sheet, or the sheet is empty.</p>
            </div>
          )
      )}
    </main>
  );
}
