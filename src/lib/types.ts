export type Event = {
  id: string;
  title: string;
  programme: string;
  description: string;
  startdate: string; // YYYY-MM-DD
  enddate?: string; // YYYY-MM-DD
  time?: string;
  designation?: string;
  zingzan?: string;
};

export type Member = {
  id: string;
  name: string;
};
