/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { StandingsTable } from "@/components/standings/standings-table";
import { PowerRankingCard } from "@/components/standings/power-ranking";
import { EdgeStats } from "@/components/standings/edge-stats";
import type { Standing, PowerRanking, TeamStatsCollection } from "@/types/nhl";

// Mock useTeam hook
jest.mock("@/context/team-context", () => ({
    useTeam: () => ({
        selectedTeam: { abbreviation: "TOR", name: "Toronto Maple Leafs" },
        colorScheme: "regular",
        setTeamAbbrev: jest.fn(),
        setColorScheme: jest.fn(),
    }),
}));

// ── helpers ────────────────────────────────────────────
function makeStanding(overrides: Partial<Standing> = {}): Standing {
    return {
        teamAbbrev: "TOR",
        teamName: "Toronto Maple Leafs",
        teamLogo: "https://logo.png",
        divisionName: "Atlantic",
        conferenceName: "Eastern",
        gamesPlayed: 60,
        wins: 35,
        losses: 20,
        otLosses: 5,
        points: 75,
        pointsPctg: 0.625,
        regulationWins: 30,
        goalsFor: 200,
        goalsAgainst: 170,
        goalDiff: 30,
        streakCode: "W",
        streakCount: 3,
        l10Wins: 7,
        l10Losses: 2,
        l10OtLosses: 1,
        wildcardSequence: 0,
        divisionSequence: 2,
        conferenceSequence: 4,
        leagueSequence: 6,
        ...overrides,
    };
}

// ── StandingsTable ─────────────────────────────────────
describe("StandingsTable", () => {
    it("renders team abbreviations", () => {
        const standings = [
            makeStanding({ teamAbbrev: "TOR", leagueSequence: 1 }),
            makeStanding({ teamAbbrev: "BOS", teamName: "Boston Bruins", leagueSequence: 2 }),
        ];

        render(<StandingsTable standings={standings} />);
        expect(screen.getByText("TOR")).toBeInTheDocument();
        expect(screen.getByText("BOS")).toBeInTheDocument();
    });

    it("sorts teams by league sequence", () => {
        const standings = [
            makeStanding({ teamAbbrev: "MTL", leagueSequence: 32 }),
            makeStanding({ teamAbbrev: "TOR", leagueSequence: 1 }),
            makeStanding({ teamAbbrev: "BOS", leagueSequence: 15 }),
        ];

        render(<StandingsTable standings={standings} />);
        const rows = screen.getAllByRole("row");
        // First data row (index 1, after header) should be TOR (sequence 1)
        expect(rows[1]).toHaveTextContent("TOR");
    });

    it("displays points for each team", () => {
        render(<StandingsTable standings={[makeStanding({ points: 75 })]} />);
        expect(screen.getByText("75")).toBeInTheDocument();
    });

    it("shows L10 record", () => {
        render(<StandingsTable standings={[makeStanding({ l10Wins: 7, l10Losses: 2, l10OtLosses: 1 })]} />);
        expect(screen.getByText("7-2-1")).toBeInTheDocument();
    });

    it("displays projected draft pick", () => {
        render(<StandingsTable standings={[makeStanding({ leagueSequence: 30 })]} />);
        // Draft pick = 33 - 30 = #3
        expect(screen.getByText("#3")).toBeInTheDocument();
    });

    it("shows playoff indicator for top-3 division teams", () => {
        render(<StandingsTable standings={[makeStanding({ divisionSequence: 2, wildcardSequence: 0 })]} />);
        expect(screen.getByText("P")).toBeInTheDocument();
    });

    it("shows clinch indicator when present", () => {
        render(<StandingsTable standings={[makeStanding({ clinchIndicator: "x" })]} />);
        expect(screen.getByText("x")).toBeInTheDocument();
    });

    it("shows wildcard indicator", () => {
        render(<StandingsTable standings={[makeStanding({ divisionSequence: 5, wildcardSequence: 1 })]} />);
        expect(screen.getByText("WC")).toBeInTheDocument();
    });

    it("renders correct number of rows", () => {
        const standings = Array.from({ length: 5 }, (_, i) =>
            makeStanding({ teamAbbrev: `T${i}`, leagueSequence: i + 1 })
        );

        render(<StandingsTable standings={standings} />);
        // 1 header row + 5 data rows
        const rows = screen.getAllByRole("row");
        expect(rows).toHaveLength(6);
    });
});

