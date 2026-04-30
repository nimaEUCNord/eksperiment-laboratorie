import type { AccentColor } from "@/content/types";

export type AccentClasses = {
  bg: string;
  bgSoft: string;
  text: string;
  textSoft: string;
  ring: string;
  border: string;
  hoverBorder: string;
  gradient: string;
};

const map: Record<AccentColor, AccentClasses> = {
  sky: {
    bg: "bg-sky-600",
    bgSoft: "bg-sky-50",
    text: "text-sky-700",
    textSoft: "text-sky-600",
    ring: "ring-sky-500",
    border: "border-sky-200",
    hoverBorder: "hover:border-sky-400",
    gradient: "from-sky-50 to-white",
  },
  amber: {
    bg: "bg-amber-500",
    bgSoft: "bg-amber-50",
    text: "text-amber-700",
    textSoft: "text-amber-600",
    ring: "ring-amber-500",
    border: "border-amber-200",
    hoverBorder: "hover:border-amber-400",
    gradient: "from-amber-50 to-white",
  },
  emerald: {
    bg: "bg-emerald-600",
    bgSoft: "bg-emerald-50",
    text: "text-emerald-700",
    textSoft: "text-emerald-600",
    ring: "ring-emerald-500",
    border: "border-emerald-200",
    hoverBorder: "hover:border-emerald-400",
    gradient: "from-emerald-50 to-white",
  },
  rose: {
    bg: "bg-rose-600",
    bgSoft: "bg-rose-50",
    text: "text-rose-700",
    textSoft: "text-rose-600",
    ring: "ring-rose-500",
    border: "border-rose-200",
    hoverBorder: "hover:border-rose-400",
    gradient: "from-rose-50 to-white",
  },
  violet: {
    bg: "bg-violet-600",
    bgSoft: "bg-violet-50",
    text: "text-violet-700",
    textSoft: "text-violet-600",
    ring: "ring-violet-500",
    border: "border-violet-200",
    hoverBorder: "hover:border-violet-400",
    gradient: "from-violet-50 to-white",
  },
  orange: {
    bg: "bg-orange-600",
    bgSoft: "bg-orange-50",
    text: "text-orange-700",
    textSoft: "text-orange-600",
    ring: "ring-orange-500",
    border: "border-orange-200",
    hoverBorder: "hover:border-orange-400",
    gradient: "from-orange-50 to-white",
  },
};

export function getAccent(color: AccentColor): AccentClasses {
  return map[color];
}
