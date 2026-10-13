"use client";

import Link from "next/link";
import { useState } from "react";
import { Board } from "@/components/Board";
import { boardFromMoves, findWin } from "@/lib/game";
import { clearHistory, useHistory, type GameRecord } from "@/lib/storage";

const LEVEL_LABEL = { easy: "Dễ", medium: "Vừa", hard: "Khó" };

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function formatTime(timestamp: number) {
  const date = new Date(timestamp);
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)} · ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function describe(game: GameRecord) {
  if (game.mode === "local") {
    return {
      title: "Hai người một máy",
      result: game.winner === "draw" ? "Hoà" : `${game.winner} thắng`,
      tone: "text-neutral-200 border-line",
    };
  }
  const title = `Đấu với máy · ${LEVEL_LABEL[game.level ?? "medium"]}`;
  if (game.winner === "draw") return { title, result: "Hoà", tone: "text-neutral-200 border-line" };
  return game.winner === game.humanStone
    ? { title, result: "Thắng", tone: "text-emerald-300 border-emerald-400/50" }
    : { title, result: "Thua", tone: "text-rose-300 border-rose-400/50" };
}

function Replay({ game, onClose }: { game: GameRecord; onClose: () => void }) {
  const [step, setStep] = useState(game.moves.length);
  const shown = game.moves.slice(0, step);
  const board = boardFromMoves(shown);
  const last = shown.length ? shown[shown.length - 1] : null;
  const info = describe(game);

  const controls = [
    { label: "⏮", name: "Về đầu", to: 0 },
    { label: "◀", name: "Lùi một nước", to: Math.max(0, step - 1) },
    { label: "▶", name: "Tới một nước", to: Math.min(game.moves.length, step + 1) },
    { label: "⏭", name: "Tới cuối", to: game.moves.length },
  ];

  return (
    <div className="flex flex-col gap-4 pb-10">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-white">{info.title}</p>
          <p className="text-sm text-neutral-400">
            {info.result} · {formatTime(game.endedAt)}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-full border border-line bg-panel px-4 py-2 text-sm font-medium text-neutral-200 hover:border-gold/60 hover:text-white"
        >
          ← Danh sách
        </button>
      </div>

      <Board board={board} lastMove={last} winLine={last === null ? null : findWin(board, last)} />

      <div className="flex items-center gap-3">
        <div className="flex gap-1.5">
          {controls.map((control) => (
            <button
              key={control.name}
              type="button"
              aria-label={control.name}
              disabled={control.to === step}
              onClick={() => setStep(control.to)}
              className="h-10 w-10 rounded-full border border-line bg-panel text-neutral-200 hover:border-gold/60 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {control.label}
            </button>
          ))}
        </div>
        <input
          type="range"
          min={0}
          max={game.moves.length}
          value={step}
          onChange={(event) => setStep(Number(event.target.value))}
          aria-label="Nước đi"
          className="min-w-0 flex-1 accent-[#f5c451]"
        />
        <span className="shrink-0 text-sm tabular-nums text-neutral-400">
          {step}/{game.moves.length}
        </span>
      </div>
    </div>
  );
}

export function HistoryView() {
  const history = useHistory();
  const [openId, setOpenId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const open = history.find((game) => game.id === openId);

  if (open) return <Replay key={open.id} game={open} onClose={() => setOpenId(null)} />;

  if (history.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-line p-8 text-center">
        <p className="text-neutral-300">Chưa có ván nào được lưu.</p>
        <Link
          href="/play/ai"
          className="mt-4 inline-block rounded-full bg-gold px-5 py-2 text-sm font-bold text-ink hover:brightness-110"
        >
          Chơi ván đầu tiên
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 pb-10">
      <ul className="flex flex-col gap-2">
        {history.map((game) => {
          const info = describe(game);
          return (
            <li key={game.id}>
              <button
                type="button"
                onClick={() => setOpenId(game.id)}
                className="flex w-full items-center gap-3 rounded-2xl border border-line bg-panel px-4 py-3 text-left hover:border-gold/60"
              >
                <span className={`w-20 shrink-0 rounded-full border px-2 py-1 text-center text-xs font-bold ${info.tone}`}>
                  {info.result}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-white">{info.title}</span>
                  <span className="block text-xs text-neutral-400">
                    {game.moves.length} nước · {formatTime(game.endedAt)}
                  </span>
                </span>
                <span className="shrink-0 text-sm text-gold">Xem lại →</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="flex items-center justify-between gap-3 text-xs text-neutral-500">
        <span>Lịch sử được lưu trên trình duyệt này.</span>
        {confirming ? (
          <span className="flex shrink-0 items-center gap-2">
            Xoá hết?
            <button
              type="button"
              onClick={() => {
                clearHistory();
                setConfirming(false);
              }}
              className="rounded-full border border-rose-400/60 px-3 py-1 font-semibold text-rose-300 hover:bg-rose-400/10"
            >
              Xoá
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="rounded-full border border-line px-3 py-1 font-semibold text-neutral-300 hover:text-white"
            >
              Huỷ
            </button>
          </span>
        ) : (
          <button type="button" onClick={() => setConfirming(true)} className="shrink-0 underline hover:text-neutral-300">
            Xoá lịch sử
          </button>
        )}
      </div>
    </div>
  );
}
