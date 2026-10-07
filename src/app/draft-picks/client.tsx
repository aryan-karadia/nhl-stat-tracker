"use client";

import { useEffect, useState } from "react";
import { useTeam } from "@/context/team-context";
import { DraftPick, DraftProjection } from "@/types/nhl";
import { FileText, ArrowRightLeft, User, Star } from "lucide-react";
import { getTeamDraftPicks } from "@/lib/draft-api";
import { Skeleton } from "@/components/ui/skeleton";

function ProjectedPlayerCard({ projection }: { projection: DraftProjection }) {
    return (
        <div className="mt-3 rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                    <User className="h-5 w-5 text-gray-400" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className="font-bold" style={{ color: "var(--team-secondary)" }}>
                            {projection.playerName}
                        </span>
                        <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-mono">
                            {projection.position}
                        </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                        {projection.currentTeam} · {projection.league}
                    </div>
                    <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                        {projection.scoutingReport}
                    </p>
                    <div className="mt-2 flex items-start gap-1.5">
                        <FileText className="h-3 w-3 text-gray-500 mt-0.5 shrink-0" />
                        <p className="text-[10px] text-gray-500 leading-relaxed">
                            Sources: {projection.sources.join(", ")}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function DraftPicksPageClient() {
    const { selectedTeam } = useTeam();
    const currentYear = new Date().getFullYear();
    const [picks, setPicks] = useState<DraftPick[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function loadDraftPicks() {
            setLoading(true);
            setError(null);

            try {
                const data = await getTeamDraftPicks(selectedTeam.abbreviation, currentYear);
                if (!cancelled) {
                    setPicks(data);
                }
            } catch (err) {
                console.error("Failed to load draft picks:", err);
                if (!cancelled) {
                    setError("Unable to load draft picks right now. Please try again later.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadDraftPicks();

        return () => {
            cancelled = true;
        };
    }, [selectedTeam.abbreviation, currentYear]);

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h2 className="text-2xl font-bold">Draft Picks</h2>
                <p className="text-sm text-gray-400 mt-1">
                    {selectedTeam.name} draft picks and selections
                </p>
                <p className="mt-4 text-sm font-medium text-white">{currentYear} Draft</p>
                <p className="text-xs text-yellow-400/60 mt-2">
                    Completed selections are sourced from the official NHL Draft API.
                </p>
            </div>

            {error && (
                <div className="rounded-xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">
                    {error}
                </div>
            )}

            {/* Picks List */}
            <div className="flex flex-col gap-3">
                {loading && (
                    <div className="flex flex-col gap-3">
                        <Skeleton className="h-20 rounded-xl" />
                        <Skeleton className="h-20 rounded-xl" />
                        <Skeleton className="h-20 rounded-xl" />
                    </div>
                )}

                {picks.map((pick, idx) => (
                    <div
                        key={idx}
                        className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-colors hover:bg-white/7"
                    >
                        <div className="flex items-center gap-4">
                            {/* Round Badge */}
                            <div
                                className="flex h-12 w-12 flex-col items-center justify-center rounded-lg text-center shrink-0"
                                style={{ backgroundColor: "var(--team-primary)", color: "var(--team-text)" }}
                            >
                                <span className="text-[10px] font-medium opacity-70">RD</span>
                                <span className="text-lg font-black leading-none">{pick.round}</span>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-medium">Round {pick.round}</span>
                                    {pick.overallPick && (
                                        <span className="text-xs text-gray-400 font-mono">
                                            (#{pick.overallPick} overall)
                                        </span>
                                    )}
                                    {!pick.isOwnPick && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-bold text-blue-400 ring-1 ring-blue-500/20">
                                            <ArrowRightLeft className="h-2.5 w-2.5" />
                                            Via {pick.originalTeamAbbrev}
                                        </span>
                                    )}
                                </div>
                                {!pick.overallPick && (
                                    <span className="text-xs text-gray-500 mt-0.5 block">Pick position TBD</span>
                                )}
                            </div>

                            {(pick.draftedPlayer || pick.projection) && (
                                <Star className="h-4 w-4 text-yellow-400 shrink-0" />
                            )}
                        </div>

                        {pick.draftedPlayer ? (
                            <div className="mt-3 rounded-lg border border-white/10 bg-white/5 p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <div className="font-bold" style={{ color: "var(--team-secondary)" }}>
                                            {pick.draftedPlayer.fullName}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {pick.draftedPlayer.position} · {pick.draftedPlayer.amateurClub} ·{" "}
                                            {pick.draftedPlayer.league}
                                        </div>
                                    </div>
                                    <span className="text-[10px] uppercase tracking-wide text-gray-500">NHL data</span>
                                </div>
                            </div>
                        ) : pick.projection ? (
                            <ProjectedPlayerCard projection={pick.projection} />
                        ) : null}
                    </div>
                ))}

                {!loading && picks.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <FileText className="h-8 w-8 mx-auto mb-3 opacity-40" />
                        <p>No draft picks found for {currentYear}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
