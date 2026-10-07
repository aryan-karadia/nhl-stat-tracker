"use client";

import { useEffect, useState } from "react";
import { useTeam } from "@/context/team-context";
import { NHLRosterPlayer, NHLRosterResponse } from "@/lib/nhl-api";
import { TeamRoster } from "@/components/salary/team-roster";
import { Skeleton } from "@/components/ui/skeleton";

export function SalaryCapPageClient() {
    const { selectedTeam } = useTeam();
    const [roster, setRoster] = useState<NHLRosterPlayer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function fetchData() {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/nhl/roster/${selectedTeam.abbreviation}`);
                if (!response.ok) {
                    throw new Error(`Roster request failed with ${response.status}`);
                }
                const rosterData = await response.json() as NHLRosterResponse;
                if (!cancelled) {
                    setRoster([...rosterData.forwards, ...rosterData.defensemen, ...rosterData.goalies]);
                }
            } catch (err) {
                console.error("Failed to fetch NHL roster:", err);
                if (!cancelled) {
                    setError("Unable to load the official NHL roster. Please try again later.");
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
            <div className="flex flex-col gap-6">
                <Skeleton className="h-8 w-48 rounded-lg" />
                <Skeleton className="h-32 rounded-xl" />
                <Skeleton className="h-96 rounded-xl" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col gap-6">
                <div>
                    <h2 className="text-2xl font-bold">Team Roster</h2>
                    <p className="text-sm text-gray-400 mt-1">
                        {selectedTeam.name} current roster and player profiles
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
        <div className="flex flex-col gap-8">
            <div>
                <h2 className="text-2xl font-bold">Team Roster</h2>
                <p className="text-sm text-gray-400 mt-1">
                    {selectedTeam.name} current roster and player profiles
                </p>
                <p className="text-xs text-gray-500 mt-2">
                    Data provided by the official NHL API · click a player for more information
                </p>
            </div>

            <TeamRoster roster={roster} />
        </div>
    );
}
