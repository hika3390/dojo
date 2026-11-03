"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BookIcon, MenuIcon, PracticeIcon, ReviewIcon, StatsIcon } from "./icons";

const NAV = [
  { href: "/", label: "演習", icon: PracticeIcon, match: (p: string) => p === "/" || p.startsWith("/practice") },
  { href: "/review", label: "復習", icon: ReviewIcon, match: (p: string) => p.startsWith("/review") },
  { href: "/stats", label: "成績", icon: StatsIcon, match: (p: string) => p.startsWith("/stats") },
  { href: "/questions", label: "過去問", icon: BookIcon, match: (p: string) => p.startsWith("/questions") },
] as const;

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return NAV.map(({ href, label, icon: Icon, match }) => {
    const active = match(pathname);
    return (
      <Link
        key={href}
        href={href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-[15px] font-medium ${
          active ? "bg-brand-soft text-brand" : "text-muted hover:bg-surface hover:text-foreground"
        }`}
      >
        <Icon size={24} active={active} />
        {label}
      </Link>
    );
  });
}

export function SiteNav() {
  const pathname = usePathname();
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const open = openedOn === pathname;

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenedOn(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <nav aria-label="メインメニュー" className="hidden items-center gap-1 sm:flex">
        <NavLinks pathname={pathname} />
      </nav>
      <button
        type="button"
        aria-label={open ? "メニューを閉じる" : "メニューを開く"}
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpenedOn(open ? null : pathname)}
        className="flex size-11 items-center justify-center rounded-xl text-foreground hover:bg-surface sm:hidden"
      >
        <MenuIcon size={26} open={open} />
      </button>
      {open && (
        <>
          <div aria-hidden className="fixed inset-0 -z-10 sm:hidden" onClick={() => setOpenedOn(null)} />
          <nav id="mobile-nav" aria-label="メインメニュー" className="absolute inset-x-0 top-full grid gap-1 border-b border-line bg-card px-4 py-3 shadow-card sm:hidden">
            <NavLinks pathname={pathname} onNavigate={() => setOpenedOn(null)} />
          </nav>
        </>
      )}
    </>
  );
}
