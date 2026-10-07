"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { NHLPlayerLanding, NHLRosterPlayer } from "@/lib/nhl-api";
import { cn } from "@/lib/utils";

interface TeamRosterProps {
    roster: NHLRosterPlayer[];
}

function formatHeight(inches?: number): string {
    if (!inches) return "—";
    return `${Math.floor(inches / 12)}'${inches % 12}"`;
}

function currentNhlSeasonStartYear(): number {
    const now = new Date();
    return now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
}

function formatSeason(season?: number): string {
    if (!season) return "latest available";
    const seasonText = String(season);
    if (seasonText.length !== 8) return "latest available";
    return `${seasonText.slice(0, 4)}-${seasonText.slice(6)}`;
}

function PlayerDetails({ playerId, isGoalie }: { playerId: number; isGoalie: boolean }) {
    const [details, setDetails] = useState<NHLPlayerLanding | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let cancelled = false;

        fetch(`/api/nhl/player/${playerId}`)
            .then((response) => {
                if (!response.ok) throw new Error("Player details unavailable");
                return response.json() as Promise<NHLPlayerLanding>;
            })
            .then((value) => {
                if (!cancelled) setDetails(value);
            })
            .catch(() => {
                if (!cancelled) setError(true);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [playerId]);

    if (loading) return <p className="text-xs text-gray-400">Loading official NHL profile…</p>;
    if (error || !details) return <p className="text-xs text-gray-400">Player profile unavailable.</p>;

    const stats = details.featuredStats?.regularSeason?.subSeason;
    const careerStats = details.careerTotals?.regularSeason;
    const statsSeasonStart = details.featuredStats?.season
        ? Math.floor(details.featuredStats.season / 10_000)
        : undefined;
    const isCurrentSeason = statsSeasonStart === currentNhlSeasonStartYear();
    const statsLabel = isCurrentSeason ? "Current goalie stats" : `Latest available goalie stats (${formatSeason(details.featuredStats?.season)})`;
    return (
        <div className="grid gap-2 text-xs text-gray-400 sm:grid-cols-2">
            <span>Born: {details.birthDate ?? "—"}{details.birthCity?.default ? ` · ${details.birthCity.default}` : ""}</span>
            <span>Size: {formatHeight(details.heightInInches)} · {details.weightInPounds ?? "—"} lb</span>
            <span>Shoots: {details.shootsCatches ?? "—"}</span>
            {isGoalie && stats ? (
                <span>
                    {statsLabel}: {stats.gamesPlayed ?? 0} GP · {stats.wins ?? 0} W · {stats.losses ?? 0} L ·{" "}
                    {stats.savePctg !== undefined ? `${(stats.savePctg * 100).toFixed(1)}% SV` : "— SV"} ·{" "}
                    {stats.goalsAgainstAvg !== undefined ? `${stats.goalsAgainstAvg.toFixed(2)} GAA` : "— GAA"} ·{" "}
                    {stats.shutouts ?? 0} SO
                </span>
            ) : stats ? (
                <span>
                    {isCurrentSeason ? "Current skater stats" : `Latest available skater stats (${formatSeason(details.featuredStats?.season)})`}:{" "}
                    {stats.goals ?? 0} G · {stats.assists ?? 0} A · {stats.points ?? 0} P
                </span>
            ) : null}
            {isGoalie && careerStats && careerStats.goals && careerStats.goals > 0 && (
                <span className="font-semibold text-amber-300 sm:col-span-2">
                    🥅 Goalie goal! {careerStats.goals} career {careerStats.goals === 1 ? "goal" : "goals"}
                </span>
            )}
        </div>
    );
}

function PlayerCard({ player, label }: { player: NHLRosterPlayer; label?: string }) {
    const [expanded, setExpanded] = useState(false);
    const name = `${player.firstName.default} ${player.lastName.default}`;

    return (
        <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.06]">
            <button
                className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-white/[0.08]"
                onClick={() => setExpanded(!expanded)}
                aria-expanded={expanded}
            >
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-black/30">
                    <Image
                        src={player.headshot}
                        alt={`${name} headshot`}
                        fill
                        sizes="80px"
                        className="object-cover object-top"
                    />
                </div>
                <span className="min-w-0 flex-1">
                    {label && <span className="eyebrow block text-[10px] text-gray-500">{label}</span>}
                    <span className="block truncate text-base font-semibold">{name}</span>
                    <span className="mt-1 block text-sm text-gray-400">
                        #{player.sweaterNumber} · {player.positionCode}
                        {player.shootsCatches ? ` · Shoots ${player.shootsCatches}` : ""}
                    </span>
                    <span className="mt-1 block text-xs text-gray-500">
                        {player.birthDate ?? "Birth date unavailable"}
                        {player.heightInInches ? ` · ${formatHeight(player.heightInInches)}` : ""}
                        {player.weightInPounds ? ` · ${player.weightInPounds} lb` : ""}
                    </span>
                </span>
                {expanded ? <ChevronUp className="h-4 w-4 shrink-0 text-gray-400" /> : <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />}
            </button>
            {expanded && (
                <div className="border-t border-white/10 px-4 py-3">
                    <PlayerDetails playerId={player.id} isGoalie={player.positionCode === "G"} />
                </div>
            )}
        </div>
    );
}

