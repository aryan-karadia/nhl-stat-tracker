"use client";

import { TeamCapSummary } from "@/types/nhl";

interface CapOverviewProps {
    summary: TeamCapSummary;
}

function formatMoney(amount: number): string {
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
    return `$${amount}`;
}

export function CapOverview({ summary }: CapOverviewProps) {
    const usagePct = (summary.totalCapHit / summary.salaryCap) * 100;
    const isOverCap = summary.capSpace < 0;

    return (
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            {/* Progress Bar */}
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Cap Usage</span>
                <span className="text-sm font-bold" style={{ color: "var(--team-secondary)" }}>
                    {usagePct.toFixed(1)}%
                </span>
            </div>
            <div className="h-3 rounded-full bg-white/10 mb-6 overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                        width: `${Math.min(usagePct, 100)}%`,
                        background: isOverCap
                            ? "#ef4444"
                            : `linear-gradient(90deg, var(--team-primary), var(--team-secondary))`,
                    }}
                />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                    <div className="text-xs text-gray-500 mb-1">Salary Cap</div>
                    <div className="text-lg font-bold font-mono">{formatMoney(summary.salaryCap)}</div>
                </div>
                <div>
                    <div className="text-xs text-gray-500 mb-1">Total Cap Hit</div>
                    <div className="text-lg font-bold font-mono" style={{ color: "var(--team-secondary)" }}>
                        {formatMoney(summary.totalCapHit)}
                    </div>
                </div>
                <div>
                    <div className="text-xs text-gray-500 mb-1">Cap Space</div>
                    <div className={`text-lg font-bold font-mono ${isOverCap ? "text-red-400" : "text-green-400"}`}>
                        {isOverCap ? "-" : ""}{formatMoney(Math.abs(summary.capSpace))}
                    </div>
                </div>
                <div>
                    <div className="text-xs text-gray-500 mb-1">Contracts</div>
                    <div className="text-lg font-bold font-mono">{summary.contractsCount}</div>
                </div>
            </div>

            {/* Additional Info */}
            {(summary.deadCap > 0 || summary.ltirPool > 0) && (
                <div className="mt-4 flex gap-6 border-t border-white/10 pt-4">
                    {summary.deadCap > 0 && (
                        <div>
                            <span className="text-xs text-gray-500">Dead Cap: </span>
                            <span className="text-xs font-mono text-red-400">{formatMoney(summary.deadCap)}</span>
                        </div>
                    )}
                    {summary.ltirPool > 0 && (
                        <div>
                            <span className="text-xs text-gray-500">LTIR Pool: </span>
                            <span className="text-xs font-mono text-blue-400">{formatMoney(summary.ltirPool)}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
