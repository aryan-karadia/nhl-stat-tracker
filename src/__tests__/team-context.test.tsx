/**
 * @jest-environment jsdom
 */
import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react";
import { TeamProvider, useTeam } from "@/context/team-context";
import { DEFAULT_TEAM_ABBREV, getTeamByAbbrev } from "@/lib/teams";

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string | null> = {};
    return {
        getItem: jest.fn((key: string): string | null => store[key] ?? null),
        setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
        removeItem: jest.fn((key: string) => { delete store[key]; }),
        clear: jest.fn(() => { store = {}; }),
    };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Mock document.documentElement.style.setProperty
const setPropertySpy = jest.spyOn(document.documentElement.style, "setProperty");

beforeEach(() => {
    localStorageMock.clear();
    setPropertySpy.mockClear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
});

function wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(TeamProvider, null, children);
}

describe("TeamProvider and useTeam", () => {
    it("provides default team on initial render", () => {
        const { result } = renderHook(() => useTeam(), { wrapper });
        expect(result.current.selectedTeam.abbreviation).toBe(DEFAULT_TEAM_ABBREV);
    });

    it("provides default color scheme as 'regular'", () => {
        const { result } = renderHook(() => useTeam(), { wrapper });
        expect(result.current.colorScheme).toBe("regular");
    });

    it("allows changing team abbreviation", () => {
        const { result } = renderHook(() => useTeam(), { wrapper });

        act(() => {
            result.current.setTeamAbbrev("BOS");
        });

        expect(result.current.selectedTeam.abbreviation).toBe("BOS");
        expect(result.current.selectedTeam.name).toBe("Boston Bruins");
    });

    it("saves team selection to localStorage", () => {
        const { result } = renderHook(() => useTeam(), { wrapper });

        act(() => {
            result.current.setTeamAbbrev("MTL");
        });

        expect(localStorageMock.setItem).toHaveBeenCalledWith("nhl-selected-team", "MTL");
    });

    it("allows changing color scheme", () => {
        const { result } = renderHook(() => useTeam(), { wrapper });

        act(() => {
            result.current.setColorScheme("alternate");
        });

        expect(result.current.colorScheme).toBe("alternate");
    });

    it("saves color scheme to localStorage", () => {
        const { result } = renderHook(() => useTeam(), { wrapper });

        act(() => {
            result.current.setColorScheme("alternate");
        });

        expect(localStorageMock.setItem).toHaveBeenCalledWith("nhl-color-scheme", "alternate");
    });

    it("applies CSS custom properties when team changes", () => {
        const { result } = renderHook(() => useTeam(), { wrapper });

        act(() => {
            result.current.setTeamAbbrev("BOS");
        });

        const bosTeam = getTeamByAbbrev("BOS")!;
        expect(setPropertySpy).toHaveBeenCalledWith("--team-primary", bosTeam.colors.regular.primary);
        expect(setPropertySpy).toHaveBeenCalledWith("--team-secondary", bosTeam.colors.regular.secondary);
    });

    it("throws error when useTeam is used outside TeamProvider", () => {
        // Suppress console.error for expected error
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });

        expect(() => {
            renderHook(() => useTeam());
        }).toThrow("useTeam must be used within a TeamProvider");

        consoleSpy.mockRestore();
    });

    it("loads saved team from localStorage on mount", async () => {
        localStorageMock.getItem.mockImplementation((key: string): string | null => {
            if (key === "nhl-selected-team") return "EDM";
            return null;
        });

        const { result } = renderHook(() => useTeam(), { wrapper });
        // After useEffect runs, team should be EDM
        await waitFor(() => expect(result.current.selectedTeam.abbreviation).toBe("EDM"));
    });

    it("loads saved color scheme from localStorage on mount", async () => {
        localStorageMock.getItem.mockImplementation((key: string): string | null => {
            if (key === "nhl-color-scheme") return "alternate";
            return null;
        });

        const { result } = renderHook(() => useTeam(), { wrapper });
        await waitFor(() => expect(result.current.colorScheme).toBe("alternate"));
    });

    it("ignores invalid localStorage values", () => {
        localStorageMock.getItem.mockImplementation((key: string): string | null => {
            if (key === "nhl-selected-team") return "INVALID";
            if (key === "nhl-color-scheme") return "invalid-scheme";
            return null;
        });

        const { result } = renderHook(() => useTeam(), { wrapper });
        expect(result.current.selectedTeam.abbreviation).toBe(DEFAULT_TEAM_ABBREV);
        expect(result.current.colorScheme).toBe("regular");
    });
});
