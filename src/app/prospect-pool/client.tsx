"use client";

import { useEffect, useMemo, useState } from "react";
import { useTeam } from "@/context/team-context";
import { Prospect } from "@/types/nhl";
import { getProspectPool } from "@/lib/prospects-api";
import { Search, ShieldCheck, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function getDraftYear(draftInfo?: string) {
  return draftInfo?.match(/\b(20\d{2})\b/)?.[1] ?? null;
}

function getDraftRound(draftInfo?: string) {
  return draftInfo?.match(/\bround\s+(\d+)\b/i)?.[1] ?? null;
}

export function ProspectPoolPageClient() {
  const { selectedTeam } = useTeam();
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [draftYear, setDraftYear] = useState("all");
  const [draftRound, setDraftRound] = useState("all");
  const [position, setPosition] = useState("all");

  useEffect(() => {
    let cancelled = false;

    async function loadProspects() {
      setLoading(true);
      setError(null);

      try {
        const data = await getProspectPool(selectedTeam.abbreviation);
        if (!cancelled) {
          setProspects(data);
        }
      } catch (err) {
        console.error("Failed to load prospect pool:", err);
        if (!cancelled) {
          setError("Unable to load prospect pool right now. Please try again later.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProspects();

    return () => {
      cancelled = true;
    };
  }, [selectedTeam.abbreviation]);

  const draftYears = useMemo(
    () =>
      Array.from(
        new Set(
          prospects
            .map((prospect) => getDraftYear(prospect.draftInfo))
            .filter((year): year is string => year !== null),
        ),
      ).sort((a, b) => Number(b) - Number(a)),
    [prospects],
  );
  const draftRounds = useMemo(
    () =>
      Array.from(
        new Set(
          prospects
            .map((prospect) => getDraftRound(prospect.draftInfo))
            .filter((round): round is string => round !== null),
        ),
      ).sort((a, b) => Number(a) - Number(b)),
    [prospects],
  );
  const positions = useMemo(
    () => Array.from(new Set(prospects.map((prospect) => prospect.position))).sort(),
    [prospects],
  );
  const filteredProspects = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return prospects.filter((prospect) => {
      const matchesName = prospect.fullName.toLowerCase().includes(normalizedSearch);
      const matchesYear = draftYear === "all" || getDraftYear(prospect.draftInfo) === draftYear;
      const matchesRound = draftRound === "all" || getDraftRound(prospect.draftInfo) === draftRound;
      const matchesPosition = position === "all" || prospect.position === position;

      return matchesName && matchesYear && matchesRound && matchesPosition;
    });
  }, [draftRound, draftYear, position, prospects, search]);

  const hasActiveFilters = search !== "" || draftYear !== "all" || draftRound !== "all" || position !== "all";

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-bold">Prospect Pool</h2>
        <p className="text-sm text-gray-400 mt-1">
          {selectedTeam.name} drafted players and development pipeline
        </p>
        <p className="text-xs text-yellow-400/60 mt-2">
          Draft information is sourced from the official NHL Draft API. Current team and development details may change.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      )}

      {!loading && prospects.length === 0 && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-gray-400">
          No prospect data available for this team.
        </div>
      )}

      {!loading && prospects.length > 0 && (
        <section className="flex flex-col gap-4" aria-label="Prospect filters">
          <div className="grid gap-3 rounded-xl border border-white/10 bg-white/5 p-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="flex flex-col gap-2 text-xs font-semibold text-gray-300 sm:col-span-2 lg:col-span-1">
              Search by name
              <span className="relative">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search prospects"
                  aria-label="Search prospects by name"
                  className="h-10 w-full rounded-md border border-white/10 bg-black/20 pl-10 pr-3 text-sm font-normal text-white outline-none transition placeholder:text-gray-500 focus:border-[var(--team-secondary)] focus:ring-1 focus:ring-[var(--team-secondary)]"
                />
              </span>
            </label>

            <label className="flex flex-col gap-2 text-xs font-semibold text-gray-300">
              Draft year
              <select
                value={draftYear}
                onChange={(event) => setDraftYear(event.target.value)}
                aria-label="Filter by draft year"
                className="h-10 rounded-md border border-white/10 bg-black/20 px-3 text-sm font-normal text-white outline-none transition focus:border-[var(--team-secondary)] focus:ring-1 focus:ring-[var(--team-secondary)]"
              >
                <option value="all">All years</option>
                {draftYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-xs font-semibold text-gray-300">
              Draft round
              <select
                value={draftRound}
                onChange={(event) => setDraftRound(event.target.value)}
                aria-label="Filter by draft round"
                className="h-10 rounded-md border border-white/10 bg-black/20 px-3 text-sm font-normal text-white outline-none transition focus:border-[var(--team-secondary)] focus:ring-1 focus:ring-[var(--team-secondary)]"
              >
                <option value="all">All rounds</option>
                {draftRounds.map((round) => (
                  <option key={round} value={round}>
                    Round {round}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-xs font-semibold text-gray-300">
              Position
              <select
                value={position}
                onChange={(event) => setPosition(event.target.value)}
                aria-label="Filter by position"
                className="h-10 rounded-md border border-white/10 bg-black/20 px-3 text-sm font-normal text-white outline-none transition focus:border-[var(--team-secondary)] focus:ring-1 focus:ring-[var(--team-secondary)]"
              >
                <option value="all">All positions</option>
                {positions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400">
            <span>
              Showing {filteredProspects.length} of {prospects.length} prospects
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setDraftYear("all");
                  setDraftRound("all");
                  setPosition("all");
                }}
                className="text-[var(--team-secondary)] underline-offset-4 hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        </section>
      )}

      {!loading && prospects.length > 0 && filteredProspects.length === 0 && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-gray-400">
          No prospects match the selected filters.
        </div>
      )}

      <div className="grid gap-4">
        {filteredProspects.map((prospect) => (
          <article
            key={prospect.id}
            className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-bold" style={{ color: "var(--team-secondary)" }}>
                  {prospect.fullName}
                </h3>
                <p className="text-xs text-gray-400">
                  {prospect.position} · {prospect.age ? `Age ${prospect.age} · ` : ""}{prospect.currentTeam} ({prospect.league})
                </p>
              </div>
              {prospect.draftInfo && (
                <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] text-gray-300">
                  {prospect.draftInfo}
                </span>
              )}
            </div>

            <p className="mt-3 text-sm text-gray-200 leading-relaxed">{prospect.report.summary}</p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <section className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-emerald-300">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Strengths
                </div>
                <ul className="flex flex-col gap-1 text-xs text-emerald-100/90">
                  {prospect.report.strengths.length > 0 ? (
                    prospect.report.strengths.map((strength) => <li key={strength}>• {strength}</li>)
                  ) : (
                    <li>• No strengths listed</li>
                  )}
                </ul>
              </section>

              <section className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-amber-300">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Development Areas
                </div>
                <ul className="flex flex-col gap-1 text-xs text-amber-100/90">
                  {prospect.report.developmentAreas.length > 0 ? (
                    prospect.report.developmentAreas.map((area) => <li key={area}>• {area}</li>)
                  ) : (
                    <li>• No development areas listed</li>
                  )}
                </ul>
              </section>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
