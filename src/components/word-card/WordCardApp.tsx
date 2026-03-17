"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./WordCardApp.module.css";
import { LEVELS, WORD_POOLS } from "./data";
import type { Pos } from "./types";
import { buildPuzzle } from "./puzzle";
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { setUnlocked, setStars } from '@/store/gameSlice';
import { speak } from "./speech";

type Screen = "map" | "game";

function keyOf(pos: Pos) {
    return `${pos.r},${pos.c}`;
}

function getLine(r1: number, c1: number, r2: number, c2: number): Pos[] {
    const line: Pos[] = [];
    const dr = Math.sign(r2 - r1);
    const dc = Math.sign(c2 - c1);

    if (r1 === r2 || c1 === c2 || Math.abs(r1 - r2) === Math.abs(c1 - c2)) {
        let r = r1;
        let c = c1;
        while (true) {
            line.push({ r, c });
            if (r === r2 && c === c2) break;
            r += dr;
            c += dc;
        }
    }
    return line;
}

export function WordCardApp() {
    const MAX_LEVEL_MS = 5 * 60 * 1000;

    const [screen, setScreen] = useState<Screen>("map");
    const [entranceActive, setEntranceActive] = useState(false);

    const [levelIndex, setLevelIndex] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => setEntranceActive(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const [grid, setGrid] = useState<string[][]>([]);
    const [placedWords, setPlacedWords] = useState<string[]>([]);
    const [foundWords, setFoundWords] = useState<string[]>([]);
    const [foundCells, setFoundCells] = useState<Set<string>>(() => new Set());

    const { unlocked, results } = useSelector((state: RootState) => state.game);
    const dispatch = useDispatch<AppDispatch>();

    const [winActive, setWinActive] = useState(false);
    const [gameOverActive, setGameOverActive] = useState(false);
    const [levelStartedAt, setLevelStartedAt] = useState<number | null>(null);
    const [elapsedMs, setElapsedMs] = useState(0);
    const [lastWinStars, setLastWinStars] = useState(3);

    // Interaction
    const [selecting, setSelecting] = useState(false);
    const [startCell, setStartCell] = useState<Pos | null>(null);
    const [selection, setSelection] = useState<Pos[]>([]);

    const gridRef = useRef<HTMLDivElement | null>(null);

    const selectingKeys = useMemo(() => new Set(selection.map(keyOf)), [selection]);

    useEffect(() => {
        if (screen !== "game" || !levelStartedAt) return;
        const id = window.setInterval(() => {
            setElapsedMs(Date.now() - levelStartedAt);
        }, 250);
        return () => window.clearInterval(id);
    }, [screen, levelStartedAt]);

    useEffect(() => {
        if (screen !== "game") return;
        if (winActive || gameOverActive) return;
        if (elapsedMs >= MAX_LEVEL_MS) {
            setSelecting(false);
            setSelection([]);
            setStartCell(null);
            setGameOverActive(true);
        }
    }, [elapsedMs, gameOverActive, screen, winActive]);

    function computeStars(ms: number) {
        const cfg = LEVELS[levelIndex];
        const base = 12_000;
        const perWord = 5_000;
        const perCell = 120;
        const diagonalPenalty = cfg.diagonal ? 6_000 : 0;
        const t3 = base + cfg.words * perWord + cfg.size * cfg.size * perCell + diagonalPenalty;
        const t2 = Math.round(t3 * 1.6);
        const t1 = Math.round(t3 * 2.4);
        if (ms <= t3) return 3;
        if (ms <= t2) return 2;
        if (ms <= t1) return 1;
        return 1;
    }

    function formatMs(ms: number) {
        const totalSec = Math.floor(ms / 1000);
        const m = Math.floor(totalSec / 60);
        const s = totalSec % 60;
        return `${m}:${String(s).padStart(2, "0")}`;
    }

    function startLevel(idx: number) {
        const cfg = LEVELS[idx];
        const pool = WORD_POOLS[cfg.pool] ?? WORD_POOLS[0];
        const puzzle = buildPuzzle(cfg, pool);

        setLevelIndex(idx);
        setGrid(puzzle.grid);
        setPlacedWords(puzzle.placedWords);
        setFoundWords([]);
        setFoundCells(new Set());

        setSelection([]);
        setStartCell(null);
        setSelecting(false);
        setWinActive(false);
        setGameOverActive(false);
        const now = Date.now();
        setLevelStartedAt(now);
        setElapsedMs(0);
        setLastWinStars(3);
        setScreen("game");
    }

    function goToMap() {
        setWinActive(false);
        setGameOverActive(false);
        setScreen("map");
    }

    function retryLevel() {
        startLevel(levelIndex);
    }

    function nextLevel() {
        if (levelIndex + 1 < LEVELS.length) startLevel(levelIndex + 1);
        else goToMap();
    }

    function getCellFromPoint(clientX: number, clientY: number): HTMLElement | null {
        const el = document.elementFromPoint(clientX, clientY);
        if (!el) return null;
        if (el instanceof HTMLElement && el.dataset.role === "cell") return el;
        return null;
    }

    function onPointerDown(e: React.PointerEvent) {
        if (screen !== "game") return;
        if (winActive || gameOverActive) return;
        if (elapsedMs >= MAX_LEVEL_MS) return;
        if (!gridRef.current) return;

        (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
        e.preventDefault();

        const cellEl = getCellFromPoint(e.clientX, e.clientY);
        if (!cellEl) return;

        const r = Number(cellEl.dataset.row);
        const c = Number(cellEl.dataset.col);
        if (!Number.isFinite(r) || !Number.isFinite(c)) return;

        const start = { r, c };
        setSelecting(true);
        setStartCell(start);
        setSelection([start]);
    }

    function onPointerMove(e: React.PointerEvent) {
        if (!selecting || !startCell) return;
        if (winActive || gameOverActive) return;
        if (elapsedMs >= MAX_LEVEL_MS) return;
        e.preventDefault();

        const cellEl = getCellFromPoint(e.clientX, e.clientY);
        if (!cellEl) return;
        const r = Number(cellEl.dataset.row);
        const c = Number(cellEl.dataset.col);
        if (!Number.isFinite(r) || !Number.isFinite(c)) return;

        setSelection(getLine(startCell.r, startCell.c, r, c));
    }

    function onPointerUp() {
        if (!selecting) return;
        setSelecting(false);
        if (winActive || gameOverActive) return;
        if (elapsedMs >= MAX_LEVEL_MS) return;

        const cfg = LEVELS[levelIndex];
        const word = selection.map((p) => grid[p.r]?.[p.c] ?? "").join("");
        const reversed = word.split("").reverse().join("");

        const match = placedWords.find((w) => (w === word || w === reversed) && !foundWords.includes(w));
        if (!match) {
            setSelection([]);
            setStartCell(null);
            return;
        }

        speak(match);
        setFoundWords((prev) => [...prev, match]);
        setFoundCells((prev) => {
            const next = new Set(prev);
            for (const p of selection) next.add(keyOf(p));
            return next;
        });

        setSelection([]);
        setStartCell(null);

        const newFoundCount = foundWords.length + 1;
        if (newFoundCount >= placedWords.length) {
            const finalElapsed = levelStartedAt ? Date.now() - levelStartedAt : elapsedMs;
            const stars = computeStars(finalElapsed);
            setLastWinStars(stars);
            dispatch(setStars({ level: levelIndex, stars }));
            if (levelIndex + 1 < LEVELS.length) {
                dispatch(setUnlocked(Math.max(unlocked, levelIndex + 2)));
            }
            window.setTimeout(() => setWinActive(true), 500);
        }

        void cfg;
    }

    const currentSize = LEVELS[levelIndex]?.size ?? 0;

    return (
        <div className={`${styles.appShell} ${entranceActive ? 'animate-shell-entrance' : ''}`}>
            <div className={styles.app} aria-label="Word Card Adventure">

                {/* MAP SCREEN */}
                <section
                    className={[
                        styles.screen,
                        screen === "game" ? styles.menu : "",
                    ].join(" ")}
                    aria-hidden={screen !== "map"}
                >
                    <header className={styles.mapHeader}>
                        <h1 className={styles.title}>WORD HUNT</h1>
                        <p>Learn to spell with fun!</p>
                    </header>

                    <div className={styles.mapContainer}>
                        <div className={styles.pathLine} />
                        <div className={styles.levelsList} role="list" aria-label="Levels">
                            {LEVELS.map((_, i) => {
                                const num = i + 1;
                                const isUnlocked = num <= unlocked;
                                const stars = results[i] || 0;

                                const className = [
                                    styles.levelNode,
                                    isUnlocked ? styles.unlocked : "",
                                    stars > 0 ? styles.completed : "",
                                ].join(" ");

                                return (
                                    <div
                                        key={num}
                                        className={className}
                                        role="listitem"
                                        tabIndex={isUnlocked ? 0 : -1}
                                        aria-disabled={!isUnlocked}
                                        onClick={() => isUnlocked && startLevel(i)}
                                        onKeyDown={(e) => {
                                            if (!isUnlocked) return;
                                            if (e.key === "Enter" || e.key === " ") startLevel(i);
                                        }}
                                    >
                                        {isUnlocked ? (
                                            <>
                                                {num}
                                                <div className={styles.starsDisplay} aria-label={`${stars} stars`}>
                                                    {[1, 2, 3].map((s) => (
                                                        <span
                                                            key={s}
                                                            className={s <= stars ? styles.starFilled : styles.starEmpty}
                                                        >
                                                            ★
                                                        </span>
                                                    ))}
                                                </div>
                                            </>
                                        ) : (
                                            <span aria-label="Locked">🔒</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* GAME SCREEN */}
                <section
                    className={[styles.screen, screen === "map" ? styles.hidden : ""].join(" ")}
                    aria-hidden={screen !== "game"}
                >
                    <header className={styles.gameHeader}>
                        <button className={styles.btnIcon} onClick={goToMap} aria-label="Back to map">
                            ←
                        </button>
                        <div className={styles.levelInfo}>
                            Level <span>{levelIndex + 1}</span>
                            <div className={styles.subInfo}>
                                Time: {formatMs(Math.min(elapsedMs, MAX_LEVEL_MS))} / 5:00
                            </div>
                        </div>
                        <div style={{ width: 40 }} />
                    </header>

                    <div className={styles.gameContent}>
                        <div
                            className={styles.gridContainer}
                            onPointerDown={onPointerDown}
                            onPointerMove={onPointerMove}
                            onPointerUp={onPointerUp}
                            onPointerCancel={onPointerUp}
                            ref={gridRef}
                            role="application"
                            aria-label="Word grid"
                        >
                            <div
                                className={styles.grid}
                                style={{ gridTemplateColumns: `repeat(${currentSize}, 1fr)` }}
                            >
                                {grid.flatMap((row, r) =>
                                    row.map((ch, c) => {
                                        const k = `${r},${c}`;
                                        const isFound = foundCells.has(k);
                                        const isSelecting = selectingKeys.has(k);
                                        const className = [
                                            styles.cell,
                                            isFound ? styles.cellFound : "",
                                            isSelecting ? styles.cellSelecting : "",
                                        ].join(" ");

                                        return (
                                            <div
                                                key={k}
                                                className={className}
                                                data-role="cell"
                                                data-row={r}
                                                data-col={c}
                                            >
                                                {ch}
                                            </div>
                                        );
                                    }),
                                )}
                            </div>
                        </div>

                        <div className={styles.wordBank}>
                            <div style={{ textAlign: "center", fontSize: "0.8rem", color: "#777", marginBottom: 8 }}>
                                Tap words to hear them!
                            </div>
                            <div className={styles.wordList} aria-label="Words to find">
                                {placedWords.map((word) => {
                                    const isFound = foundWords.includes(word);
                                    const className = [styles.wordItem, isFound ? styles.wordFound : ""].join(" ");
                                    return (
                                        <button
                                            type="button"
                                            key={word}
                                            className={className}
                                            onClick={() => speak(word)}
                                            aria-label={`Speak ${word}`}
                                        >
                                            <span>{word}</span>
                                            <svg className={styles.speakIcon} viewBox="0 0 24 24" aria-hidden="true">
                                                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                                            </svg>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                {/* WIN OVERLAY */}
                <div className={[styles.overlay, winActive ? `${styles.overlayActive} animate-stars-pulse` : ""].join(" ")}>
                    <div className={styles.popupTitle}>Great Job!</div>
                    <div className={styles.popupMeta}>Time: {formatMs(elapsedMs)}</div>
                    <div className={styles.popupStars} aria-label="Stars">
                        {[1, 2, 3].map((i) => {
                            const filled = i <= lastWinStars;
                            return (
                                <span key={i} className={`${filled ? styles.filled : undefined} ${winActive ? 'animate-star-bounce' : ''}`}>
                                    ★
                                </span>
                            );
                        })}
                    </div>

                    <button className={styles.btn} onClick={nextLevel}>
                        Next Level
                    </button>
                    <button className={[styles.btn, styles.btnSecondary].join(" ")} onClick={goToMap}>
                        Map
                    </button>
                </div>

                {/* GAME OVER OVERLAY */}
                <div
                    className={[
                        styles.overlay,
                        styles.overlayDanger,
                        gameOverActive ? styles.overlayActive : "",
                    ].join(" ")}
                >
                    <div className={[styles.popupTitle, styles.popupTitleDanger].join(" ")}>Time's Up!</div>
                    <div className={styles.popupMeta}>Max time is 5:00</div>
                    <button className={styles.btn} onClick={retryLevel}>
                        Retry Level
                    </button>
                    <button className={[styles.btn, styles.btnSecondary].join(" ")} onClick={goToMap}>
                        Map
                    </button>
                </div>
            </div>
        </div>
    );
}

