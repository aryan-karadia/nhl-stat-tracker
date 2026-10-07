"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Users, FileText, Telescope, Trophy, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { TeamSwitcher } from "@/components/team-switcher";
import { useTeam } from "@/context/team-context";

const NAV_ITEMS = [
    { href: "/", label: "Standings", icon: Trophy },
    { href: "/salary-cap", label: "Team Roster", icon: Users },
    { href: "/draft-picks", label: "Draft Picks", icon: FileText },
    { href: "/prospect-pool", label: "Prospect Pool", icon: Telescope },
];

export function Nav() {
    const pathname = usePathname();
    const { selectedTeam } = useTeam();

    return (
        <header
            className="sticky top-0 z-30 border-b border-white/10 transition-colors duration-500"
            style={{ backgroundColor: "var(--team-primary, #0a0a0a)" }}
        >
            <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-4 sm:flex-nowrap sm:px-6">
                {/* Logo / Brand */}
                <Link href="/" className="brand-mark flex items-center gap-3 shrink-0">
                    <Image
                        src={selectedTeam.logoUrl}
                        alt={selectedTeam.name}
                        width={32}
                        height={32}
                        className="object-contain transition-all duration-500"
                    />
                    <div className="hidden sm:block">
                        <h1
                            className="font-display text-sm font-bold uppercase leading-tight tracking-[0.14em] transition-colors duration-500"
                            style={{ color: "var(--team-text, #fff)" }}
                        >
                            NHL Stat Tracker
                        </h1>
                        <p className="eyebrow text-white/50">{selectedTeam.city} / LIVE BOARD</p>
                    </div>
                </Link>

                {/* Navigation Links */}
                <nav className="nav-links flex items-center gap-1 overflow-x-auto">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "nav-link flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-white/20 shadow-sm"
                                        : "hover:bg-white/10"
                                )}
                                style={{ color: isActive ? "var(--team-text, #fff)" : "rgba(255,255,255,0.7)" }}
                            >
                                <item.icon className="h-4 w-4" />
                                <span className="hidden sm:inline">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Team Switcher */}
                <div className="w-full sm:w-56">
                    <TeamSwitcher />
                </div>
            </div>
            <div className="nav-rule mx-auto max-w-7xl" aria-hidden="true">
                <span><Activity className="h-3 w-3" /> DATA FEED ACTIVE</span>
                <span className="hidden sm:inline">NHL // 2025-26 REGULAR SEASON</span>
            </div>
        </header>
    );
}
