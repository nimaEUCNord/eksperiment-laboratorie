'use client';

import { Equation } from './Equation';

interface RichTextProps {
  text: string;
}

export function RichText({ text }: RichTextProps) {
  const parts: (string | { type: 'inline' | 'display'; latex: string })[] = [];
  let remaining = text;
  let lastIndex = 0;

  const displayRegex = /\$\$(.*?)\$\$/gs;
  const inlineRegex = /(?<!\$)\$((?!\$).+?)\$(?!\$)/g;

  let match: RegExpExecArray | null;

  // First, find all display math blocks
  const displayMatches: { start: number; end: number; latex: string }[] = [];
  while ((match = displayRegex.exec(text)) !== null) {
    displayMatches.push({
      start: match.index,
      end: match.index + match[0].length,
      latex: match[1].trim(),
    });
  }

  // Then find inline math, skipping those inside display blocks
  const inlineMatches: { start: number; end: number; latex: string }[] = [];
  const inlineRegexGlobal = /(?<!\$)\$((?!\$).+?)\$(?!\$)/g;
  while ((match = inlineRegexGlobal.exec(text)) !== null) {
    const isInsideDisplay = displayMatches.some(
      (d) => match!.index >= d.start && match!.index < d.end
    );
    if (!isInsideDisplay) {
      inlineMatches.push({
        start: match!.index,
        end: match![0].length + match!.index,
        latex: match![1].trim(),
      });
    }
  }

  // Combine and sort all matches
  const allMatches = [...displayMatches, ...inlineMatches].sort(
    (a, b) => a.start - b.start
  );

  // Build parts
  let currentPos = 0;
  for (const m of allMatches) {
    if (m.start > currentPos) {
      parts.push(text.slice(currentPos, m.start));
    }
    parts.push({
      type: displayMatches.some((d) => d.start === m.start)
        ? 'display'
        : 'inline',
      latex: m.latex,
    });
    currentPos = m.end;
  }

  if (currentPos < text.length) {
    parts.push(text.slice(currentPos));
  }

  return (
    <>
      {parts.map((part, i) => {
        if (typeof part === 'string') {
          return <span key={i}>{part}</span>;
        }
        if (part.type === 'display') {
          return (
            <span key={i} className="block my-2 flex justify-center">
              <Equation latex={part.latex} mode="display" />
            </span>
          );
        }
        return (
          <Equation key={i} latex={part.latex} mode="inline" />
        );
      })}
    </>
  );
}
