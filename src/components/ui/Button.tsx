import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "crimson" | "outline" | "ghost";
type Size = "md" | "lg";

const base =
  "group relative inline-flex items-center justify-center gap-2.5 font-medium " +
  "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus-crimson " +
  "disabled:pointer-events-none disabled:opacity-40 whitespace-nowrap";

const variants: Record<Variant, string> = {
  crimson:
    "bg-crimson-ink text-temple hover:bg-crimson hover:-translate-y-0.5 " +
    "shadow-[0_0_0_0_rgba(237,24,71,0.5)] hover:shadow-[0_10px_36px_-8px_rgba(237,24,71,0.6)]",
  outline:
    "border border-temple/20 text-temple hover:border-crimson-2/70 hover:text-crimson-3 " +
    "hover:-translate-y-0.5 hover:bg-crimson/8",
  ghost: "text-temple-2 hover:text-crimson-3",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-sm rounded-full",
  lg: "h-14 px-8 text-[0.95rem] rounded-full",
};

type Props = {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
};

export function ButtonLink({
  variant = "crimson",
  size = "md",
  className = "",
  children,
  ...rest
}: Props & ComponentProps<typeof Link>) {
  return (
    <Link
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {children}
    </Link>
  );
}

export function ButtonAnchor({
  variant = "crimson",
  size = "md",
  className = "",
  children,
  ...rest
}: Props & ComponentProps<"a">) {
  return (
    <a
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {children}
    </a>
  );
}

export function Button({
  variant = "crimson",
  size = "md",
  className = "",
  children,
  ...rest
}: Props & ComponentProps<"button">) {
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
