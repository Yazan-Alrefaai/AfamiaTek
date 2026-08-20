import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

export function SectionHeading({
  eyebrow,
  title,
  lead,
  action,
  align = "start",
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  action?: ReactNode;
  align?: "start" | "center";
}) {
  const centered = align === "center";
  return (
    <div
      className={`flex flex-col gap-6 ${
        centered
          ? "items-center text-center"
          : "md:flex-row md:items-end md:justify-between"
      }`}
    >
      <Reveal className={centered ? "max-w-2xl" : "max-w-2xl"}>
        <p className="eyebrow mb-4 flex items-center gap-3">
          <span
            aria-hidden
            className="inline-block h-px w-8 bg-crimson-2/60 align-middle"
          />
          {eyebrow}
        </p>
        <h2 className="text-display text-4xl text-temple sm:text-5xl lg:text-[3.5rem]">
          {title}
        </h2>
        {lead ? (
          <p className="mt-5 text-base leading-relaxed text-temple-2 sm:text-lg">
            {lead}
          </p>
        ) : null}
      </Reveal>
      {action ? (
        <Reveal delay={120} className="shrink-0">
          {action}
        </Reveal>
      ) : null}
    </div>
  );
}