// ── PowerRankingCard ───────────────────────────────────
describe("PowerRankingCard", () => {
    const basePowerRanking: PowerRanking = {
        teamAbbrev: "TOR",
        last10Games: [],
        last10Record: "7-2-1",
        last10PointsPctg: 75.0,
        powerRankScore: 75,
        trend: "hot",
    };

    it("renders power rank score", () => {
        render(<PowerRankingCard ranking={basePowerRanking} />);
        expect(screen.getByText("75")).toBeInTheDocument();
    });

    it("renders L10 record", () => {
        render(<PowerRankingCard ranking={basePowerRanking} />);
        expect(screen.getByText("7-2-1")).toBeInTheDocument();
    });

    it("shows 'On Fire' label for hot trend", () => {
        render(<PowerRankingCard ranking={{ ...basePowerRanking, trend: "hot" }} />);
        expect(screen.getByText("On Fire")).toBeInTheDocument();
    });

    it("shows 'Steady' label for warm trend", () => {
        render(<PowerRankingCard ranking={{ ...basePowerRanking, trend: "warm" }} />);
        expect(screen.getByText("Steady")).toBeInTheDocument();
    });

    it("shows 'Cold' label for cold trend", () => {
        render(<PowerRankingCard ranking={{ ...basePowerRanking, trend: "cold" }} />);
        expect(screen.getByText("Cold")).toBeInTheDocument();
    });
});

// ── EdgeStats ──────────────────────────────────────────
describe("EdgeStats", () => {
    const baseStats: TeamStatsCollection = {
        teamAbbrev: "TOR",
        stats: [],
        topStats: [
            { name: "goalsForPerGame", label: "Goals For / Game", value: 3.5, rank: 3, leagueAvg: 3.0, format: "decimal" },
        ],
        worstStats: [
            { name: "goalsAgainstPerGame", label: "Goals Against / Game", value: 3.8, rank: 30, leagueAvg: 3.0, format: "decimal" },
        ],
    };

    it("renders top stats section", () => {
        render(<EdgeStats stats={baseStats} />);
        expect(screen.getByText("Goals For / Game")).toBeInTheDocument();
        expect(screen.getByText("#3")).toBeInTheDocument();
    });

    it("renders worst stats section", () => {
        render(<EdgeStats stats={baseStats} />);
        expect(screen.getByText("Goals Against / Game")).toBeInTheDocument();
        expect(screen.getByText("#30")).toBeInTheDocument();
    });

    it("shows 'No stats' messages when empty", () => {
        const emptyStats: TeamStatsCollection = { teamAbbrev: "TOR", stats: [], topStats: [], worstStats: [] };
        render(<EdgeStats stats={emptyStats} />);
        expect(screen.getByText("No stats in top 10")).toBeInTheDocument();
        expect(screen.getByText("No stats in bottom 5")).toBeInTheDocument();
    });

    it("formats percentage stats correctly", () => {
        const pctStats: TeamStatsCollection = {
            teamAbbrev: "TOR",
            stats: [],
            topStats: [
                { name: "powerPlayPct", label: "Power Play %", value: 25.5, rank: 5, leagueAvg: 20.0, format: "percentage" },
            ],
            worstStats: [],
        };

        render(<EdgeStats stats={pctStats} />);
        expect(screen.getByText("25.5%")).toBeInTheDocument();
    });
});
