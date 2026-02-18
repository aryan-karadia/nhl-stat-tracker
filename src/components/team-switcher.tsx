"use client";

import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTeam } from "@/context/team-context";
import { getTeamsByDivision } from "@/lib/teams";
import { ColorScheme } from "@/types/nhl";

export function TeamSwitcher() {
    const { selectedTeam, colorScheme, setTeamAbbrev, setColorScheme } = useTeam();
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const teamsByDivision = getTeamsByDivision();
    const divisions = ["Atlantic", "Metropolitan", "Central", "Pacific"];

    // Handle Escape key to close dropdown
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && open) {
                setOpen(false);
                setSearchQuery("");
            }
        };

        if (open) {
            document.addEventListener("keydown", handleKeyDown);
        }

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open, setSearchQuery]);

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

    return (
        <div className="relative">
            {/* Trigger Button */}
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-3 rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium 
                   backdrop-blur-sm transition-all hover:bg-white/20 hover:shadow-lg w-full"
                style={{ color: "var(--team-text, #fff)" }}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={selectedTeam.logoUrl}
                    alt={selectedTeam.name}
                    className="h-6 w-6 object-contain"
                />
                <span className="flex-1 text-left truncate">{selectedTeam.name}</span>
                <ChevronsUpDown className="h-4 w-4 opacity-60" />
            </button>

            {/* Dropdown */}
            {open && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setOpen(false)}
                        aria-label="Close team selector"
                    />

                    <div
                        className="absolute left-0 top-full z-50 mt-2 w-80 rounded-xl border border-white/10 bg-gray-900/95 
                        shadow-2xl backdrop-blur-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                    >
                        {/* Search */}
                        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                            <Search className="h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search teams..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-500 outline-none"
                                autoFocus
                            />
                        </div>

                        {/* Color Scheme Toggle */}
                        <div className="flex gap-1 border-b border-white/10 px-4 py-2">
                            {(["regular", "alternate"] as ColorScheme[]).map((scheme) => (
                                <button
                                    key={scheme}
                                    onClick={() => setColorScheme(scheme)}
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
                        <div className="max-h-80 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-white/10">
                            {filteredDivisions.map((division) => (
                                <div key={division.name}>
                                    <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                        {division.name}
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
