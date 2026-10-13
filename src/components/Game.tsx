"use client";

import { useEffect, useMemo, useState } from "react";
import { Board, StoneMark } from "@/components/Board";
import { chooseMove, type Level } from "@/lib/ai";
import { CELLS, boardFromMoves, findWin, other, stoneForMove, type Stone } from "@/lib/game";
import { DEFAULT_NAME, saveGame, usePlayerName, type GameMode } from "@/lib/storage";

const LEVELS: { id: Level; label: string }[] = [
  { id: "easy", label: "Dễ" },
  { id: "medium", label: "Vừa" },
  { id: "hard", label: "Khó" },
];

const AI_DELAY_MS = 450;

function resultOf(moves: number[]) {
  if (moves.length === 0) return { winner: null, line: null };
  const board = boardFromMoves(moves);
  const last = moves[moves.length - 1];
  const line = findWin(board, last);
  if (line) return { winner: board[last] as Stone, line };
  return { winner: moves.length === CELLS ? ("draw" as const) : null, line: null };
}

function PlayerCard({
  stone,
  name,
  note,
  active,
  won,
}: {
  stone: Stone;
  name: string;
  note: string;
  active: boolean;
  won: boolean;
}) {
  return (
    <div
      className={`flex min-w-0 flex-1 items-center gap-3 rounded-2xl border px-3 py-2.5 transition-colors ${
        won
          ? "border-gold bg-gold/15"
          : active
            ? "border-gold/70 bg-panel"
            : "border-line bg-panel/60 opacity-70"
      }`}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-paper">
        <StoneMark stone={stone} className="h-7 w-7" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-white">{name}</span>
        <span className={`block truncate text-xs ${active || won ? "text-gold" : "text-neutral-400"}`}>
          {note}
        </span>
      </span>
    </div>
  );
}

export function Game({ mode }: { mode: GameMode }) {
  const [level, setLevel] = useState<Level>("medium");
  const [humanStone, setHumanStone] = useState<Stone>("X");
  const [moves, setMoves] = useState<number[]>([]);
  const storedName = usePlayerName();
  const playerName = storedName.trim() || DEFAULT_NAME;

  const board = useMemo(() => boardFromMoves(moves), [moves]);
  const { winner, line } = useMemo(() => resultOf(moves), [moves]);
  const turn = stoneForMove(moves.length);
  const aiTurn = mode === "ai" && !winner && turn !== humanStone;

  useEffect(() => {
    if (!aiTurn) return;
    const timer = setTimeout(() => {
      const next = [...moves, chooseMove(board, other(humanStone), level)];
      setMoves(next);
      const ended = resultOf(next).winner;
      if (ended) saveGame({ mode: "ai", level, humanStone, moves: next, winner: ended });
    }, AI_DELAY_MS);
    return () => clearTimeout(timer);
  }, [aiTurn, board, moves, humanStone, level]);

  function handlePlay(index: number) {
    if (winner || aiTurn || board[index]) return;
    const next = [...moves, index];
    setMoves(next);
    const ended = resultOf(next).winner;
    if (!ended) return;
    saveGame(
      mode === "ai"
        ? { mode, level, humanStone, moves: next, winner: ended }
        : { mode, moves: next, winner: ended },
    );
  }

  // Against the computer one "undo" takes back its reply too, so it is the player's turn again.
  const undoCount = mode === "ai" ? 2 : 1;
  const canUndo = !winner && !aiTurn && moves.length >= undoCount;

  function nameOf(stone: Stone) {
    if (mode === "local") return stone === "X" ? "Người chơi 1" : "Người chơi 2";
    return stone === humanStone ? playerName : "Máy";
  }

  function noteOf(stone: Stone) {
    if (winner === stone) return "Chiến thắng 🏆";
    if (winner) return winner === "draw" ? "Hoà" : "Thua";
    if (turn !== stone) return "Đang chờ";
    return mode === "ai" && stone !== humanStone ? "Đang nghĩ…" : "Đến lượt";
  }

  let banner: string | null = null;
  if (winner === "draw") banner = "Hoà! Bàn cờ đã kín.";
  else if (winner && mode === "local") banner = `${nameOf(winner)} thắng!`;
  else if (winner) banner = winner === humanStone ? "Bạn thắng! 🎉" : "Máy thắng. Thử lại nhé!";

  return (
    <div className="flex flex-col gap-4 pb-10">
      {mode === "ai" && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex rounded-full border border-line bg-panel p-1 text-sm">
            {LEVELS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setLevel(item.id);
                  setMoves([]);
                }}
                className={`rounded-full px-4 py-1.5 font-semibold transition-colors ${
                  level === item.id ? "bg-gold text-ink" : "text-neutral-300 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              setHumanStone(other(humanStone));
              setMoves([]);
            }}
            className="rounded-full border border-line bg-panel px-4 py-2 text-sm font-medium text-neutral-200 hover:border-gold/60 hover:text-white"
          >
            Bạn cầm {humanStone} · {humanStone === "X" ? "đi trước" : "đi sau"} ⇄
          </button>
        </div>
      )}

      <div className="flex items-stretch gap-3">
        <PlayerCard stone="X" name={nameOf("X")} note={noteOf("X")} active={!winner && turn === "X"} won={winner === "X"} />
        <PlayerCard stone="O" name={nameOf("O")} note={noteOf("O")} active={!winner && turn === "O"} won={winner === "O"} />
      </div>

      {banner && (
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold bg-gold/15 px-4 py-3"
        >
          <span className="text-base font-bold text-gold">{banner}</span>
          <button
            type="button"
            onClick={() => setMoves([])}
            className="rounded-full bg-gold px-5 py-2 text-sm font-bold text-ink hover:brightness-110 active:brightness-95"
          >
            Chơi ván mới
          </button>
        </div>
      )}

      <Board
        board={board}
        lastMove={moves.length ? moves[moves.length - 1] : null}
        winLine={line}
        onPlay={winner || aiTurn ? undefined : handlePlay}
      />

      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-neutral-400">Nước thứ {moves.length}</span>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            disabled={!canUndo}
            onClick={() => setMoves(moves.slice(0, -undoCount))}
            className="rounded-full border border-line bg-panel px-4 py-2 font-medium text-neutral-200 hover:border-gold/60 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            ↩ Đi lại
          </button>
          <button
            type="button"
            disabled={moves.length === 0}
            onClick={() => setMoves([])}
            className="rounded-full border border-line bg-panel px-4 py-2 font-medium text-neutral-200 hover:border-gold/60 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Ván mới
          </button>
        </div>
      </div>
    </div>
  );
}
