import type { ReactNode, SVGProps } from "react";
import type { SubjectId } from "@/domain/shared/subject.types";

type IconProps = Omit<SVGProps<SVGSVGElement>, "children"> & { size?: number };

function Svg({ size = 20, children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

const tone = { fill: "currentColor", fillOpacity: 0.14, stroke: "none" } as const;

const KIRI_FLOWERS = "M29.62 6.52a2.38 2.38 0 0 1 4.75 0v1.78l-1.19 1.45l-1.19 -0.97l-1.19 0.97l-1.19 -1.45zM26.23 12.02a2.38 2.38 0 0 1 4.75 0v1.78l-1.19 1.45l-1.19 -0.97l-1.19 0.97l-1.19 -1.45zM33.02 12.02a2.38 2.38 0 0 1 4.75 0v1.78l-1.19 1.45l-1.19 -0.97l-1.19 0.97l-1.19 -1.45zM26.23 17.52a2.38 2.38 0 0 1 4.75 0v1.78l-1.19 1.45l-1.19 -0.97l-1.19 0.97l-1.19 -1.45zM33.02 17.52a2.38 2.38 0 0 1 4.75 0v1.78l-1.19 1.45l-1.19 -0.97l-1.19 0.97l-1.19 -1.45zM26.23 23.02a2.38 2.38 0 0 1 4.75 0v1.78l-1.19 1.45l-1.19 -0.97l-1.19 0.97l-1.19 -1.45zM33.02 23.02a2.38 2.38 0 0 1 4.75 0v1.78l-1.19 1.45l-1.19 -0.97l-1.19 0.97l-1.19 -1.45zM14.55 11.54a2.25 2.25 0 0 1 4.50 0v1.68l-1.12 1.38l-1.12 -0.92l-1.12 0.92l-1.12 -1.38zM11.45 16.84a2.25 2.25 0 0 1 4.50 0v1.68l-1.12 1.38l-1.12 -0.92l-1.12 0.92l-1.12 -1.38zM17.65 16.84a2.25 2.25 0 0 1 4.50 0v1.68l-1.12 1.38l-1.12 -0.92l-1.12 0.92l-1.12 -1.38zM11.45 22.14a2.25 2.25 0 0 1 4.50 0v1.68l-1.12 1.38l-1.12 -0.92l-1.12 0.92l-1.12 -1.38zM17.65 22.14a2.25 2.25 0 0 1 4.50 0v1.68l-1.12 1.38l-1.12 -0.92l-1.12 0.92l-1.12 -1.38zM44.95 11.54a2.25 2.25 0 0 1 4.50 0v1.68l-1.12 1.38l-1.12 -0.92l-1.12 0.92l-1.12 -1.38zM41.85 16.84a2.25 2.25 0 0 1 4.50 0v1.68l-1.12 1.38l-1.12 -0.92l-1.12 0.92l-1.12 -1.38zM48.05 16.84a2.25 2.25 0 0 1 4.50 0v1.68l-1.12 1.38l-1.12 -0.92l-1.12 0.92l-1.12 -1.38zM41.85 22.14a2.25 2.25 0 0 1 4.50 0v1.68l-1.12 1.38l-1.12 -0.92l-1.12 0.92l-1.12 -1.38zM48.05 22.14a2.25 2.25 0 0 1 4.50 0v1.68l-1.12 1.38l-1.12 -0.92l-1.12 0.92l-1.12 -1.38z";
const KIRI_LEAF = "M32 36C29 32.6 20.5 33 20.5 41.2 20.5 47.6 26.6 52.6 32 58 37.4 52.6 43.5 47.6 43.5 41.2 43.5 33 35 32.6 32 36Z";
const KIRI_VEINS = "M32 38.5V54.5M32 44.5l-4.6-3.6M32 44.5l4.6-3.6M32 50l-3.6-3M32 50l3.6-3";
const KIRI_COLORS = { ground: "#1e3a8a", stem: "#f0c75a", flower: "#f6d36b", leaf: "#e2b13c" };
const KIRI_LEAVES = [
  { transform: "translate(-1.5 2) rotate(72 32 36) translate(32 36) scale(0.86) translate(-32 -36)", outline: 1.6 },
  { transform: "translate(1.5 2) rotate(-72 32 36) translate(32 36) scale(0.86) translate(-32 -36)", outline: 1.6 },
  { transform: "translate(32 36) scale(0.84) translate(-32 -36)", outline: 2 },
];

export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden focusable="false">
      <rect width="64" height="64" rx="15" fill={KIRI_COLORS.ground} />
      <g fill="none" stroke={KIRI_COLORS.stem} strokeWidth={1.6} strokeLinecap="round">
        <path d="M32 34V9.5M30.5 34C24.5 30 18 24 16.8 13.5M33.5 34C39.5 30 46 24 47.2 13.5" />
      </g>
      <path d={KIRI_FLOWERS} fill={KIRI_COLORS.flower} />
      {KIRI_LEAVES.map((leaf) => (
        <g key={leaf.transform} transform={leaf.transform}>
          <path d={KIRI_LEAF} fill={KIRI_COLORS.leaf} stroke={KIRI_COLORS.ground} strokeWidth={leaf.outline} />
          <path d={KIRI_VEINS} fill="none" stroke={KIRI_COLORS.ground} strokeWidth={1.5} strokeLinecap="round" />
        </g>
      ))}
    </svg>
  );
}

