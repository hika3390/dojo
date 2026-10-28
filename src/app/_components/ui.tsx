import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import {
  buttonBaseClass,
  buttonSizeClass,
  buttonVariantClass,
  cardClass,
  type ButtonSize as Size,
  type ButtonVariant as Variant,
} from "@/app/_constants/styles";

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra = ""): string {
  return `${buttonBaseClass} ${buttonVariantClass[variant]} ${buttonSizeClass[size]} ${extra}`;
}

type ButtonStyle = { variant?: Variant; size?: Size };

export function Button({ variant, size, className = "", type = "button", ...props }: ComponentProps<"button"> & ButtonStyle) {
  return <button type={type} className={buttonClass(variant, size, className)} {...props} />;
}

export function ButtonLink({ variant, size, className = "", ...props }: ComponentProps<typeof Link> & ButtonStyle) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}

export function Card({ className = "", ...props }: ComponentProps<"div">) {
  return <div className={`${cardClass} ${className}`} {...props} />;
}

export function Container({ className = "", ...props }: ComponentProps<"div">) {
  return <div className={`mx-auto w-full max-w-5xl px-4 ${className}`} {...props} />;
}

export function IconBox({ children, size = "md" }: { children: ReactNode; size?: "sm" | "md" }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-lg border border-line bg-card text-brand shadow-card ${
        size === "sm" ? "size-8" : "size-11"
      }`}
    >
      {children}
    </span>
  );
}

export function PageBand({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className="border-b border-line bg-card">
      <Container className={`py-7 sm:py-9 ${className}`}>{children}</Container>
    </div>
  );
}

export function PageTitle({ icon, title, children }: { icon?: ReactNode; title: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        {icon && <IconBox>{icon}</IconBox>}
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      </div>
      {children}
    </div>
  );
}

export function SectionHeading({ icon, title, action }: { icon?: ReactNode; title: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
        {icon && <span className="text-brand">{icon}</span>}
        {title}
      </h2>
      {action}
    </div>
  );
}

export function Meter({ value, label }: { value: number; label: string }) {
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value)}
      className="h-1.5 overflow-hidden rounded-full bg-line"
    >
      <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}
