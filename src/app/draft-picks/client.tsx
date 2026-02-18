"use client";

import { useState } from "react";
import { useTeam } from "@/context/team-context";
import { DraftPick, DraftProjection } from "@/types/nhl";
import { cn } from "@/lib/utils";
import { FileText, ArrowRightLeft, User, Star } from "lucide-react";

// ============================================================
// Mock draft projections with source attribution
// In production, these would come from an LLM-powered API
// ============================================================

const MOCK_PROJECTIONS: Record<string, DraftProjection> = {
    "1": {
        playerName: "James Chicken",
        position: "C",
        currentTeam: "Kingston Frontenacs",
        league: "OHL",
        scoutingReport: "Exceptional two-way center with elite hockey IQ. Projects as a franchise-altering talent with complete skill package.",
        sources: ["Bob McKenzie (TSN)", "Scott Wheeler (The Athletic)", "Daily Faceoff Mock Draft"],
    },
    "2": {
        playerName: "Michael Misa",
        position: "C",
        currentTeam: "Saginaw Spirit",
        league: "OHL",
        scoutingReport: "Dynamic offensive center with exceptional speed and shooting ability. Game-breaking talent with a pro-ready shot.",
        sources: ["Craig Button (TSN)", "EliteProspects 2025 Draft Guide"],
    },
    "3": {
        playerName: "Porter Martone",
        position: "RW",
        currentTeam: "Brampton Steelheads",
        league: "OHL",
        scoutingReport: "Power forward with soft hands and a mean streak. Physical presence combined with high-end skill.",
        sources: ["Corey Pronman (The Athletic)", "Steve Dangle (YouTube)"],
    },
    "5": {
        playerName: "Matthew Schaefer",
        position: "D",
        currentTeam: "Erie Otters",
        league: "OHL",
        scoutingReport: "Elite skating defenseman who can quarterback a power play. Smooth transition game and excellent decision-making.",
        sources: ["Wheeler (The Athletic)", "McKeen's Hockey Draft Rankings"],
    },
    "10": {
        playerName: "Caleb Desnoyers",
        position: "C",
        currentTeam: "Moncton Wildcats",
        league: "QMJHL",
        scoutingReport: "Smart two-way center with excellent defensive instincts. Strong board play and faceoff skills.",
        sources: ["FC Hockey Scouting", "NHL Central Scouting Midterm Rankings"],
    },
    "15": {
        playerName: "Lucas Pettersson",
        position: "LW",
        currentTeam: "Luleå HF",
        league: "SHL",
        scoutingReport: "Skilled Swedish winger with great vision and playmaking ability. Smooth skater with a deceptive release.",
        sources: ["EliteProspects", "Dobber Prospects"],
    },
    "20": {
        playerName: "Josh Pikka",
        position: "D",
        currentTeam: "Oulun Kärpät",
        league: "Liiga",
        scoutingReport: "Two-way defenseman with excellent mobility and a strong first pass. Reliable in all three zones.",
        sources: ["FC Hockey", "Finnish Hockey Scouting Report"],
    },
    "25": {
        playerName: "Emil Hemming",
        position: "RW",
        currentTeam: "Jokipojat",
        league: "Mestis",
        scoutingReport: "Big winger with a heavy shot and good net-front presence. Projects as a middle-six forward with physicality.",
        sources: ["EliteProspects", "Recruit Scouting"],
    },
};

function generateMockPicks(teamAbbrev: string, year: number): DraftPick[] {
    // Generate 2-4 picks per team per year
    const basePick = Math.floor(Math.random() * 28) + 1;
    const picks: DraftPick[] = [];
    const tradedFromTeams = ["TOR", "MTL", "BOS", "NYR", "VAN", "EDM", "CGY", "CHI"];

    // Round 1
    const rd1Pick = basePick;
    const isTraded = Math.random() > 0.7;
    picks.push({
        year,
        round: 1,
        overallPick: year <= 2025 ? rd1Pick : null,
        teamAbbrev,
        originalTeamAbbrev: isTraded ? tradedFromTeams[Math.floor(Math.random() * tradedFromTeams.length)] : teamAbbrev,
        isOwnPick: !isTraded,
        projection: MOCK_PROJECTIONS[rd1Pick.toString()] || null,
    });

    // Round 2-7 (some rounds may be missing due to trades)
    for (let round = 2; round <= 7; round++) {
        if (Math.random() > 0.3) {
            const overall = year <= 2025 ? (round - 1) * 32 + basePick : null;
            const traded = Math.random() > 0.8;
            picks.push({
                year,
                round,
                overallPick: overall,
                teamAbbrev,
                originalTeamAbbrev: traded ? tradedFromTeams[Math.floor(Math.random() * tradedFromTeams.length)] : teamAbbrev,
                isOwnPick: !traded,
                projection: null,
            });
        }
    }

    return picks;
}

