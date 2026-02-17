"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTeam } from "@/context/team-context";
import { getTeamsByDivision } from "@/lib/teams";
import { ColorScheme } from "@/types/nhl";

export function TeamSwitcher() {
    const { selectedTeam, colorScheme, setTeamAbbrev, setColorScheme } = useTeam();
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const teamsByDivision = getTeamsByDivision();
    const divisions = ["Atlantic", "Metropolitan", "Central", "Pacific"];

    const filteredDivisions = divisions
        .map((div) => ({
            name: div,
            teams: (teamsByDivision[div] || []).filter(
                (t) =>
                    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    t.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    t.abbreviation.toLowerCase().includes(searchQuery.toLowerCase())
            ),
        }))
        .filter((d) => d.teams.length > 0);

    // Flatten teams for keyboard navigation
    const allTeams = filteredDivisions.flatMap((d) => d.teams);

    // Handle keyboard navigation
    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setOpen(false);
                triggerRef.current?.focus();
            } else if (e.key === "ArrowDown") {
                e.preventDefault();
                setFocusedIndex((prev) => (prev < allTeams.length - 1 ? prev + 1 : prev));
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setFocusedIndex((prev) => (prev > 0 ? prev - 1 : 0));
            } else if (e.key === "Enter" && focusedIndex >= 0) {
                e.preventDefault();
                const team = allTeams[focusedIndex];
                if (team) {
                    setTeamAbbrev(team.abbreviation);
                    setOpen(false);
                    setSearchQuery("");
                    triggerRef.current?.focus();
                }
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [open, focusedIndex, allTeams, setTeamAbbrev]);

    // Focus search input when dropdown opens
    useEffect(() => {
        if (open && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [open]);


    return (
        <div className="relative">
            {/* Trigger Button */}
            <button
                ref={triggerRef}
                onClick={() => setOpen(!open)}
                aria-haspopup="true"
                aria-expanded={open}
                aria-labelledby="team-switcher-label"
                id="team-switcher-trigger"
                className="flex items-center gap-3 rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium 
                   backdrop-blur-sm transition-all hover:bg-white/20 hover:shadow-lg w-full"
                style={{ color: "var(--team-text, #fff)" }}
                aria-label="Select NHL team"
                aria-haspopup="menu"
                aria-expanded={open}
            >
                <Image
                    src={selectedTeam.logoUrl}
                    alt={selectedTeam.name}
                    width={24}
                    height={24}
                    className="object-contain"
                />
                <span id="team-switcher-label" className="flex-1 text-left truncate">{selectedTeam.name}</span>
                <ChevronsUpDown className="h-4 w-4 opacity-60" />
            </button>

            {/* Dropdown */}
            {open && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setOpen(false)}
                        aria-hidden="true"
                    />

                    <div
                        ref={dropdownRef}
                        role="dialog"
                        aria-labelledby="team-switcher-trigger"
                        aria-modal="true"
                        className="absolute left-0 top-full z-50 mt-2 w-80 rounded-xl border border-white/10 bg-gray-900/95 
                        shadow-2xl backdrop-blur-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                        role="menu"
                    >
                        {/* Search */}
                        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                            <Search className="h-4 w-4 text-gray-400" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search teams..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setFocusedIndex(-1);
                                }}
                                className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-500 outline-none"
                                aria-label="Search teams"
                                autoFocus
                            />
                        </div>

                        {/* Color Scheme Toggle */}
                        <div className="flex gap-1 border-b border-white/10 px-4 py-2" role="group" aria-label="Color scheme selection">
                            {(["regular", "alternate"] as ColorScheme[]).map((scheme) => (
                                <button
                                    key={scheme}
                                    onClick={() => setColorScheme(scheme)}
                                    aria-pressed={colorScheme === scheme}
                                    className={cn(
                                        "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors capitalize",
                                        colorScheme === scheme
                                            ? "bg-white/20 text-white"
                                            : "text-gray-400 hover:text-white hover:bg-white/10"
                                    )}
                                >
                                    {scheme}
                                </button>
                            ))}
                        </div>

                        {/* Team List */}
                        <div className="max-h-80 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-white/10" role="listbox" aria-label="Team selection">
                            {filteredDivisions.map((division, divIndex) => {
                                const startIndex = filteredDivisions
                                    .slice(0, divIndex)
                                    .reduce((acc, d) => acc + d.teams.length, 0);

                                return (
                                    <div key={division.name}>
                                        <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                            {division.name}
                                        </div>
                                        {division.teams.map((team, teamIndex) => {
                                            const globalIndex = startIndex + teamIndex;
                                            const isSelected = team.abbreviation === selectedTeam.abbreviation;
                                            const isFocused = globalIndex === focusedIndex;

                                            return (
                                                <button
                                                    key={team.abbreviation}
                                                    onClick={() => {
                                                        setTeamAbbrev(team.abbreviation);
                                                        setOpen(false);
                                                        setSearchQuery("");
                                                    }}
                                                    role="option"
                                                    aria-selected={isSelected}
                                                    className={cn(
                                                        "flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors",
                                                        isSelected
                                                            ? "bg-white/15 text-white"
                                                            : isFocused
                                                                ? "bg-white/10 text-white"
                                                                : "text-gray-300 hover:bg-white/10 hover:text-white"
                                                    )}
                                                >
                                                    <Image
                                                        src={team.logoUrl}
                                                        alt={team.name}
                                                        width={20}
                                                        height={20}
                                                        className="object-contain"
                                                    />
                                                    <span className="flex-1 text-left">{team.name}</span>
                                                    <span className="text-[10px] text-gray-500 font-mono">{team.abbreviation}</span>
                                                    {isSelected && (
                                                        <Check className="h-4 w-4 text-green-400" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {division.teams.map((team) => (
                                        <button
                                            key={team.abbreviation}
                                            onClick={() => {
                                                setTeamAbbrev(team.abbreviation);
                                                setOpen(false);
                                                setSearchQuery("");
                                            }}
                                            className={cn(
                                                "flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors",
                                                team.abbreviation === selectedTeam.abbreviation
                                                    ? "bg-white/15 text-white"
                                                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                                            )}
                                            role="menuitem"
                                        >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={team.logoUrl}
                                                alt={team.name}
                                                className="h-5 w-5 object-contain"
                                            />
                                            <span className="flex-1 text-left">{team.name}</span>
                                            <span className="text-[10px] text-gray-500 font-mono">{team.abbreviation}</span>
                                            {team.abbreviation === selectedTeam.abbreviation && (
                                                <Check className="h-4 w-4 text-green-400" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            ))}
                            {filteredDivisions.length === 0 && (
                                <div className="px-4 py-8 text-center text-sm text-gray-500">
                                    No teams found
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
