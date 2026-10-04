import React, { useState } from 'react';

/**
 * MINHAJ WELDING - Replaceable Icon Component (Section 3: Icon Replacement)
 *
 * Usage: <IconImg name="dashboard" size={24} />
 *
 * Resolution order:
 *   1. /icons/<name>.png or .svg   (user-uploaded override, via Admin > Settings > Icons)
 *   2. /icons/default/<name>.png   (bundled default - works fully offline)
 *   3. A plain colored square fallback (never a broken image icon)
 *
 * Uploading a replacement (from Admin > Settings > Icons & Assets) simply
 * writes a new file to /public/icons/<name>.(svg|png) — no code change
 * needed, and it keeps working with no internet connection since nothing
 * is fetched from a CDN.
 */
export default function IconImg({ name, size = 24, alt = '', className = '' }) {
  const [srcIndex, setSrcIndex] = useState(0);
  const candidates = [
    `/icons/${name}.svg`,
    `/icons/${name}.png`,
    `/icons/default/${name}.svg`,
    `/icons/default/${name}.png`,
  ];

  if (srcIndex >= candidates.length) {
    // Final fallback - never show a broken image
    return (
      <div
        className={`bg-border rounded ${className}`}
        style={{ width: size, height: size }}
        title={alt || name}
      />
    );
  }

  return (
    <img
      src={candidates[srcIndex]}
      alt={alt || name}
      width={size}
      height={size}
      className={className}
      onError={() => setSrcIndex((i) => i + 1)}
      style={{ objectFit: 'contain' }}
    />
  );
}
