"use client";

import { Standing } from "@/types/nhl";
import { useTeam } from "@/context/team-context";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StandingsTableProps {
    standings: Standing[];
}

function getStreakIcon(code: string) {
    if (code === "W") return <TrendingUp className="h-3.5 w-3.5 text-green-400" />;
    if (code === "L") return <TrendingDown className="h-3.5 w-3.5 text-red-400" />;
    return <Minus className="h-3.5 w-3.5 text-yellow-400" />;
}

function getPlayoffIndicator(standing: Standing): { label: string; color: string } | null {
    if (standing.clinchIndicator === "x") return { label: "x", color: "text-green-400" };
    if (standing.clinchIndicator === "y") return { label: "y", color: "text-blue-400" };
    if (standing.clinchIndicator === "z") return { label: "z", color: "text-purple-400" };
    if (standing.clinchIndicator === "p") return { label: "p", color: "text-yellow-400" };
    if (standing.clinchIndicator === "e") return { label: "e", color: "text-red-400" };

    // Projected: top 3 in division or wildcard
    if (standing.divisionSequence <= 3) return { label: "P", color: "text-green-400/60" };
    if (standing.wildcardSequence <= 2) return { label: "WC", color: "text-yellow-400/60" };
    return null;
}

export function StandingsTable({ standings }: StandingsTableProps) {
    const { selectedTeam } = useTeam();

    // Sort by league sequence
    const sorted = [...standings].sort((a, b) => a.leagueSequence - b.leagueSequence);

    return (
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-white/10 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                        <th className="px-4 py-3 w-8">#</th>
                        <th className="px-4 py-3">Team</th>
                        <th className="px-4 py-3 text-center">GP</th>
                        <th className="px-4 py-3 text-center">W</th>
                        <th className="px-4 py-3 text-center">L</th>
                        <th className="px-4 py-3 text-center">OTL</th>
                        <th className="px-4 py-3 text-center font-bold">PTS</th>
                        <th className="px-4 py-3 text-center">P%</th>
                        <th className="px-4 py-3 text-center">RW</th>
                        <th className="px-4 py-3 text-center">DIFF</th>
                        <th className="px-4 py-3 text-center">STRK</th>
                        <th className="px-4 py-3 text-center">L10</th>
                        <th className="px-4 py-3 text-center">Draft</th>
                        <th className="px-4 py-3 text-center">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {sorted.map((s, idx) => {
                        const isSelected = s.teamAbbrev === selectedTeam.abbreviation;
                        const playoff = getPlayoffIndicator(s);
                        // Draft pick is reverse of league standings
                        const projectedDraftPick = 33 - s.leagueSequence;

                        return (
                            <tr
                                key={s.teamAbbrev}
                                className={cn(
                                    "border-b border-white/5 transition-colors",
                                    isSelected
                                        ? "bg-white/15 ring-1 ring-inset"
                                        : "hover:bg-white/5"
                                )}
                                style={isSelected ? { ringColor: "var(--team-secondary)" } : undefined}
                            >
                                <td className="px-4 py-2.5 text-gray-500 font-mono text-xs">{s.leagueSequence}</td>
                                <td className="px-4 py-2.5">
                                    <div className="flex items-center gap-2.5">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={s.teamLogo} alt={s.teamName} className="h-5 w-5 object-contain" />
                                        <span className={cn("font-medium", isSelected && "font-bold")}>
                                            {s.teamAbbrev}
                                        </span>
                                        <span className="text-gray-400 hidden lg:inline text-xs">{s.teamName}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-2.5 text-center text-gray-400">{s.gamesPlayed}</td>
                                <td className="px-4 py-2.5 text-center">{s.wins}</td>
                                <td className="px-4 py-2.5 text-center">{s.losses}</td>
                                <td className="px-4 py-2.5 text-center">{s.otLosses}</td>
                                <td className="px-4 py-2.5 text-center font-bold text-lg">{s.points}</td>
                                <td className="px-4 py-2.5 text-center text-gray-400">
                                    {(s.pointsPctg * 100).toFixed(1)}
                                </td>
                                <td className="px-4 py-2.5 text-center text-gray-400">{s.regulationWins}</td>
                                <td className={cn(
                                    "px-4 py-2.5 text-center font-mono text-xs",
                                    s.goalDiff > 0 ? "text-green-400" : s.goalDiff < 0 ? "text-red-400" : "text-gray-400"
                                )}>
                                    {s.goalDiff > 0 ? `+${s.goalDiff}` : s.goalDiff}
                                </td>
                                <td className="px-4 py-2.5 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        {getStreakIcon(s.streakCode)}
                                        <span className="text-xs">{s.streakCount}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-2.5 text-center text-xs">
                                    {s.l10Wins}-{s.l10Losses}-{s.l10OtLosses}
                                </td>
                                <td className="px-4 py-2.5 text-center text-xs text-gray-500 font-mono">
                                    {projectedDraftPick > 0 && projectedDraftPick <= 32 ? `#${projectedDraftPick}` : "—"}
                                </td>
                                <td className="px-4 py-2.5 text-center">
                                    {playoff && (
                                        <span className={cn("text-xs font-bold", playoff.color)}>
                                            {playoff.label}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
