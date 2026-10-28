"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookIcon, PracticeIcon, ReviewIcon, StatsIcon } from "./icons";

const NAV = [
  { href: "/", label: "演習", icon: PracticeIcon, match: (p: string) => p === "/" || p.startsWith("/practice") },
  { href: "/review", label: "復習", icon: ReviewIcon, match: (p: string) => p.startsWith("/review") },
  { href: "/stats", label: "成績", icon: StatsIcon, match: (p: string) => p.startsWith("/stats") },
  { href: "/questions", label: "過去問", icon: BookIcon, match: (p: string) => p.startsWith("/questions") },
] as const;

export function SiteNav() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-1">
      {NAV.map(({ href, label, icon: Icon, match }) => {
        const active = match(pathname);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-medium sm:flex-row sm:gap-2 sm:px-4 sm:py-2.5 sm:text-[15px] ${
              active ? "bg-brand-soft text-brand" : "text-muted hover:bg-surface hover:text-foreground"
            }`}
          >
            <Icon size={24} active={active} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
