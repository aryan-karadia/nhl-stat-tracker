"use client";

import { TeamStatsCollection, TeamStat } from "@/types/nhl";
import { Trophy, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface EdgeStatsProps {
    stats: TeamStatsCollection;
}

function StatBadge({ stat, type }: { stat: TeamStat; type: "top" | "worst" }) {
    const isTop = type === "top";
    const formattedValue =
        stat.format === "percentage"
            ? `${stat.value}%`
            : stat.format === "decimal"
                ? stat.value.toFixed(2)
                : stat.value.toString();

    return (
        <div
            className={cn(
                "flex items-center gap-3 rounded-lg border p-3 transition-colors",
                isTop
                    ? "border-green-500/20 bg-green-500/5 hover:bg-green-500/10"
                    : "border-red-500/20 bg-red-500/5 hover:bg-red-500/10"
            )}
        >
            <div
                className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
                    isTop ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                )}
            >
                #{stat.rank}
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{stat.label}</div>
                <div className="text-xs text-gray-500">League avg: {stat.leagueAvg}{stat.format === "percentage" ? "%" : ""}</div>
            </div>
            <div className={cn("text-lg font-bold font-mono", isTop ? "text-green-400" : "text-red-400")}>
                {formattedValue}
            </div>
        </div>
    );
}

export function EdgeStats({ stats }: EdgeStatsProps) {
    return (
        <div className="grid gap-6 md:grid-cols-2">
            {/* Top Stats */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20">
                        <Trophy className="h-3.5 w-3.5 text-green-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                        Top Stats <span className="text-green-400/60">(Top 10)</span>
                    </h3>
                </div>
                <div className="space-y-2">
                    {stats.topStats.length > 0 ? (
                        stats.topStats.map((stat) => (
                            <StatBadge key={stat.name} stat={stat} type="top" />
                        ))
                    ) : (
                        <p className="text-sm text-gray-500 py-4 text-center">No stats in top 10</p>
                    )}
                </div>
            </div>

            {/* Worst Stats */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/20">
                        <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                        Weaknesses <span className="text-red-400/60">(Bottom 5)</span>
                    </h3>
                </div>
                <div className="space-y-2">
                    {stats.worstStats.length > 0 ? (
                        stats.worstStats.map((stat) => (
                            <StatBadge key={stat.name} stat={stat} type="worst" />
                        ))
                    ) : (
                        <p className="text-sm text-gray-500 py-4 text-center">No stats in bottom 5</p>
                    )}
                </div>
            </div>
        </div>
    );
}
