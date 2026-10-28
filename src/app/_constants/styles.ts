export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export const buttonBaseClass =
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg font-medium disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

export const buttonVariantClass: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/85",
  secondary: "border border-line bg-card text-foreground shadow-card hover:bg-surface",
  ghost: "text-muted hover:bg-surface hover:text-foreground",
  danger: "border border-line bg-card text-ng hover:bg-ng-soft",
};

export const buttonSizeClass: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-9 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
};

export const cardClass = "rounded-xl border border-line bg-card shadow-card";
