"use client";

import { Grid3X3, Search } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { UseCaseCard } from "@/components/use-case/use-case-card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApp } from "@/context/app-context";
import { useFilteredUseCases } from "@/hooks/use-filtered-use-cases";
import { DEPARTMENTS, CATEGORIES, IMPACT_LEVELS, EFFORT_LEVELS } from "@/lib/constants";
import type { SortOption } from "@/types";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "most-votes", label: "Most votes" },
  { value: "newest", label: "Newest" },
  { value: "highest-impact", label: "Highest impact" },
  { value: "lowest-effort", label: "Lowest effort" },
  { value: "trending", label: "Trending" },
  { value: "quick-wins", label: "Quick wins" },
];

export default function GalleryPage() {
  const { useCases } = useApp();
  const { filtered, filters, setFilters, sort, setSort, allTags } = useFilteredUseCases(useCases);

  return (
    <div className="min-w-0">
      <PageHeader
        title="Use Case Gallery"
        subtitle="Discover, vote, and discuss AI ideas from across Invest-NL."
        icon={Grid3X3}
      />

      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            className="pl-10"
            placeholder="Search use cases..."
            value={filters.search ?? ""}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 xs:grid-cols-2 sm:flex sm:flex-wrap">
          <Select
            value={filters.department ?? "all"}
            onValueChange={(v) => setFilters({ ...filters, department: v === "all" ? undefined : v })}
          >
            <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Department" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All departments</SelectItem>
              {DEPARTMENTS.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.category ?? "all"}
            onValueChange={(v) =>
              setFilters({ ...filters, category: v === "all" ? undefined : (v as typeof filters.category) })
            }
          >
            <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.impact ?? "all"}
            onValueChange={(v) =>
              setFilters({ ...filters, impact: v === "all" ? undefined : (v as typeof filters.impact) })
            }
          >
            <SelectTrigger className="w-full sm:w-[130px]"><SelectValue placeholder="Impact" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All impact</SelectItem>
              {IMPACT_LEVELS.map((l) => (
                <SelectItem key={l} value={l}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.effort ?? "all"}
            onValueChange={(v) =>
              setFilters({ ...filters, effort: v === "all" ? undefined : (v as typeof filters.effort) })
            }
          >
            <SelectTrigger className="w-full sm:w-[130px]"><SelectValue placeholder="Effort" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All effort</SelectItem>
              {EFFORT_LEVELS.map((l) => (
                <SelectItem key={l} value={l}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.tag ?? "all"}
            onValueChange={(v) => setFilters({ ...filters, tag: v === "all" ? undefined : v })}
          >
            <SelectTrigger className="w-full sm:w-[140px]"><SelectValue placeholder="Tag" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tags</SelectItem>
              {allTags.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
            <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {useCases.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center py-16 text-center">
          <Grid3X3 className="mb-4 h-12 w-12 text-muted" />
          <p className="text-lg font-medium">No use cases yet</p>
          <p className="text-sm text-muted">
            Be the first to submit an AI use case for your team.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center py-16 text-center">
          <Grid3X3 className="mb-4 h-12 w-12 text-muted" />
          <p className="text-lg font-medium">No use cases found</p>
          <p className="text-sm text-muted">Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted">{filtered.length} use case(s)</p>
          {filtered.map((uc, i) => (
            <UseCaseCard key={uc.id} useCase={uc} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