function ProjectedPlayerCard({ projection }: { projection: DraftProjection }) {
    return (
        <div className="mt-3 rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                    <User className="h-5 w-5 text-gray-400" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className="font-bold" style={{ color: "var(--team-secondary)" }}>
                            {projection.playerName}
                        </span>
                        <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-mono">
                            {projection.position}
                        </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                        {projection.currentTeam} · {projection.league}
                    </div>
                    <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                        {projection.scoutingReport}
                    </p>
                    <div className="mt-2 flex items-start gap-1.5">
                        <FileText className="h-3 w-3 text-gray-500 mt-0.5 shrink-0" />
                        <p className="text-[10px] text-gray-500 leading-relaxed">
                            Sources: {projection.sources.join(", ")}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function DraftPicksPageClient() {
    const { selectedTeam } = useTeam();
    const [activeYear, setActiveYear] = useState(2025);
    const years = [2025, 2026, 2027];

    const picks = generateMockPicks(selectedTeam.abbreviation, activeYear);

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold">Draft Picks</h2>
                <p className="text-sm text-gray-400 mt-1">
                    {selectedTeam.name} draft picks with projected selections
                </p>
                <p className="text-xs text-yellow-400/60 mt-2">
                    ⚠ Projections are generated via AI analysis of public draft rankings and mock drafts.
                </p>
            </div>

            {/* Year Tabs */}
            <div className="flex gap-2">
                {years.map((year) => (
                    <button
                        key={year}
                        onClick={() => setActiveYear(year)}
                        className={cn(
                            "rounded-lg px-4 py-2 text-sm font-medium transition-all",
                            activeYear === year
                                ? "text-white shadow-lg"
                                : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                        )}
                        style={
                            activeYear === year
                                ? { backgroundColor: "var(--team-primary)", color: "var(--team-text)" }
                                : undefined
                        }
                    >
                        {year} Draft
                    </button>
                ))}
            </div>

            {/* Picks List */}
            <div className="space-y-3">
                {picks.map((pick, idx) => (
                    <div
                        key={idx}
                        className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-colors hover:bg-white/7"
                    >
                        <div className="flex items-center gap-4">
                            {/* Round Badge */}
                            <div
                                className="flex h-12 w-12 flex-col items-center justify-center rounded-lg text-center shrink-0"
                                style={{ backgroundColor: "var(--team-primary)", color: "var(--team-text)" }}
                            >
                                <span className="text-[10px] font-medium opacity-70">RD</span>
                                <span className="text-lg font-black leading-none">{pick.round}</span>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-medium">Round {pick.round}</span>
                                    {pick.overallPick && (
                                        <span className="text-xs text-gray-400 font-mono">
                                            (#{pick.overallPick} overall)
                                        </span>
                                    )}
                                    {!pick.isOwnPick && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-bold text-blue-400 ring-1 ring-blue-500/20">
                                            <ArrowRightLeft className="h-2.5 w-2.5" />
                                            Via {pick.originalTeamAbbrev}
                                        </span>
                                    )}
                                </div>
                                {!pick.overallPick && (
                                    <span className="text-xs text-gray-500 mt-0.5 block">Pick position TBD</span>
                                )}
                            </div>

                            {pick.projection && (
                                <Star className="h-4 w-4 text-yellow-400 shrink-0" />
                            )}
                        </div>

                        {pick.projection && <ProjectedPlayerCard projection={pick.projection} />}
                    </div>
                ))}

                {picks.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <FileText className="h-8 w-8 mx-auto mb-3 opacity-40" />
                        <p>No draft picks found for {activeYear}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