type GlyphProps = IconProps & { active?: boolean };

function Glyph({ body, detail, active = false, size = 20, ...props }: GlyphProps & { body: ReactNode; detail: ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden focusable="false" {...props}>
      <g stroke="currentColor" strokeWidth={1.75} fill="currentColor" fillOpacity={active ? 1 : 0.13}>
        {body}
      </g>
      <g strokeWidth={active ? 2 : 1.75} className={active ? "stroke-card" : "stroke-current"}>
        {detail}
      </g>
    </svg>
  );
}

export function PracticeIcon(props: GlyphProps) {
  return (
    <Glyph
      {...props}
      body={<rect x="4" y="2.5" width="16" height="19" rx="3.2" />}
      detail={
        <>
          <circle cx="9.3" cy="9.2" r="2.3" />
          <path d="M13.7 7l3.1 4.4M16.8 7l-3.1 4.4M8 15.4h8M8 18.2h4.5" />
        </>
      }
    />
  );
}

export function ReviewIcon(props: GlyphProps) {
  return (
    <Glyph
      {...props}
      body={<circle cx="12" cy="12" r="9.25" />}
      detail={<path d="M16.5 12a4.5 4.5 0 1 1-1.3-3.2M16.6 6.2v3h-3" />}
    />
  );
}

export function StatsIcon(props: GlyphProps) {
  return (
    <Glyph
      {...props}
      body={<rect x="3" y="3" width="18" height="18" rx="4.5" />}
      detail={<path d="M8 16.5v-3M12 16.5v-6.5M16 16.5V7.5" />}
    />
  );
}

export function BookIcon(props: GlyphProps) {
  return (
    <Glyph
      {...props}
      body={<path d="M6.2 2.8H19.5v18.4H6.2a1.7 1.7 0 0 1-1.7-1.7v-15a1.7 1.7 0 0 1 1.7-1.7z" />}
      detail={<path d="M8.8 2.8v18.4M12 7.5h4.5M12 11h3" />}
    />
  );
}

export function BookmarkIcon({ filled = false, ...props }: IconProps & { filled?: boolean }) {
  return (
    <Svg {...props}>
      <path d="M7 3.5h10a1 1 0 0 1 1 1v16l-6-3.8-6 3.8v-16a1 1 0 0 1 1-1z" fill={filled ? "currentColor" : "none"} />
    </Svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 12h14M13.5 6.5L19 12l-5.5 5.5" />
    </Svg>
  );
}

