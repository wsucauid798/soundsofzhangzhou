"use client";

import { useState } from "react";
import {
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from "@heroicons/react/24/solid";

interface HeaderProps {
  lang: "en" | "zh";
  onToggleLang: () => void;
  isMuted: boolean;
  volume: number;
  onToggleMute: () => void;
  onVolumeChange: (volume: number) => void;
}

export default function Header({
  lang,
  onToggleLang,
  isMuted,
  volume,
  onToggleMute,
  onVolumeChange,
}: HeaderProps) {
  const [showVolume, setShowVolume] = useState(false);

  return (
    <header className="container mx-auto flex shrink-0 items-center justify-between px-4 py-4">
      {/* Language toggle - LEFT */}
      <button
        onClick={onToggleLang}
        className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-medium tracking-wider text-zinc-300 transition-all hover:border-white/40 hover:bg-white/10 hover:text-white"
      >
        {lang === "en" ? "中文" : "EN"}
      </button>

      {/* Volume control - RIGHT */}
      <div className="relative">
        <button
          onClick={() => setShowVolume(!showVolume)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-300"
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted || volume === 0 ? (
            <SpeakerXMarkIcon className="h-5 w-5" />
          ) : (
            <SpeakerWaveIcon className="h-5 w-5" />
          )}
        </button>

        {/* Volume dropdown */}
        {showVolume && (
          <div className="absolute right-0 top-12 z-20 flex h-36 w-12 flex-col items-center justify-center rounded-2xl border border-white/10 bg-zinc-900/95 py-3 backdrop-blur-sm">
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="h-24 w-2 cursor-pointer appearance-none rounded-full bg-zinc-700"
              style={{ writingMode: "vertical-lr", direction: "rtl" }}
              aria-label="Volume"
            />
            <button
              onClick={onToggleMute}
              className="mt-2 text-[10px] text-zinc-500"
            >
              {isMuted ? "on" : "off"}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
