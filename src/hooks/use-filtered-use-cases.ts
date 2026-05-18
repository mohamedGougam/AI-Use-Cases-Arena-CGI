"use client";

import { useMemo, useState } from "react";
import type { SortOption, UseCase, UseCaseFilters } from "@/types";
import { getImpactScore, getEffortScore, isQuickWin } from "@/lib/scoring";
export function useFilteredUseCases(useCases: UseCase[]) {
  const [filters, setFilters] = useState<UseCaseFilters>({});
  const [sort, setSort] = useState<SortOption>("most-votes");

  const filtered = useMemo(() => {
    let result = [...useCases];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (uc) =>
          uc.title.toLowerCase().includes(q) ||
          uc.description.toLowerCase().includes(q) ||
          uc.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (filters.department) result = result.filter((uc) => uc.department === filters.department);
    if (filters.category) result = result.filter((uc) => uc.category === filters.category);
    if (filters.impact) result = result.filter((uc) => uc.impact === filters.impact);
    if (filters.effort) result = result.filter((uc) => uc.effort === filters.effort);
    if (filters.tag) result = result.filter((uc) => uc.tags.includes(filters.tag!));

    switch (sort) {
      case "most-votes":
        result.sort((a, b) => b.votes - a.votes);
        break;
      case "newest":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "highest-impact":
        result.sort((a, b) => getImpactScore(b.impact) - getImpactScore(a.impact));
        break;
      case "lowest-effort":
        result.sort((a, b) => getEffortScore(a.effort) - getEffortScore(b.effort));
        break;
      case "trending":
        result.sort((a, b) => b.innovationScore - a.innovationScore);
        break;
      case "quick-wins":
        result = result.filter(isQuickWin);
        result.sort((a, b) => b.innovationScore - a.innovationScore);
        break;
    }

    return result;
  }, [useCases, filters, sort]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    useCases.forEach((uc) => uc.tags.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, [useCases]);

  return { filtered, filters, setFilters, sort, setSort, allTags };
}
