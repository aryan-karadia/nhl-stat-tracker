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
        expect(screen.getAllByText(/#\d+ overall/i).length).toBeGreaterThan(0);
    });

    it("renders 'Pick position TBD' for future years (2026/2027)", () => {
        render(<DraftPicksPageClient />);
        fireEvent.click(screen.getByText("2026 Draft"));
        expect(screen.getAllByText("Pick position TBD").length).toBeGreaterThan(0);
    });

    it("displays traded pick indicator if pick is not own", async () => {
        const randomSpy = jest.spyOn(Math, "random").mockReturnValue(0.8);
        try {
            render(<DraftPicksPageClient />);
            // Use a function matcher to handle text split across nodes by the icon
            expect(screen.getByText((content) => content.includes("Via"))).toBeInTheDocument();
        } finally {
            randomSpy.mockRestore();
        }
    });

    it("renders projected player card when projection exists", () => {
        // Mock Math.random to ensure pick #1 which has James Chicken projection
        const randomSpy = jest.spyOn(Math, "random").mockReturnValue(0);
        try {
            render(<DraftPicksPageClient />);
            // With basePick = 1, we get James Chicken projection
            expect(screen.getByText("James Chicken")).toBeInTheDocument();

            // Verify the projection card content is rendered
            expect(screen.getByText(/Kingston Frontenacs/i)).toBeInTheDocument();
            expect(screen.getByText(/Sources:/i)).toBeInTheDocument();
        } finally {
            randomSpy.mockRestore();
        }
    });
    it("renders scouting report and sources in projection card", () => {
        const randomSpy = jest.spyOn(Math, "random").mockReturnValue(0);
        try {
            render(<DraftPicksPageClient />);
            // Projections should have content that resembles a scouting report
            // Based on MOCK_PROJECTIONS, basePick 1 gives James Chicken report
            const anyScoutingText = screen.getByText(/Exceptional two-way center/i);
            expect(anyScoutingText).toBeInTheDocument();

            const sources = screen.getAllByText(/Sources:/i);
            expect(sources.length).toBeGreaterThan(0);
        } finally {
            randomSpy.mockRestore();
        }
    });
});
