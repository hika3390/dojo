import type { Metadata } from "next";
import { Geist, Noto_Sans_JP } from "next/font/google";
import Link from "next/link";
import { LogoMark } from "@/app/_components/icons";
import { SiteNav } from "@/app/_components/site-nav";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const notoSansJp = Noto_Sans_JP({ variable: "--font-noto-sans-jp", subsets: ["latin"], preload: false });

export const metadata: Metadata = {
  title: {
    default: "司法書士道場",
    template: "%s | 司法書士道場",
  },
  description: "司法書士試験の択一式過去問を1肢ずつ○×で解ける学習サイト。年度・科目別のランダム出題、正答率の記録、間違えた肢の復習ができます。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className={`${geist.variable} ${notoSansJp.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <header className="sticky top-0 z-20 border-b border-line bg-card">
          <div className="mx-auto flex h-[68px] max-w-5xl items-center justify-between gap-3 px-4 sm:h-[76px]">
            <Link href="/" className="flex items-center gap-3 text-lg font-bold tracking-tight sm:text-xl">
              <LogoMark size={36} />
              <span className="hidden min-[420px]:inline">司法書士道場</span>
            </Link>
            <SiteNav />
          </div>
        </header>
        <main className="flex-1 pb-16">{children}</main>
      </body>
    </html>
  );
}
