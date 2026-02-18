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
                    setError("Unable to load salary cap data. Please try again later.");
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
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold">Salary Cap</h2>
                    <p className="text-sm text-gray-400 mt-1">
                        {selectedTeam.name} salary cap breakdown and player contracts
                    </p>
                </div>
                <div className="rounded-xl border border-red-400/20 bg-red-500/10 p-6 backdrop-blur-sm">
                    <div className="flex items-start gap-3">
                        <svg
                            className="h-5 w-5 text-red-400 shrink-0 mt-0.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                        <div className="flex-1">
                            <h3 className="font-bold text-red-400">Error Loading Data</h3>
                            <p className="mt-1 text-sm text-gray-300">{error}</p>
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
