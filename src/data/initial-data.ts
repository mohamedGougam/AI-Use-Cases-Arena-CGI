import type { User, UseCase } from "@/types";
import { CURRENT_USER_ID } from "@/lib/constants";

/** Default user profile for local/demo mode until auth is connected. */
export const initialUsers: User[] = [
  {
    id: CURRENT_USER_ID,
    name: "You",
    department: "Operations",
    avatar: "YO",
    points: 0,
    badges: [],
    rank: "Explorer",
    votingStreak: 0,
  },
];

export const initialUseCases: UseCase[] = [];
