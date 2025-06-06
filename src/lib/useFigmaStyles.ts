'use client';

import { useEffect, useState } from 'react';

interface FigmaStyleToken {
  name: string;
  value: string;
}

export function useFigmaStyles() {
  const [tokens, setTokens] = useState<FigmaStyleToken[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFigmaTokens() {
      try {
        const res = await fetch('https://api.figma.com/v1/files/iCUlrFEKlwFFH5MEVIQ9ac/styles', {
          headers: {
            'X-Figma-Token': process.env.NEXT_PUBLIC_FIGMA_TOKEN!,
          },
        });

        if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);

        const data = await res.json();

        const parsed = data.meta?.styles?.map((style: any) => ({
          name: style.name,
          value: style.description || '',
        })) ?? [];

        setTokens(parsed);
      } catch (err: any) {
        console.error('Figma token fetch error:', err);
        setError(err.message);
      }
    }

    fetchFigmaTokens();
  }, []);

  return { tokens, error };
}
