"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** ms */
  delay?: number;
  className?: string;
  as?: ElementType;
};

/** 0.9s transition + the largest delay we hand out, with room to spare. */
const SETTLE_MS = 1600;

/**
 * Scroll reveal without a JS animation library — IntersectionObserver flips a
 * class and CSS does the rest, so it costs nothing on slow phones.
 *
 * The reveal starts at `opacity: 0`, which makes the transition load-bearing:
 * anywhere the document timeline is stalled — an offscreen or throttled
 * renderer, a screenshot service, a compositor that never gets a frame — the
 * transition stays pinned at its first keyframe and the content never appears.
 * So every element gets a watchdog that finishes its own animations by hand
 * once they should already be over. On a normal browser this fires long after
 * the reveal has played and changes nothing.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: RevealProps) {
  // `as` is polymorphic at runtime; narrowing to "div" keeps the ref and props
  // typed without a generic that TS can't resolve for an arbitrary ElementType.
  const Component = Tag as "div";
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let watchdog: number | undefined;

    /** Jump to the end state if the transition has not got there on its own. */
    const settle = () => {
      if (typeof node.getAnimations !== "function") return;
      for (const animation of node.getAnimations()) {
        try {
          animation.finish();
        } catch {
          // a fill-less animation can throw here; the class already holds the
          // final state, so there is nothing left to do
        }
      }
    };

    const show = () => {
      node.classList.add("is-visible");
      watchdog = window.setTimeout(settle, SETTLE_MS);
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      show();
      return () => window.clearTimeout(watchdog);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            observer.unobserve(entry.target);
            show();
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      window.clearTimeout(watchdog);
    };
  }, []);

  return (
    <Component
      ref={ref}
      className={`reveal ${className}`}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </Component>
  );
}
