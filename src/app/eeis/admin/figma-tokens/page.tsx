'use client';

import React from 'react';
import { useFigmaStyles } from '@/lib/useFigmaStyles';

export default function FigmaTokenViewer() {
  const { tokens, error } = useFigmaStyles();

  return (
    <div className="min-h-screen px-6 py-8 bg-gray-50 text-gray-900">
      <h1 className="text-2xl font-bold mb-4">🎨 Figma Design Tokens</h1>

      {error && (
        <p className="text-red-600">
          Failed to load tokens: {error}
        </p>
      )}

      {!error && tokens.length === 0 && (
        <p className="text-sm text-gray-500">Loading design tokens...</p>
      )}

      <ul className="space-y-2">
        {tokens.map((token, i) => (
          <li key={i} className="p-4 bg-white shadow rounded">
            <p className="text-sm font-medium">
              <span className="text-blue-600">{token.name}</span>
            </p>
            <p className="text-xs text-gray-600">{token.value}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
