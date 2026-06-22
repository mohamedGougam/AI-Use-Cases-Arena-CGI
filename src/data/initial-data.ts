import type { User, UseCase } from "@/types";
import { CURRENT_USER_ID } from "@/lib/constants";

/** Default local user profile until the session assigns a display name. */
export const initialUsers: User[] = [
  {
    id: CURRENT_USER_ID,
    name: "Workshop Participant",
    department: "Network Operations",
    avatar: "WP",
    points: 0,
    badges: [],
    rank: "Explorer",
    votingStreak: 0,
  },
];

export const initialUseCases: UseCase[] = [];
