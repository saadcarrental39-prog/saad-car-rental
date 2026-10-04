import React, { useRef, useState, useCallback, useEffect } from 'react';

/**
 * MINHAJ WELDING - Real 360° Viewer (Module 18)
 *
 * This is a genuine 360° viewer: it drags through an ordered sequence of
 * real photographs (frames) taken around a physical gate/product/design —
 * not a single static image relabeled as "360°". Upload a frame sequence
 * via the Media Library with a shared `group_key`, then pass the sorted
 * frame URLs here.
 *
 * frames: string[] of image URLs, in rotation order (e.g. 24 photos taken
 *         every 15° around the object)
 */
export default function ThreeSixtyViewer({ frames = [], title = '' }) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const containerRef = useRef(null);

  const frameCount = frames.length;

  const rotateBy = useCallback((deltaX) => {
    if (!frameCount) return;
    // Every ~8px of drag advances one frame — tune to taste per photo count.
    const sensitivity = 8;
    const framesToMove = Math.round(deltaX / sensitivity);
    if (framesToMove === 0) return;
    setIndex((prev) => {
      let next = (prev - framesToMove) % frameCount;
      if (next < 0) next += frameCount;
      return next;
    });
    lastX.current += framesToMove * sensitivity;
  }, [frameCount]);

  const onPointerDown = (e) => {
    dragging.current = true;
    lastX.current = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
  };
  const onPointerMove = (e) => {
    if (!dragging.current) return;
    const x = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    rotateBy(x - lastX.current);
    lastX.current = x;
  };
  const onPointerUp = () => { dragging.current = false; };

  useEffect(() => {
    const move = (e) => onPointerMove(e);
    const up = () => onPointerUp();
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchmove', move);
    window.addEventListener('touchend', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameCount]);

  const reset = () => { setIndex(0); setZoom(1); };

  if (!frameCount) {
    return <div className="card text-sm text-text-secondary">No 360° frames uploaded for this item yet.</div>;
  }

  return (
    <div ref={containerRef} className={`card ${fullscreen ? 'fixed inset-0 z-50 rounded-none flex flex-col' : ''}`}>
      {title && <div className="text-sm font-semibold mb-2">{title}</div>}
      <div
        className="relative overflow-hidden bg-gray-100 rounded-card cursor-grab active:cursor-grabbing select-none flex-1"
        style={{ height: fullscreen ? 'calc(100% - 60px)' : 360 }}
        onMouseDown={onPointerDown}
        onTouchStart={onPointerDown}
      >
        <img
          src={frames[index]}
          alt={`Frame ${index + 1} of ${frameCount}`}
          draggable={false}
          className="w-full h-full object-contain pointer-events-none"
          style={{ transform: `scale(${zoom})`, transition: 'transform 0.1s' }}
        />
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded-pill">
          {index + 1} / {frameCount} — drag to rotate
        </div>
      </div>
      <div className="flex justify-center gap-2 mt-2">
        <button className="btn-ghost text-xs" onClick={() => setZoom((z) => Math.max(1, z - 0.25))}>Zoom -</button>
        <button className="btn-ghost text-xs" onClick={() => setZoom((z) => Math.min(3, z + 0.25))}>Zoom +</button>
        <button className="btn-ghost text-xs" onClick={reset}>Reset</button>
        <button className="btn-ghost text-xs" onClick={() => setFullscreen((f) => !f)}>{fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</button>
      </div>
    </div>
  );
}
