"use client";

import { useEffect, useState } from "react";
import { Standing, TeamStatsCollection, PowerRanking as PowerRankingType } from "@/types/nhl";
import { useTeam } from "@/context/team-context";
import { StandingsTable } from "@/components/standings/standings-table";
import { PowerRankingCard } from "@/components/standings/power-ranking";
import { EdgeStats } from "@/components/standings/edge-stats";

interface StandingsPageClientProps {
    standings: Standing[];
}

export function StandingsPageClient({ standings }: StandingsPageClientProps) {
    const { selectedTeam } = useTeam();
    const [teamStats, setTeamStats] = useState<TeamStatsCollection | null>(null);
    const [powerRanking, setPowerRanking] = useState<PowerRankingType | null>(null);

    // Compute team-specific stats client-side from standings data
    useEffect(() => {
        const team = standings.find((s) => s.teamAbbrev === selectedTeam.abbreviation);
        if (!team) return;

        // Build stats from standings
        const allTeamData = standings.map((s) => ({
            abbrev: s.teamAbbrev,
            goalsForPerGame: s.gamesPlayed > 0 ? s.goalsFor / s.gamesPlayed : 0,
            goalsAgainstPerGame: s.gamesPlayed > 0 ? s.goalsAgainst / s.gamesPlayed : 0,
            pointsPctg: s.pointsPctg,
        }));

        const teamGF = team.gamesPlayed > 0 ? team.goalsFor / team.gamesPlayed : 0;
        const teamGA = team.gamesPlayed > 0 ? team.goalsAgainst / team.gamesPlayed : 0;

        const gfSorted = [...allTeamData].sort((a, b) => b.goalsForPerGame - a.goalsForPerGame);
        const gaSorted = [...allTeamData].sort((a, b) => a.goalsAgainstPerGame - b.goalsAgainstPerGame);
        const ppSorted = [...allTeamData].sort((a, b) => b.pointsPctg - a.pointsPctg);

        const stats = [
            {
                name: "goalsForPerGame",
                label: "Goals For / Game",
                value: parseFloat(teamGF.toFixed(2)),
                rank: gfSorted.findIndex((s) => s.abbrev === selectedTeam.abbreviation) + 1,
                leagueAvg: parseFloat((gfSorted.reduce((a, b) => a + b.goalsForPerGame, 0) / gfSorted.length).toFixed(2)),
                format: "decimal" as const,
            },
            {
                name: "goalsAgainstPerGame",
                label: "Goals Against / Game",
                value: parseFloat(teamGA.toFixed(2)),
                rank: gaSorted.findIndex((s) => s.abbrev === selectedTeam.abbreviation) + 1,
                leagueAvg: parseFloat((gaSorted.reduce((a, b) => a + b.goalsAgainstPerGame, 0) / gaSorted.length).toFixed(2)),
                format: "decimal" as const,
            },
            {
                name: "pointsPctg",
                label: "Points %",
                value: parseFloat((team.pointsPctg * 100).toFixed(1)),
                rank: ppSorted.findIndex((s) => s.abbrev === selectedTeam.abbreviation) + 1,
                leagueAvg: parseFloat(((ppSorted.reduce((a, b) => a + b.pointsPctg, 0) / ppSorted.length) * 100).toFixed(1)),
                format: "percentage" as const,
            },
            {
                name: "goalDiffPerGame",
                label: "Goal Diff / Game",
                value: parseFloat((teamGF - teamGA).toFixed(2)),
                rank: [...allTeamData]
                    .sort((a, b) => (b.goalsForPerGame - b.goalsAgainstPerGame) - (a.goalsForPerGame - a.goalsAgainstPerGame))
                    .findIndex((s) => s.abbrev === selectedTeam.abbreviation) + 1,
                leagueAvg: 0,
                format: "decimal" as const,
            },
        ];

        setTeamStats({
            teamAbbrev: selectedTeam.abbreviation,
            stats,
            topStats: stats.filter((s) => s.rank <= 10),
            worstStats: stats.filter((s) => s.rank >= 28),
        });

        // Power ranking from last 10
        const l10Points = team.l10Wins * 2 + team.l10OtLosses;
        const l10PointsPctg = l10Points / 20;
        const powerScore = Math.round(l10PointsPctg * 100);

        setPowerRanking({
            teamAbbrev: selectedTeam.abbreviation,
            last10Games: [],
            last10Record: `${team.l10Wins}-${team.l10Losses}-${team.l10OtLosses}`,
            last10PointsPctg: parseFloat((l10PointsPctg * 100).toFixed(1)),
            powerRankScore: powerScore,
            trend: l10PointsPctg >= 0.7 ? "hot" : l10PointsPctg >= 0.5 ? "warm" : "cold",
        });
    }, [selectedTeam.abbreviation, standings]);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold">Standings</h2>
                <p className="text-sm text-gray-400 mt-1">Current NHL standings with projected draft picks and playoff positions</p>
            </div>

            {/* Team Summary Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Power Ranking */}
                {powerRanking && (
                    <PowerRankingCard ranking={powerRanking} />
                )}

                {/* Quick Team Stats */}
                {(() => {
                    const team = standings.find((s) => s.teamAbbrev === selectedTeam.abbreviation);
                    if (!team) return null;
                    return (
                        <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm col-span-1 lg:col-span-2">
                            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">
                                {selectedTeam.name} Overview
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div>
                                    <div className="text-xs text-gray-500 mb-1">Record</div>
                                    <div className="text-xl font-bold font-mono">
                                        {team.wins}-{team.losses}-{team.otLosses}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 mb-1">Points</div>
                                    <div className="text-xl font-bold font-mono" style={{ color: "var(--team-secondary)" }}>
                                        {team.points}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 mb-1">League Rank</div>
                                    <div className="text-xl font-bold font-mono">#{team.leagueSequence}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 mb-1">Goal Diff</div>
                                    <div className={`text-xl font-bold font-mono ${team.goalDiff > 0 ? "text-green-400" : team.goalDiff < 0 ? "text-red-400" : ""}`}>
                                        {team.goalDiff > 0 ? `+${team.goalDiff}` : team.goalDiff}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })()}
            </div>

            {/* Edge Stats */}
            {teamStats && <EdgeStats stats={teamStats} />}

            {/* Full Standings Table */}
            <StandingsTable standings={standings} />
        </div>
    );
}
