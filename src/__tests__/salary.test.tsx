/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { CapOverview } from "@/components/salary/cap-overview";
import { ContractsTable } from "@/components/salary/contracts-table";
import type { TeamCapSummary, PlayerContract } from "@/types/nhl";

// ── Helpers ────────────────────────────────────────────
function makeCapSummary(overrides: Partial<TeamCapSummary> = {}): TeamCapSummary {
    return {
        teamAbbrev: "TOR",
        salaryCap: 88_000_000,
        totalCapHit: 80_000_000,
        capSpace: 8_000_000,
        activeRoster: 20,
        deadCap: 0,
        ltirPool: 0,
        contractsCount: 20,
        ...overrides,
    };
}

function makeContract(overrides: Partial<PlayerContract> = {}): PlayerContract {
    return {
        player: {
            id: 1,
            firstName: "Auston",
            lastName: "Matthews",
            fullName: "Auston Matthews",
            position: "C",
            jerseyNumber: "34",
            headshot: "url",
        },
        teamAbbrev: "TOR",
        capHit: 13250000,
        aav: 13250000,
        totalValue: 53000000,
        yearsRemaining: 4,
        contractYears: [
            { season: "2024-25", baseSalary: 10000000, signingBonus: 3250000, capHit: 13250000, totalSalary: 13250000 },
        ],
        expiryStatus: "UFA",
        signingDate: "2023-08-23",
        tradeClause: { type: "NMC", details: "No Movement Clause" },
        ...overrides,
    };
}

// ── CapOverview ────────────────────────────────────────
describe("CapOverview", () => {
    it("renders salary cap and total cap hit", () => {
        const summary = makeCapSummary({ salaryCap: 88000000, totalCapHit: 80000000 });
        render(<CapOverview summary={summary} />);
        expect(screen.getByText("$88.0M")).toBeInTheDocument();
        expect(screen.getByText("$80.0M")).toBeInTheDocument();
    });

    it("renders positive cap space in green", () => {
        const summary = makeCapSummary({ capSpace: 8000000 });
        render(<CapOverview summary={summary} />);
        const capSpaceElement = screen.getByText("$8.0M");
        expect(capSpaceElement).toHaveClass("text-green-400");
    });

    it("renders negative cap space (over cap) in red", () => {
        const summary = makeCapSummary({ capSpace: -1000000 }); // $1.0M over
        render(<CapOverview summary={summary} />);
        const capSpaceElement = screen.getByText("$1.0M");
        expect(capSpaceElement).toHaveClass("text-red-400");
    });

    it("shows dead cap and LTIR pool when present", () => {
        const summary = makeCapSummary({ deadCap: 500000, ltirPool: 2000000 });
        render(<CapOverview summary={summary} />);
        expect(screen.getByText("Dead Cap:")).toBeInTheDocument();
        expect(screen.getByText("$500K")).toBeInTheDocument();
        expect(screen.getByText("LTIR Pool:")).toBeInTheDocument();
        expect(screen.getByText("$2.0M")).toBeInTheDocument();
    });

    it("renders usage percentage", () => {
        const summary = makeCapSummary({ salaryCap: 100, totalCapHit: 50 });
        render(<CapOverview summary={summary} />);
        expect(screen.getByText("50.0%")).toBeInTheDocument();
    });
});

