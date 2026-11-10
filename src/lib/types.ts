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
  type?: string;
};

export type Member = {
  id: string;
  name: string;
  kohhran?: string;
  part?: string;
  designation?: string;
  link?: string;
  link2?: string;
  link3?: string;
  phone?: string;
  email?: string;
  birthday?: string;
};

export type Banner = {
  url: string;
  name?: string;
  downloadUrl?: string;
};

export type AlbumPhoto = {
  id: string;
  url: string; // Thumbnail / grid view
  fullUrl: string; // Fullscreen lightbox
  downloadUrl: string; // Original download link
  title?: string;
  tag?: string;
  date?: string;
  isHeading?: boolean;
};

export type SongProgress = {
  name: string;
  completed: boolean;
};

export type ProgressMember = {
  id: string;
  name: string;
  part: string;
  songs: SongProgress[];
  queue?: string;
  link?: string;
  email?: string;
  designation?: string;
};

export type BibleVerse = {
  sno: string | number;
  verse: string;
  text: string;
};

export type SolfaTrack = {
  id: string;
  name: string;
  songlink?: string; // YouTube
  sheet?: string; // PDF
  music?: string; // MP3
};
