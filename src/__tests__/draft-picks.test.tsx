/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { DraftPicksPageClient } from "@/app/draft-picks/client";

// Mock useTeam hook
jest.mock("@/context/team-context", () => ({
    useTeam: () => ({
        selectedTeam: { abbreviation: "TOR", name: "Toronto Maple Leafs" },
        colorScheme: "regular",
        setTeamAbbrev: jest.fn(),
        setColorScheme: jest.fn(),
    }),
}));

describe("DraftPicksPageClient", () => {
    it("renders the draft picks page title", () => {
        render(<DraftPicksPageClient />);
        expect(screen.getByText("Draft Picks")).toBeInTheDocument();
        expect(screen.getByText(/Toronto Maple Leafs draft picks/i)).toBeInTheDocument();
    });

    it("renders year tabs", () => {
        render(<DraftPicksPageClient />);
        expect(screen.getByText("2025 Draft")).toBeInTheDocument();
        expect(screen.getByText("2026 Draft")).toBeInTheDocument();
        expect(screen.getByText("2027 Draft")).toBeInTheDocument();
    });

    it("changes active year on tab click", () => {
        render(<DraftPicksPageClient />);
        const tab2026 = screen.getByText("2026 Draft");
        fireEvent.click(tab2026);

        // The active year tab should have the team-primary background (check via style)
        expect(tab2026).toHaveStyle("background-color: var(--team-primary)");
    });

    it("renders at least one pick with overall number when 2025 is selected", () => {
        render(<DraftPicksPageClient />);
        // Round 1 pick should always have an overall number in 2025 mock
        expect(screen.getByText(/#\d+ overall/i)).toBeInTheDocument();
    });

    it("renders 'Pick position TBD' for future years (2026/2027)", () => {
        render(<DraftPicksPageClient />);
        fireEvent.click(screen.getByText("2026 Draft"));
        expect(screen.getAllByText("Pick position TBD").length).toBeGreaterThan(0);
    });

    it("displays traded pick indicator if pick is not own", async () => {
        const randomSpy = jest.spyOn(Math, "random").mockReturnValue(0.1);
        try {
            render(<DraftPicksPageClient />);
            // With Math.random mocked to a low value, the mock generator should produce traded picks deterministically.
            expect(screen.getByText(/Via [A-Z]{3}/i)).toBeInTheDocument();
        } finally {
            randomSpy.mockRestore();
        }
    });

    it("renders projected player card when projection exists", () => {
        render(<DraftPicksPageClient />);
        // The mock always generates a projection for Round 1 in 2025
        // James Chicken or Michael Misa etc.
        const projectionHeader = screen.queryByText(/Scouting Report/i);
        if (projectionHeader) {
            expect(projectionHeader).toBeInTheDocument();
        }

        // Check for some common mock names from projections
        const possibleNames = ["James Chicken", "Michael Misa", "Porter Martone"];
        const found = possibleNames.some(name => screen.queryByText(name));
        expect(found).toBe(true);
    });

    it("renders scouting report and sources in projection card", () => {
        render(<DraftPicksPageClient />);
        // Find the projection card for Round 1
        const scoutingReports = screen.getAllByText(/Scouting Report/i);
        expect(scoutingReports.length).toBeGreaterThan(0);

        const sources = screen.getAllByText(/Sources:/i);
        expect(sources.length).toBeGreaterThan(0);
    });
});