// ── ContractsTable ─────────────────────────────────────
describe("ContractsTable", () => {
    it("renders player names and positions", () => {
        const contracts = [
            makeContract({ player: { ...makeContract().player, fullName: "Player A", position: "LW", jerseyNumber: "11" } }),
            makeContract({ player: { ...makeContract().player, fullName: "Player B", position: "D", jerseyNumber: "22" } }),
        ];
        render(<ContractsTable contracts={contracts} />);
        expect(screen.getByText("Player A")).toBeInTheDocument();
        expect(screen.getByText("Player B")).toBeInTheDocument();
        expect(screen.getByText("LW")).toBeInTheDocument();
        expect(screen.getByText("D")).toBeInTheDocument();
    });

    it("expands contract detail on click", () => {
        const contract = makeContract({ player: { ...makeContract().player, fullName: "Expendable Player" } });
        render(<ContractsTable contracts={[contract]} />);

        // Check it starts collapsed (Contract Breakdown shouldn't be visible)
        expect(screen.queryByText("Contract Breakdown")).not.toBeInTheDocument();

        // Click the row
        fireEvent.click(screen.getByText("Expendable Player"));

        // Now it should be expanded
        expect(screen.getByText("Contract Breakdown")).toBeInTheDocument();
        expect(screen.getByText("Trade Protection")).toBeInTheDocument();
    });

    it("sorts by cap hit descending by default", () => {
        const contracts = [
            makeContract({ capHit: 1000000, player: { ...makeContract().player, fullName: "Cheap Player" } }),
            makeContract({ capHit: 10000000, player: { ...makeContract().player, fullName: "Star Player" } }),
        ];
        render(<ContractsTable contracts={contracts} />);

        const rows = screen.getAllByRole("row");
        // Row 0 is header, Row 1 should be Star Player
        expect(rows[1]).toHaveTextContent("Star Player");
    });

    it("allows changing sort key", () => {
        const contracts = [
            makeContract({ player: { ...makeContract().player, fullName: "Zebra" } }),
            makeContract({ player: { ...makeContract().player, fullName: "Apple" } }),
        ];
        render(<ContractsTable contracts={contracts} />);

        // Default sort is cap hit (they have same cap hit, so order depends on array)
        // Click "Player" header to sort by name
        fireEvent.click(screen.getByText("Player"));

        const rows = screen.getAllByRole("row");
        // Should be Apple first now (asc or desc depending on initial click toggle)
        // First click on a new column usually sorts desc, let's check
        expect(rows[1]).toHaveTextContent("Zebra"); // wait, name sort might be alphabetical

        // Click again to toggle desc -> asc
        fireEvent.click(screen.getByText("Player"));
        const rowsReSorted = screen.getAllByRole("row");
        expect(rowsReSorted[1]).toHaveTextContent("Apple");
    });

    it("renders clause badge correctly", () => {
        const contract = makeContract({ tradeClause: { type: "NMC", details: "Full NMC" } });
        render(<ContractsTable contracts={[contract]} />);
        expect(screen.getByText("NMC")).toBeInTheDocument();
    });

    it("displays contract breakdown in expanded view", () => {
        const contract = makeContract({
            contractYears: [
                { season: "2024-25", baseSalary: 1000, signingBonus: 500, capHit: 1500, totalSalary: 1500 },
            ],
        });
        render(<ContractsTable contracts={[contract]} />);
        fireEvent.click(screen.getByText("Auston Matthews"));

        expect(screen.getByText("2024-25")).toBeInTheDocument();
        expect(screen.getByText("Base: $1000")).toBeInTheDocument();
        expect(screen.getByText("Bonus: $500")).toBeInTheDocument();
    });

    it("renders multiple allowed teams as badges in expanded view", () => {
        const contract = makeContract({
            tradeClause: { type: "M-NTC", details: "10-team list", allowedTeams: ["TOR", "MTL", "VAN"] },
        });
        render(<ContractsTable contracts={[contract]} />);
        fireEvent.click(screen.getByText("Auston Matthews"));

        expect(screen.getByText("Trade List:")).toBeInTheDocument();
        expect(screen.getByText("TOR")).toBeInTheDocument();
        expect(screen.getByText("MTL")).toBeInTheDocument();
        expect(screen.getByText("VAN")).toBeInTheDocument();
    });

    it("preserves expanded contract when sorting changes", () => {
        const contracts = [
            makeContract({
                player: { id: 1, firstName: "Auston", lastName: "Matthews", fullName: "Auston Matthews", position: "C", jerseyNumber: "34", headshot: "url" },
                capHit: 13250000,
            }),
            makeContract({
                player: { id: 2, firstName: "John", lastName: "Tavares", fullName: "John Tavares", position: "C", jerseyNumber: "91", headshot: "url" },
                capHit: 11000000,
            }),
            makeContract({
                player: { id: 3, firstName: "William", lastName: "Nylander", fullName: "William Nylander", position: "RW", jerseyNumber: "88", headshot: "url" },
                capHit: 11500000,
            }),
        ];
        render(<ContractsTable contracts={contracts} />);

        // Expand the second player (John Tavares) in the cap hit sorted list
        fireEvent.click(screen.getByText("John Tavares"));

        // Verify it's expanded
        expect(screen.getByText("Contract Breakdown")).toBeInTheDocument();

        // Sort by name (which will change the order)
        fireEvent.click(screen.getByText("Player"));

        // John Tavares should still be expanded even though the order changed
        expect(screen.getByText("Contract Breakdown")).toBeInTheDocument();

        // Verify John Tavares row still shows as expanded (has bg-white/10 class)
        const tavaresRow = screen.getByText("John Tavares").closest("tr");
        expect(tavaresRow).toHaveClass("bg-white/10");
    });
});
