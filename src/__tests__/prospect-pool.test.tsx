/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProspectPoolPageClient } from "@/app/prospect-pool/client";
import { getProspectPool } from "@/lib/prospects-api";

jest.mock("@/lib/prospects-api", () => ({
  getProspectPool: jest.fn(),
}));

jest.mock("@/context/team-context", () => ({
  useTeam: () => ({
    selectedTeam: { abbreviation: "TOR", name: "Toronto Maple Leafs" },
    colorScheme: "regular",
    setTeamAbbrev: jest.fn(),
    setColorScheme: jest.fn(),
  }),
}));

const mockedGetProspectPool = getProspectPool as jest.MockedFunction<typeof getProspectPool>;

describe("ProspectPoolPageClient", () => {
  beforeEach(() => {
    mockedGetProspectPool.mockResolvedValue([
      {
        id: "TOR-1",
        teamAbbrev: "TOR",
        fullName: "Noah Powell",
        position: "C",
        age: 20,
        currentTeam: "London Knights",
        league: "OHL",
        draftInfo: "2024 - Round 1",
        report: {
          summary: "Pace-driving center with strong middle-lane habits.",
          strengths: ["Acceleration"],
          developmentAreas: ["Faceoffs"],
          sourceNotes: ["Example"],
          confidence: "medium",
        },
      },
    ]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders heading and team description", async () => {
    render(<ProspectPoolPageClient />);
    expect(screen.getByText("Prospect Pool")).toBeInTheDocument();
    expect(screen.getByText(/Toronto Maple Leafs drafted players and development pipeline/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(mockedGetProspectPool).toHaveBeenCalledWith("TOR");
    });
  });

  it("renders a prospect card with strengths and development areas", async () => {
    render(<ProspectPoolPageClient />);

    await waitFor(() => {
      expect(screen.getByText("Noah Powell")).toBeInTheDocument();
      expect(screen.getByText("Strengths")).toBeInTheDocument();
      expect(screen.getByText("Development Areas")).toBeInTheDocument();
    });
  });

  it("shows error state when loading fails", async () => {
    mockedGetProspectPool.mockRejectedValueOnce(new Error("network"));
    render(<ProspectPoolPageClient />);

    await waitFor(() => {
      expect(screen.getByText(/Unable to load prospect pool right now/i)).toBeInTheDocument();
    });
  });

  it("filters prospects by name, draft details, and position", async () => {
    mockedGetProspectPool.mockResolvedValueOnce([
      {
        id: "TOR-1",
        teamAbbrev: "TOR",
        fullName: "Noah Powell",
        position: "C",
        age: 20,
        currentTeam: "London Knights",
        league: "OHL",
        draftInfo: "2024 - Round 1",
        report: {
          summary: "Center report",
          strengths: ["Acceleration"],
          developmentAreas: ["Faceoffs"],
          sourceNotes: ["Example"],
          confidence: "medium",
        },
      },
      {
        id: "TOR-2",
        teamAbbrev: "TOR",
        fullName: "Lukas Berg",
        position: "D",
        age: 21,
        currentTeam: "Toronto Marlies",
        league: "AHL",
        draftInfo: "2023 - Round 2",
        report: {
          summary: "Defense report",
          strengths: ["Mobility"],
          developmentAreas: ["Board battles"],
          sourceNotes: ["Example"],
          confidence: "high",
        },
      },
    ]);
    const user = userEvent.setup();
    render(<ProspectPoolPageClient />);

    await waitFor(() => expect(screen.getByText("Lukas Berg")).toBeInTheDocument());
    await user.type(screen.getByLabelText("Search prospects by name"), "Noah");
    expect(screen.getByText("Noah Powell")).toBeInTheDocument();
    expect(screen.queryByText("Lukas Berg")).not.toBeInTheDocument();

    await user.clear(screen.getByLabelText("Search prospects by name"));
    await user.selectOptions(screen.getByLabelText("Filter by draft year"), "2023");
    await user.selectOptions(screen.getByLabelText("Filter by draft round"), "2");
    await user.selectOptions(screen.getByLabelText("Filter by position"), "D");

    expect(screen.getByText("Lukas Berg")).toBeInTheDocument();
    expect(screen.queryByText("Noah Powell")).not.toBeInTheDocument();
  });
});