function Section({
    title,
    players,
    columns,
    labels,
}: {
    title: string;
    players: NHLRosterPlayer[];
    columns: string;
    labels?: string[];
}) {
    return (
        <section>
            <div className="mb-3 flex items-center gap-3">
                <h3 className="eyebrow text-xs font-bold text-gray-300">{title}</h3>
                <div className="h-px flex-1 bg-white/10" />
            </div>
            <div className={cn("grid gap-3", columns)}>
                {players.map((player, index) => (
                    <PlayerCard key={player.id} player={player} label={labels?.[index]} />
                ))}
            </div>
        </section>
    );
}

export function TeamRoster({ roster }: TeamRosterProps) {
    const forwards = useMemo(() => roster.filter((player) => ["C", "L", "R", "W"].includes(player.positionCode)), [roster]);
    const defensemen = useMemo(() => roster.filter((player) => player.positionCode === "D"), [roster]);
    const goalies = useMemo(() => roster.filter((player) => player.positionCode === "G"), [roster]);

    return (
        <div className="flex flex-col gap-8">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-gray-400">
                <span className="font-semibold text-gray-200">Projected lines sheet</span>
                <span className="ml-2">Players are grouped from the official NHL roster order; game-to-game line assignments may differ.</span>
            </div>

            <div className="flex flex-col gap-6">
                <h3 className="eyebrow text-xs font-bold text-gray-300">Forwards</h3>
                {[0, 1, 2, 3].map((line) => {
                    const players = forwards.slice(line * 3, line * 3 + 3);
                    return players.length > 0 ? (
                        <Section key={line} title={`Line ${line + 1}`} players={players} columns="grid-cols-1 md:grid-cols-3" />
                    ) : null;
                })}
            </div>
            <div className="flex flex-col gap-6">
                <h3 className="eyebrow text-xs font-bold text-gray-300">Defense pairings</h3>
                {[0, 1, 2].map((pair) => {
                    const players = defensemen.slice(pair * 2, pair * 2 + 2);
                    return players.length > 0 ? (
                        <Section key={pair} title={`Pair ${pair + 1}`} players={players} columns="grid-cols-1 md:grid-cols-2" />
                    ) : null;
                })}
            </div>
            <GoalieTandem goalies={goalies.slice(0, 3)} />
        </div>
    );
}

function GoalieTandem({ goalies }: { goalies: NHLRosterPlayer[] }) {
    const [orderedGoalies, setOrderedGoalies] = useState(goalies);

    useEffect(() => {
        let cancelled = false;

        async function orderGoalies() {
            const profiles = await Promise.all(goalies.map(async (goalie) => {
                try {
                    const response = await fetch(`/api/nhl/player/${goalie.id}`);
                    if (!response.ok) return { goalie, starts: 0, games: 0, currentWins: 0 };
                    const profile = await response.json() as NHLPlayerLanding;
                    const career = profile.careerTotals?.regularSeason;
                    const current = profile.featuredStats?.regularSeason?.subSeason;
                    return {
                        goalie,
                        starts: career?.gamesStarted ?? 0,
                        games: career?.gamesPlayed ?? 0,
                        currentWins: current?.wins ?? 0,
                    };
                } catch {
                    return { goalie, starts: 0, games: 0, currentWins: 0 };
                }
            }));

            if (!cancelled) {
                setOrderedGoalies(
                    profiles
                        .sort((a, b) => b.starts - a.starts || b.games - a.games || b.currentWins - a.currentWins)
                        .map(({ goalie }) => goalie)
                );
            }
        }

        orderGoalies();
        return () => {
            cancelled = true;
        };
    }, [goalies]);

    return (
        <Section
            title="Goalie tandem"
            players={orderedGoalies.slice(0, 2)}
            columns="grid-cols-1 md:grid-cols-2"
            labels={["Goalie A · projected starter", "Goalie B · projected backup"]}
        />
    );
}
