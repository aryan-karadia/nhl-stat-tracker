/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { DraftPicksPageClient } from "@/app/draft-picks/client";
import { getTeamDraftPicks } from "@/lib/draft-api";

jest.mock("@/lib/draft-api", () => ({
    getTeamDraftPicks: jest.fn(),
}));

// Mock useTeam hook
jest.mock("@/context/team-context", () => ({
    useTeam: () => ({
        selectedTeam: { abbreviation: "TOR", name: "Toronto Maple Leafs" },
        colorScheme: "regular",
        setTeamAbbrev: jest.fn(),
        setColorScheme: jest.fn(),
    }),
}));

const mockedGetTeamDraftPicks = getTeamDraftPicks as jest.MockedFunction<typeof getTeamDraftPicks>;
const CURRENT_YEAR = new Date().getFullYear();

const SAMPLE_PICKS = [
    {
        year: CURRENT_YEAR,
        round: 1,
        overallPick: 5,
        teamAbbrev: "TOR",
        originalTeamAbbrev: "BOS",
        isOwnPick: false,
        projection: {
            playerName: "Matthew Schaefer",
            position: "D",
            currentTeam: "Erie Otters",
            league: "OHL",
            scoutingReport: "Elite skating defenseman with transition upside.",
            sources: ["The Athletic", "FC Hockey"],
        },
    },
    {
        year: CURRENT_YEAR,
        round: 2,
        overallPick: 37,
        teamAbbrev: "TOR",
        originalTeamAbbrev: "TOR",
        isOwnPick: true,
        projection: null,
    },
];

describe("DraftPicksPageClient", () => {
    beforeEach(() => {
        mockedGetTeamDraftPicks.mockResolvedValue(SAMPLE_PICKS);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("renders the draft picks page title", async () => {
        render(<DraftPicksPageClient />);
        expect(screen.getByText("Draft Picks")).toBeInTheDocument();
        expect(screen.getByText(/Toronto Maple Leafs draft picks/i)).toBeInTheDocument();
        await waitFor(() => {
            expect(mockedGetTeamDraftPicks).toHaveBeenCalledWith("TOR", CURRENT_YEAR);
        });
    });

    it("renders the current draft year", () => {
        render(<DraftPicksPageClient />);
        expect(screen.getByText(`${CURRENT_YEAR} Draft`)).toBeInTheDocument();
        expect(screen.queryByText(`${CURRENT_YEAR + 1} Draft`)).not.toBeInTheDocument();
        expect(screen.queryByText(`${CURRENT_YEAR + 2} Draft`)).not.toBeInTheDocument();
    });

    it("renders at least one pick with overall number when 2025 is selected", async () => {
        render(<DraftPicksPageClient />);
        await waitFor(() => {
            expect(screen.getAllByText(/#\d+ overall/i).length).toBeGreaterThan(0);
        });
    });

    it("displays traded pick indicator if pick is not own", async () => {
        render(<DraftPicksPageClient />);
        await waitFor(() => {
            expect(screen.getByText((content) => content.includes("Via"))).toBeInTheDocument();
        });
    });

    it("renders projected player card when projection exists", async () => {
        render(<DraftPicksPageClient />);

        await waitFor(() => {
            expect(screen.getByText("Matthew Schaefer")).toBeInTheDocument();
            expect(screen.getByText(/Erie Otters/i)).toBeInTheDocument();
            expect(screen.getByText(/Sources:/i)).toBeInTheDocument();
        });
    });

    it("renders scouting report and sources in projection card", async () => {
        render(<DraftPicksPageClient />);

        await waitFor(() => {
            expect(screen.getByText(/Elite skating defenseman/i)).toBeInTheDocument();
            expect(screen.getAllByText(/Sources:/i).length).toBeGreaterThan(0);
        });
    });

    it("shows an error when API request fails", async () => {
        mockedGetTeamDraftPicks.mockRejectedValueOnce(new Error("network failure"));
        render(<DraftPicksPageClient />);

        await waitFor(() => {
            expect(screen.getByText(/Unable to load draft picks right now/i)).toBeInTheDocument();
        });
    });
});
