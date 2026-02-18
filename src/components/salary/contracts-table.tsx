"use client";

import { Fragment, useState } from "react";
import React from "react";
import { PlayerContract } from "@/types/nhl";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Shield, ShieldAlert, ShieldX } from "lucide-react";

interface ContractsTableProps {
    contracts: PlayerContract[];
}

function formatMoney(amount: number): string {
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(2)}M`;
    if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
    return `$${amount}`;
}

type SortKey = "capHit" | "position" | "yearsRemaining" | "name";
type SortDir = "asc" | "desc";

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
    if (sortKey !== col) return <ChevronDown className="h-3 w-3 opacity-30" />;
    return sortDir === "desc" ? (
        <ChevronDown className="h-3 w-3 text-white" />
    ) : (
        <ChevronUp className="h-3 w-3 text-white" />
    );
}

function ClauseBadge({ type }: { type: string }) {
    if (type === "NMC")
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-bold text-red-400 ring-1 ring-red-500/20">
                <ShieldX className="h-2.5 w-2.5" /> NMC
            </span>
        );
    if (type === "NTC")
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/15 px-2 py-0.5 text-[10px] font-bold text-orange-400 ring-1 ring-orange-500/20">
                <ShieldAlert className="h-2.5 w-2.5" /> NTC
            </span>
        );
    if (type === "M-NTC")
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/15 px-2 py-0.5 text-[10px] font-bold text-yellow-400 ring-1 ring-yellow-500/20">
                <Shield className="h-2.5 w-2.5" /> M-NTC
            </span>
        );
    return null;
}

export function ContractsTable({ contracts }: ContractsTableProps) {
    const [sortKey, setSortKey] = useState<SortKey>("capHit");
    const [sortDir, setSortDir] = useState<SortDir>("desc");
    const [expanded, setExpanded] = useState<number | null>(null);

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir(sortDir === "asc" ? "desc" : "asc");
        } else {
            setSortKey(key);
            setSortDir("desc");
        }
    };

    const sorted = [...contracts].sort((a, b) => {
        let cmp = 0;
        if (sortKey === "capHit") cmp = a.capHit - b.capHit;
        else if (sortKey === "position") cmp = a.player.position.localeCompare(b.player.position);
        else if (sortKey === "yearsRemaining") cmp = a.yearsRemaining - b.yearsRemaining;
        else if (sortKey === "name") cmp = a.player.fullName.localeCompare(b.player.fullName);
        return sortDir === "desc" ? -cmp : cmp;
    });



    return (
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-white/10 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                        <th className="px-4 py-3">
                            <button onClick={() => handleSort("name")} className="flex items-center gap-1 hover:text-white transition-colors">
                                Player <SortIcon col="name" sortKey={sortKey} sortDir={sortDir} />
                            </button>
                        </th>
                        <th className="px-4 py-3">
                            <button onClick={() => handleSort("position")} className="flex items-center gap-1 hover:text-white transition-colors">
                                Pos <SortIcon col="position" sortKey={sortKey} sortDir={sortDir} />
                            </button>
                        </th>
                        <th className="px-4 py-3 text-right">
                            <button onClick={() => handleSort("capHit")} className="flex items-center gap-1 ml-auto hover:text-white transition-colors">
                                Cap Hit <SortIcon col="capHit" sortKey={sortKey} sortDir={sortDir} />
                            </button>
                        </th>
                        <th className="px-4 py-3 text-right hidden sm:table-cell">AAV</th>
                        <th className="px-4 py-3 text-center">
                            <button onClick={() => handleSort("yearsRemaining")} className="flex items-center gap-1 mx-auto hover:text-white transition-colors">
                                Years <SortIcon col="yearsRemaining" sortKey={sortKey} sortDir={sortDir} />
                            </button>
                        </th>
                        <th className="px-4 py-3 text-center">Expiry</th>
                        <th className="px-4 py-3 text-center">Clause</th>
                        <th className="px-4 py-3 w-8" />
                    </tr>
                </thead>
                <tbody>
                    {sorted.map((contract, idx) => (
                        <Fragment key={idx}>
                            <tr
                                className={cn(
                                    "border-b border-white/5 cursor-pointer transition-colors",
                                    expanded === idx ? "bg-white/10" : "hover:bg-white/5"
                                )}
                                onClick={() => setExpanded(expanded === idx ? null : idx)}
                            >
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500 font-mono w-5">#{contract.player.jerseyNumber}</span>
                                        <span className="font-medium">{contract.player.fullName}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="rounded bg-white/10 px-1.5 py-0.5 text-xs font-mono">
                                        {contract.player.position}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right font-mono font-bold" style={{ color: "var(--team-secondary)" }}>
                                    {formatMoney(contract.capHit)}
                                </td>
                                <td className="px-4 py-3 text-right font-mono text-gray-400 hidden sm:table-cell">
                                    {formatMoney(contract.aav)}
                                </td>
                                <td className="px-4 py-3 text-center font-mono">
                                    {contract.yearsRemaining}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <span className={cn(
                                        "text-xs font-bold",
                                        contract.expiryStatus === "UFA" ? "text-blue-400" : "text-green-400"
                                    )}>
                                        {contract.expiryStatus}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <ClauseBadge type={contract.tradeClause.type} />
                                </td>
                                <td className="px-4 py-3">
                                    {expanded === idx ? (
                                        <ChevronUp className="h-4 w-4 text-gray-400" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4 text-gray-400" />
                                    )}
                                </td>
                            </tr>

                            {/* Expanded Contract Detail */}
                            {expanded === idx && (
                                <tr key={`detail-${idx}`}>
                                    <td colSpan={8} className="px-6 py-4 bg-white/5">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            {/* Contract Years */}
                                            <div>
                                                <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Contract Breakdown</h4>
                                                <div className="space-y-1">
                                                    {contract.contractYears.map((year) => (
                                                        <div key={year.season} className="flex items-center justify-between text-xs">
                                                            <span className="font-mono text-gray-400">{year.season}</span>
                                                            <div className="flex gap-4">
                                                                <span className="text-gray-500">Base: {formatMoney(year.baseSalary)}</span>
                                                                <span className="text-gray-500">Bonus: {formatMoney(year.signingBonus)}</span>
                                                                <span className="font-mono font-bold">{formatMoney(year.totalSalary)}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="mt-2 pt-2 border-t border-white/10 flex justify-between text-xs">
                                                    <span className="text-gray-500">Total Value</span>
                                                    <span className="font-bold font-mono">{formatMoney(contract.totalValue)}</span>
                                                </div>
                                            </div>

                                            {/* Trade Clause Details */}
                                            <div>
                                                <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Trade Protection</h4>
                                                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <ClauseBadge type={contract.tradeClause.type} />
                                                        <span className="text-xs text-gray-300">{contract.tradeClause.details}</span>
                                                    </div>
                                                    {contract.tradeClause.allowedTeams && contract.tradeClause.allowedTeams.length > 0 && (
                                                        <div className="mt-2">
                                                            <span className="text-[10px] text-gray-500 uppercase">
                                                                {contract.tradeClause.type === "M-NTC" ? "Trade List:" : "Protected Teams:"}
                                                            </span>
                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                {contract.tradeClause.allowedTeams.map((team) => (
                                                                    <span
                                                                        key={team}
                                                                        className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-mono"
                                                                    >
                                                                        {team}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
