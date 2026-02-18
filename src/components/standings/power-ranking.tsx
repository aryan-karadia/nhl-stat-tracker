"use client";

import { PowerRanking as PowerRankingType } from "@/types/nhl";
import { Flame, Thermometer, Snowflake } from "lucide-react";
import { cn } from "@/lib/utils";

interface PowerRankingProps {
    ranking: PowerRankingType;
}

const TREND_CONFIG = {
    hot: { icon: Flame, label: "On Fire", color: "text-orange-400", bg: "bg-orange-400/10", ring: "ring-orange-400/30" },
    warm: { icon: Thermometer, label: "Steady", color: "text-yellow-400", bg: "bg-yellow-400/10", ring: "ring-yellow-400/30" },
    cold: { icon: Snowflake, label: "Cold", color: "text-blue-400", bg: "bg-blue-400/10", ring: "ring-blue-400/30" },
};

export function PowerRankingCard({ ranking }: PowerRankingProps) {
    const trend = TREND_CONFIG[ranking.trend];
    const TrendIcon = trend.icon;

    return (
        <div className={cn("rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm", trend.ring, "ring-1")}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Power Ranking</h3>
                <div className={cn("flex items-center gap-1.5 rounded-full px-3 py-1", trend.bg)}>
                    <TrendIcon className={cn("h-3.5 w-3.5", trend.color)} />
                    <span className={cn("text-xs font-bold", trend.color)}>{trend.label}</span>
                </div>
            </div>

            {/* Score */}
            <div className="flex items-end gap-3 mb-4">
                <span className="text-5xl font-black tabular-nums" style={{ color: "var(--team-secondary)" }}>
                    {ranking.powerRankScore}
                </span>
                <span className="text-sm text-gray-500 pb-1.5">/100</span>
            </div>

            {/* Progress Bar */}
            <div className="h-2 rounded-full bg-white/10 mb-4 overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                        width: `${ranking.powerRankScore}%`,
                        background: `linear-gradient(90deg, var(--team-primary), var(--team-secondary))`,
                    }}
                />
            </div>

            {/* Last 10 Record */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <div className="text-xs text-gray-500 mb-1">Last 10</div>
                    <div className="text-lg font-bold font-mono">{ranking.last10Record}</div>
                </div>
                <div>
                    <div className="text-xs text-gray-500 mb-1">Points %</div>
                    <div className="text-lg font-bold font-mono">{ranking.last10PointsPctg}%</div>
                </div>
            </div>
        </div>
    );
}
