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

    useEffect(() => {
        let cancelled = false;

        async function fetchData() {
            setLoading(true);
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
