import Link from "next/link";

export function Logo({ large = false }: { large?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 font-extrabold tracking-tight ${large ? "text-5xl sm:text-6xl" : "text-xl"}`}>
      <span className="text-white">CARO</span>
      <span className={`rounded-lg bg-gold text-ink ${large ? "px-3 py-1" : "px-1.5 py-0.5"}`}>VIP</span>
    </span>
  );
}

export function SiteHeader() {
  return (
    <header className="flex items-center justify-between py-4">
      <Link href="/" aria-label="Về trang chủ">
        <Logo />
      </Link>
      <nav className="flex items-center gap-1 text-sm font-medium text-neutral-300">
        <Link href="/" className="rounded-full px-3 py-1.5 hover:bg-white/10 hover:text-white">
          Trang chủ
        </Link>
        <Link href="/history" className="rounded-full px-3 py-1.5 hover:bg-white/10 hover:text-white">
          Lịch sử
        </Link>
      </nav>
    </header>
  );
}
