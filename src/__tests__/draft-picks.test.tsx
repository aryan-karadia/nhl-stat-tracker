/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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

const SAMPLE_PICKS = [
    {
        year: 2025,
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
        year: 2025,
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
            expect(mockedGetTeamDraftPicks).toHaveBeenCalledWith("TOR", 2025);
        });
    });

    it("renders year tabs", () => {
        render(<DraftPicksPageClient />);
        expect(screen.getByText("2025 Draft")).toBeInTheDocument();
        expect(screen.getByText("2026 Draft")).toBeInTheDocument();
        expect(screen.getByText("2027 Draft")).toBeInTheDocument();
    });

    it("changes active year on tab click", async () => {
        render(<DraftPicksPageClient />);
        const tab2026 = screen.getByText("2026 Draft");
        fireEvent.click(tab2026);

        // The active year tab should have the team-primary background (check via style)
        expect(tab2026).toHaveStyle("background-color: var(--team-primary)");

        await waitFor(() => {
            expect(mockedGetTeamDraftPicks).toHaveBeenCalledWith("TOR", 2026);
        });
    });

    it("renders at least one pick with overall number when 2025 is selected", async () => {
        render(<DraftPicksPageClient />);
        await waitFor(() => {
            expect(screen.getAllByText(/#\d+ overall/i).length).toBeGreaterThan(0);
        });
    });

    it("renders 'Pick position TBD' for future years (2026/2027)", async () => {
        mockedGetTeamDraftPicks
            .mockResolvedValueOnce(SAMPLE_PICKS)
            .mockResolvedValueOnce([
            {
                ...SAMPLE_PICKS[0],
                year: 2026,
                overallPick: null,
            },
        ]);

        render(<DraftPicksPageClient />);
        fireEvent.click(screen.getByText("2026 Draft"));

        await waitFor(() => {
            expect(screen.getAllByText("Pick position TBD").length).toBeGreaterThan(0);
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
