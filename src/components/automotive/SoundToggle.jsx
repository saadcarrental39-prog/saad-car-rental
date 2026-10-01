import { useState } from "react";
import { isMuted, setMuted } from "../../audio/carSound";

export default function SoundToggle() {
  const [off, setOff] = useState(isMuted());
  const toggle = () => { setMuted(!off); setOff(!off); };
  return (
    <button type="button" className="lc__sound" onClick={toggle} aria-pressed={!off} aria-label={off ? "Turn sound on" : "Turn sound off"}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 5 6 9H3v6h3l5 4z" />
        {off ? <path d="m22 9-6 6m0-6 6 6" /> : <><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M18.5 5.5a9 9 0 0 1 0 13" /></>}
      </svg>
    </button>
  );
}
