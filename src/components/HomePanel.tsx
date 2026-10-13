"use client";

import Link from "next/link";
import { setPlayerName, useHistory, usePlayerName } from "@/lib/storage";

export function HomePanel() {
  const name = usePlayerName();
  const history = useHistory();

  const vsComputer = history.filter((game) => game.mode === "ai");
  const wins = vsComputer.filter((game) => game.winner === game.humanStone).length;
  const draws = vsComputer.filter((game) => game.winner === "draw").length;
  const stats = [
    { label: "Ván đã chơi", value: history.length },
    { label: "Thắng máy", value: wins },
    { label: "Thua máy", value: vsComputer.length - wins - draws },
    { label: "Hoà", value: history.filter((game) => game.winner === "draw").length },
  ];

  return (
    <section className="rounded-3xl border border-line bg-panel/80 p-5">
      <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400" htmlFor="player-name">
        Tên của bạn
      </label>
      <input
        id="player-name"
        value={name}
        maxLength={16}
        onChange={(event) => setPlayerName(event.target.value)}
        placeholder="Nhập tên hiển thị"
        className="mt-2 w-full rounded-xl border border-line bg-ink px-4 py-2.5 text-base font-semibold text-white outline-none placeholder:font-normal placeholder:text-neutral-500 focus:border-gold"
      />

      <dl className="mt-4 grid grid-cols-4 gap-2 text-center">
        {stats.map((item) => (
          <div key={item.label} className="rounded-xl bg-ink px-1 py-3">
            <dd className="text-2xl font-extrabold text-gold">{item.value}</dd>
            <dt className="mt-0.5 text-[11px] leading-tight text-neutral-400">{item.label}</dt>
          </div>
        ))}
      </dl>

      <Link
        href="/history"
        className="mt-4 block rounded-xl border border-line px-4 py-2.5 text-center text-sm font-semibold text-neutral-200 hover:border-gold/60 hover:text-white"
      >
        Xem lịch sử &amp; xem lại ván đấu →
      </Link>
    </section>
  );
}