export function ChevronIcon({ direction = "down", ...props }: IconProps & { direction?: "down" | "left" | "right" }) {
  const d = { down: "M6 9.5l6 6 6-6", left: "M14.5 6l-6 6 6 6", right: "M9.5 6l6 6-6 6" }[direction];
  return (
    <Svg {...props}>
      <path d={d} />
    </Svg>
  );
}

export function FlameIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 21c-1.7 0-3-1.3-3-3 0-1.9 1.4-2.9 3-4.8 1.6 1.9 3 2.9 3 4.8 0 1.7-1.3 3-3 3z" {...tone} />
      <path d="M12 21c3.3 0 6-2.6 6-6 0-3.9-2.9-6-4-9.5-.9 2.1-1.9 3.2-3 3.7C11 7 10.2 5 8.7 3.5 8.9 7.4 6 9.7 6 15c0 3.4 2.7 6 6 6z" />
    </Svg>
  );
}

export function TargetIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="5" {...tone} />
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
      <rect x="7.5" y="13" width="3.2" height="3.2" rx="0.8" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function CheckCircleIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" {...tone} />
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.3l2.7 2.7L16 9.6" />
    </Svg>
  );
}

export function CrossCircleIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" {...tone} />
      <circle cx="12" cy="12" r="9" />
      <path d="M9.2 9.2l5.6 5.6M14.8 9.2l-5.6 5.6" />
    </Svg>
  );
}

export function DownloadIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 4v10.5M7.5 10l4.5 4.5 4.5-4.5M5 19.5h14" />
    </Svg>
  );
}

export function UploadIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 15V4.5M7.5 9L12 4.5 16.5 9M5 19.5h14" />
    </Svg>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13M10 11v5.5M14 11v5.5" />
    </Svg>
  );
}

export function EyeIcon({ off = false, ...props }: IconProps & { off?: boolean }) {
  return (
    <Svg {...props}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="3" />
      {off && <path d="M4 4l16 16" />}
    </Svg>
  );
}

export function ExternalIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M14 4h6v6M20 4l-8.5 8.5M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </Svg>
  );
}

export function SlidersIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
      <circle cx="15" cy="7" r="2" />
      <circle cx="9" cy="17" r="2" />
    </Svg>
  );
}

export function ShuffleIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 7h2.5c4.5 0 6.5 10 11 10H20M17.5 14.5L20 17l-2.5 2.5M4 17h2.5c1.6 0 2.8-1.3 3.8-3M13.7 10c1-1.7 2.2-3 3.8-3H20M17.5 4.5L20 7l-2.5 2.5" />
    </Svg>
  );
}

export function PlayIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 5.8v12.4a.8.8 0 0 0 1.2.7l9.6-6.2a.8.8 0 0 0 0-1.4L9.2 5.1A.8.8 0 0 0 8 5.8z" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function InboxIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3.5 13.5H8l1.5 2.5h5l1.5-2.5h4.5" {...tone} />
      <path d="M3.5 13.5l2.5-8h12l2.5 8v5a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5z" />
      <path d="M3.5 13.5H8l1.5 2.5h5l1.5-2.5h4.5" />
    </Svg>
  );
}

function KenpoIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3.5 9L12 4l8.5 5z" {...tone} />
      <path d="M3.5 9L12 4l8.5 5H3.5zM6 11.5v6M10 11.5v6M14 11.5v6M18 11.5v6M3.5 20.5h17" />
    </Svg>
  );
}

function MinpoIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="16.5" cy="9" r="2.5" {...tone} />
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19.5a5.5 5.5 0 0 1 11 0" />
      <circle cx="16.5" cy="9" r="2.5" />
      <path d="M15.6 14.2a4.5 4.5 0 0 1 4.9 5.3" />
    </Svg>
  );
}

function KeihoIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M13.2 3.8l7 7-2.9 2.9-7-7z" {...tone} />
      <path d="M13.2 3.8l7 7-2.9 2.9-7-7zM11.8 8.6l-7.3 7.3a1.5 1.5 0 0 0 2.1 2.1l7.3-7.3M13 20.5h7.5" />
    </Svg>
  );
}

function ShohoIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="15" y="9.5" width="4.5" height="11" {...tone} />
      <path d="M5 20.5V5a1.5 1.5 0 0 1 1.5-1.5h7A1.5 1.5 0 0 1 15 5v15.5M15 9.5h3a1.5 1.5 0 0 1 1.5 1.5v9.5M3 20.5h18M8.5 8h3M8.5 11.5h3M8.5 15h3" />
    </Svg>
  );
}

function MinsoIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M2.5 13h6a3 3 0 0 1-6 0zM15.5 13h6a3 3 0 0 1-6 0z" {...tone} />
      <path d="M12 4v16M8.5 20h7M5.5 7h13M5.5 7l-3 6M5.5 7l3 6M18.5 7l-3 6M18.5 7l3 6M2.5 13h6a3 3 0 0 1-6 0zM15.5 13h6a3 3 0 0 1-6 0z" />
    </Svg>
  );
}

function HozenIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3.5l7 2.8v5.2c0 4.4-2.9 7.8-7 9.5-4.1-1.7-7-5.1-7-9.5V6.3z" {...tone} />
      <path d="M12 3.5l7 2.8v5.2c0 4.4-2.9 7.8-7 9.5-4.1-1.7-7-5.1-7-9.5V6.3zM9 12l2 2 4-4" />
    </Svg>
  );
}

function ShikkoIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 14a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2.5H5z" {...tone} />
      <path d="M9.5 3.5h5v2.8a2.5 2.5 0 0 1-1 2V12H17a2 2 0 0 1 2 2v2.5H5V14a2 2 0 0 1 2-2h3.5V8.3a2.5 2.5 0 0 1-1-2zM5 20.5h14" />
    </Svg>
  );
}

function ShoshiIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" {...tone} />
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8.5" cy="10.5" r="2" />
      <path d="M5.5 15.5c.5-1.3 1.7-2 3-2s2.5.7 3 2M14 10h4M14 13.5h3" />
    </Svg>
  );
}

function KyotakuIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="11.5" r="3.5" {...tone} />
      <rect x="3.5" y="4" width="17" height="15" rx="2" />
      <circle cx="12" cy="11.5" r="3.5" />
      <path d="M12 6.5V8M12 15v1.5M7 11.5h1.5M15.5 11.5H17M6.5 19v1.5M17.5 19v1.5" />
    </Svg>
  );
}

function FudosanIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M10 20.5v-5h4v5z" {...tone} />
      <path d="M5 10v10.5h14V10M3 11.5L12 4l9 7.5M10 20.5v-5h4v5" />
    </Svg>
  );
}

function ShogyoIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4.5 4h15L21 9H3z" {...tone} />
      <path d="M4.5 4h15L21 9H3zM3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0M5 11.5v9h14v-9M10 20.5v-5h4v5" />
    </Svg>
  );
}

const SUBJECT_ICONS: Record<SubjectId, (props: IconProps) => ReactNode> = {
  kenpo: KenpoIcon,
  minpo: MinpoIcon,
  keiho: KeihoIcon,
  shoho: ShohoIcon,
  minso: MinsoIcon,
  hozen: HozenIcon,
  shikko: ShikkoIcon,
  shoshi: ShoshiIcon,
  kyotaku: KyotakuIcon,
  fudosan: FudosanIcon,
  shogyo: ShogyoIcon,
};

export function SubjectIcon({ subject, ...props }: IconProps & { subject: SubjectId }) {
  const Icon = SUBJECT_ICONS[subject];
  return <Icon {...props} />;
}
