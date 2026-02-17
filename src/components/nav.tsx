"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, DollarSign, FileText, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { TeamSwitcher } from "@/components/team-switcher";
import { useTeam } from "@/context/team-context";

const NAV_ITEMS = [
    { href: "/", label: "Standings", icon: Trophy },
    { href: "/salary-cap", label: "Salary Cap", icon: DollarSign },
    { href: "/draft-picks", label: "Draft Picks", icon: FileText },
];

export function Nav() {
    const pathname = usePathname();
    const { selectedTeam } = useTeam();

    return (
        <header
            className="sticky top-0 z-30 border-b border-white/10 transition-colors duration-500"
            style={{ backgroundColor: "var(--team-primary, #0a0a0a)" }}
        >
            <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 sm:px-6">
                {/* Logo / Brand */}
                <Link href="/" className="flex items-center gap-3 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={selectedTeam.logoUrl}
                        alt={selectedTeam.name}
                        className="h-8 w-8 object-contain transition-all duration-500"
                    />
                    <div className="hidden sm:block">
                        <h1
                            className="text-sm font-bold leading-tight transition-colors duration-500"
                            style={{ color: "var(--team-text, #fff)" }}
                        >
                            NHL Stat Tracker
                        </h1>
                        <p className="text-[10px] text-white/50">{selectedTeam.city}</p>
                    </div>
                </Link>

                {/* Navigation Links */}
                <nav className="flex items-center gap-1">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
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
                <div className="w-56">
                    <TeamSwitcher />
                </div>
            </div>
        </header>
    );
}
