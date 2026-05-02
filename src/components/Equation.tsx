'use client';

import { useMemo } from 'react';
import 'katex/dist/katex.min.css';
import katex from 'katex';

interface EquationProps {
  latex: string;
  mode?: 'inline' | 'display';
  fallback?: React.ReactNode;
}

export function Equation({ latex, mode = 'inline', fallback }: EquationProps) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(latex, { displayMode: mode === 'display' });
    } catch (e) {
      console.error('KaTeX render error:', e);
      return null;
    }
  }, [latex, mode]);

  if (!html) {
    return fallback ? <>{fallback}</> : <code>{latex}</code>;
  }

  return (
    <span dangerouslySetInnerHTML={{ __html: html }} className="equation" />
  );
}
