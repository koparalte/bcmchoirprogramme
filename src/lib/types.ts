export type Event = {
  id: string;
  title: string;
  programme: string;
  description: string;
  startdate: string; // YYYY-MM-DD
  enddate?: string; // YYYY-MM-DD
  zingzan?: string; // zing (day) or zan (night)
  time?: string;
};
