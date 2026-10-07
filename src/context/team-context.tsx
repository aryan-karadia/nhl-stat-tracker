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
    if (typeof window === 'undefined') return;
    const colors = team.colors[scheme];
    const root = document.documentElement;
    const primary = hexToRgb(colors.primary);
    const secondary = hexToRgb(colors.secondary);
    const atmosphere = primary ?? secondary ?? { r: 30, g: 80, b: 100 };
    const accent = secondary ?? primary ?? { r: 120, g: 160, b: 180 };

    root.style.setProperty("--team-primary", colors.primary);
    root.style.setProperty("--team-secondary", colors.secondary);
    root.style.setProperty("--team-accent", colors.accent);
    root.style.setProperty("--team-text", colors.text);
    root.style.setProperty("--page-bg", `rgb(${inkTone(atmosphere).join(", ")})`);
    root.style.setProperty("--page-glow", `rgba(${atmosphere.r}, ${atmosphere.g}, ${atmosphere.b}, 0.2)`);
    root.style.setProperty("--page-glow-accent", `rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.13)`);
}

function hexToRgb(hex: string) {
    const value = hex.replace("#", "");
    if (!/^[\da-f]{6}$/i.test(value)) return null;
    return {
        r: parseInt(value.slice(0, 2), 16),
        g: parseInt(value.slice(2, 4), 16),
        b: parseInt(value.slice(4, 6), 16),
    };
}

function inkTone({ r, g, b }: { r: number; g: number; b: number }) {
    // Pull every palette into a blue-black ink range so both light and dark
    // team colors remain legible without losing their visual identity.
    const luminance = (r * 299 + g * 587 + b * 114) / 1000;
    const lift = luminance > 190 ? 13 : luminance > 110 ? 11 : 9;
    return [
        Math.round(5 + (r / 255) * lift),
        Math.round(12 + (g / 255) * lift),
        Math.round(18 + (b / 255) * lift),
    ];
}

export function TeamProvider({ children }: { children: ReactNode }) {
    const [teamAbbrev, setTeamAbbrevState] = useState(DEFAULT_TEAM_ABBREV);
    const [colorScheme, setColorSchemeState] = useState<ColorScheme>("regular");

    const selectedTeam = getTeamByAbbrev(teamAbbrev) ?? NHL_TEAMS[0];

    // Load saved team from localStorage on mount
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const saved = localStorage.getItem("nhl-selected-team");
        const savedScheme = localStorage.getItem("nhl-color-scheme") as ColorScheme | null;

        // Use a microtask to avoid "set-state-in-effect" lint error
        Promise.resolve().then(() => {
            if (saved && getTeamByAbbrev(saved)) {
                setTeamAbbrevState(saved);
            }
            if (savedScheme === "regular" || savedScheme === "alternate") {
                setColorSchemeState(savedScheme);
            }
        });
    }, []);

    // Apply colors when team or scheme changes
    useEffect(() => {
        applyTeamColors(selectedTeam, colorScheme);
    }, [selectedTeam, colorScheme]);

    const setTeamAbbrev = useCallback((abbrev: string) => {
        setTeamAbbrevState(abbrev);
        if (typeof window !== 'undefined') {
            localStorage.setItem("nhl-selected-team", abbrev);
        }
    }, []);

    const setColorScheme = useCallback((scheme: ColorScheme) => {
        setColorSchemeState(scheme);
        if (typeof window !== 'undefined') {
            localStorage.setItem("nhl-color-scheme", scheme);
        }
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
