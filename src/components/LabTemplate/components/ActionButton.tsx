"use client";

import type { ButtonHTMLAttributes } from "react";
import type { AccentClasses } from "@/lib/accent";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
  accent: AccentClasses;
  dimmed?: boolean;
};

export default function ActionButton({ accent, dimmed = false, ...rest }: Props) {
  return (
    <button
      {...rest}
      className={[
        "rounded-xl px-4 py-1.5 text-xs font-medium text-white transition-opacity",
        accent.bg,
        "disabled:opacity-50 disabled:cursor-not-allowed",
        dimmed ? "opacity-40" : "",
      ].join(" ")}
    />
  );
}
