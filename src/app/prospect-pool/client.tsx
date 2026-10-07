"use client";

import { useEffect, useState } from "react";
import { useTeam } from "@/context/team-context";
import { Prospect } from "@/types/nhl";
import { getProspectPool } from "@/lib/prospects-api";
import { ShieldCheck, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function ProspectPoolPageClient() {
  const { selectedTeam } = useTeam();
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      <div className="grid gap-4">
        {prospects.map((prospect) => (
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
