"use client";

import { useEffect, useState } from "react";
import { useTeam } from "@/context/team-context";
import { PlayerContract, TeamCapSummary } from "@/types/nhl";
import { getPlayerContracts, getTeamCapSummary } from "@/lib/salary-api";
import { CapOverview } from "@/components/salary/cap-overview";
import { ContractsTable } from "@/components/salary/contracts-table";

export function SalaryCapPageClient() {
    const { selectedTeam } = useTeam();
    const [contracts, setContracts] = useState<PlayerContract[]>([]);
    const [capSummary, setCapSummary] = useState<TeamCapSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function fetchData() {
            setLoading(true);
            setError(null);
            try {
                const [contractsData, capData] = await Promise.all([
                    getPlayerContracts(selectedTeam.abbreviation),
                    getTeamCapSummary(selectedTeam.abbreviation),
                ]);
                if (!cancelled) {
                    setContracts(contractsData);
                    setCapSummary(capData);
                }
            } catch (err) {
                console.error("Failed to fetch salary data:", err);
                if (!cancelled) {
                    setError("Failed to load salary cap data. Please try again later.");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchData();
        return () => { cancelled = true; };
    }, [selectedTeam.abbreviation]);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-48 rounded-lg bg-white/10 animate-pulse" />
                <div className="h-32 rounded-xl bg-white/5 animate-pulse" />
                <div className="h-96 rounded-xl bg-white/5 animate-pulse" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-8">
                <div>
                    <h2 className="text-2xl font-bold">Salary Cap</h2>
                    <p className="text-sm text-gray-400 mt-1">
                        {selectedTeam.name} salary cap breakdown and player contracts
                    </p>
                </div>
                <div className="rounded-xl border border-red-400/20 bg-red-500/10 p-6 backdrop-blur-sm">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 text-red-400 mt-0.5">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-red-400">Error Loading Data</h3>
                            <p className="text-sm text-gray-300 mt-1">{error}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold">Salary Cap</h2>
                <p className="text-sm text-gray-400 mt-1">
                    {selectedTeam.name} salary cap breakdown and player contracts
                </p>
                <p className="text-xs text-yellow-400/60 mt-2">
                    ⚠ Contract data is currently mock data. Live data source coming soon.
                </p>
            </div>

            {capSummary && <CapOverview summary={capSummary} />}
            <ContractsTable contracts={contracts} />
        </div>
    );
}
