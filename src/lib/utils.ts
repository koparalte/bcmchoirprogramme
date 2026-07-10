import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getISTDate() {
  const now = new Date();
  const istString = now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"});
  return new Date(istString);
}
