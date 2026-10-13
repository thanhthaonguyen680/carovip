import { CELLS, SIZE, type Board as BoardState, type Stone } from "@/lib/game";

type Props = {
  board: BoardState;
  lastMove: number | null;
  winLine: number[] | null;
  // Omit to render a read-only board (replays, finished games).
  onPlay?: (index: number) => void;
};

export function StoneMark({ stone, className = "" }: { stone: Stone; className?: string }) {
  return stone === "X" ? (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M6 6l12 12M18 6L6 18"
        fill="none"
        stroke="#2563eb"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="7" fill="none" stroke="#e11d48" strokeWidth="3.2" />
    </svg>
  );
}

const INDEXES = Array.from({ length: CELLS }, (_, index) => index);

export function Board({ board, lastMove, winLine, onPlay }: Props) {
  const winning = new Set(winLine ?? []);

  return (
    <div className="mx-auto w-full max-w-[min(600px,max(320px,calc(100dvh-300px)))] rounded-2xl bg-[#8a6a3b] p-1.5 shadow-[0_18px_50px_-12px_rgba(0,0,0,0.7)] sm:p-2.5">
      <div
        className="grid gap-px overflow-hidden rounded-lg bg-grid"
        style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))` }}
      >
        {INDEXES.map((index) => {
          const stone = board[index];
          const playable = !stone && onPlay !== undefined;
          const tint = winning.has(index)
            ? "bg-gold"
            : index === lastMove
              ? "bg-[#fbe3a1]"
              : "bg-paper";
          return (
            <button
              key={index}
              type="button"
              disabled={!playable}
              onClick={playable ? () => onPlay(index) : undefined}
              aria-label={`Hàng ${Math.floor(index / SIZE) + 1}, cột ${(index % SIZE) + 1}${stone ? `: ${stone}` : ""}`}
              className={`flex aspect-square items-center justify-center ${tint} ${
                playable ? "cursor-pointer hover:bg-[#fff6dd] active:bg-[#fbe3a1]" : "cursor-default"
              }`}
            >
              {stone && <StoneMark stone={stone} className="stone-pop h-[86%] w-[86%]" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
