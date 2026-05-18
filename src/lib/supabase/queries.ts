/**
 * Supabase query layer (placeholder).
 *
 * When connecting Supabase, implement these functions and swap
 * AppContext mock persistence for async calls:
 *
 * - fetchUseCases()
 * - fetchUseCaseById(id)
 * - insertUseCase(data)
 * - insertVote(useCaseId, userId)
 * - insertComment(useCaseId, userId, text)
 * - fetchUsers()
 * - fetchDepartmentStats()
 *
 * Example table mapping:
 * users, use_cases, votes, comments, badges, user_badges
 */

import type { UseCase, SubmitUseCaseInput, Comment } from "@/types";
import { supabase, isSupabaseConfigured } from "./client";

export async function fetchUseCases(): Promise<UseCase[] | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase.from("use_cases").select("*");
  if (error) throw error;
  return data as UseCase[];
}

export async function insertUseCase(
  input: SubmitUseCaseInput
): Promise<UseCase | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  void input;
  // const { data, error } = await supabase.from("use_cases").insert(input).select().single();
  return null;
}

export async function insertComment(
  useCaseId: string,
  userId: string,
  text: string
): Promise<Comment | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  void useCaseId;
  void userId;
  void text;
  return null;
}
