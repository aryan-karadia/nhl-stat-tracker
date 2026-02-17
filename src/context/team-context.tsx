"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { TeamConfig, ColorScheme } from "@/types/nhl";
import { NHL_TEAMS, DEFAULT_TEAM_ABBREV, getTeamByAbbrev } from "@/lib/teams";

interface TeamContextValue {
    selectedTeam: TeamConfig;
    colorScheme: ColorScheme;
    setTeamAbbrev: (abbrev: string) => void;
    setColorScheme: (scheme: ColorScheme) => void;
}

const TeamContext = createContext<TeamContextValue | null>(null);

function applyTeamColors(team: TeamConfig, scheme: ColorScheme) {
    const colors = team.colors[scheme];
    const root = document.documentElement;
    root.style.setProperty("--team-primary", colors.primary);
    root.style.setProperty("--team-secondary", colors.secondary);
    root.style.setProperty("--team-accent", colors.accent);
    root.style.setProperty("--team-text", colors.text);
}

export function TeamProvider({ children }: { children: ReactNode }) {
    const [teamAbbrev, setTeamAbbrevState] = useState(DEFAULT_TEAM_ABBREV);
    const [colorScheme, setColorSchemeState] = useState<ColorScheme>("regular");

    const selectedTeam = getTeamByAbbrev(teamAbbrev) ?? NHL_TEAMS[0];

    // Load saved team from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem("nhl-selected-team");
        const savedScheme = localStorage.getItem("nhl-color-scheme") as ColorScheme | null;
        if (saved && getTeamByAbbrev(saved)) {
            setTeamAbbrevState(saved);
        }
        if (savedScheme === "regular" || savedScheme === "alternate") {
            setColorSchemeState(savedScheme);
        }
    }, []);

    // Apply colors when team or scheme changes
    useEffect(() => {
        applyTeamColors(selectedTeam, colorScheme);
    }, [selectedTeam, colorScheme]);

    const setTeamAbbrev = useCallback((abbrev: string) => {
        setTeamAbbrevState(abbrev);
        localStorage.setItem("nhl-selected-team", abbrev);
    }, []);

    const setColorScheme = useCallback((scheme: ColorScheme) => {
        setColorSchemeState(scheme);
        localStorage.setItem("nhl-color-scheme", scheme);
    }, []);

    return (
        <TeamContext.Provider value={{ selectedTeam, colorScheme, setTeamAbbrev, setColorScheme }}>
            {children}
        </TeamContext.Provider>
    );
}

export function useTeam() {
    const ctx = useContext(TeamContext);
    if (!ctx) throw new Error("useTeam must be used within a TeamProvider");
    return ctx;
}
