"use client";

import { useState, useEffect, useLayoutEffect } from "react";
import { SpeakerWaveIcon, SpeakerXMarkIcon } from "@heroicons/react/24/solid";

type Language = "en" | "zh";

export default function Header({ initialLang = "en" }: { initialLang?: Language }) {
  const [lang, setLang] = useState<Language>(initialLang);
  const [volume, setVolume] = useState(5);
  const [isMuted, setIsMuted] = useState(true);
  const [showVolume, setShowVolume] = useState(false);

  const isChinese = lang === "zh";

  // Dispatch volume change event to page.tsx
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("volumeChange", {
        detail: { volume, muted: isMuted },
      })
    );
  }, [volume, isMuted]);

  useLayoutEffect(() => {
    const hasCookie = document.cookie
      .split(";")
      .some((cookie) => cookie.trim().startsWith("siteLang="));
    if (hasCookie) return;

    const storedLang = localStorage.getItem("siteLang");
    if (storedLang === "en" || storedLang === "zh") {
      setLang(storedLang);
      window.dispatchEvent(new CustomEvent("langChange", { detail: storedLang }));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("siteLang", lang);
    document.cookie = `siteLang=${lang}; path=/; max-age=31536000; samesite=lax`;
  }, [lang]);

  useEffect(() => {
    const handleLangChange = (e: CustomEvent<Language>) => {
      setLang(e.detail);
    };
    window.addEventListener("langChange", handleLangChange as EventListener);
    return () => window.removeEventListener("langChange", handleLangChange as EventListener);
  }, []);

  // Dispatch language change event
  const toggleLang = () => {
    const newLang = lang === "en" ? "zh" : "en";
    setLang(newLang);
    window.dispatchEvent(new CustomEvent("langChange", { detail: newLang }));
  };

  return (
    <header className="site-header shrink-0 bg-transparent transition-colors">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        {/* Language toggle - LEFT */}
        <button
          onClick={toggleLang}
          className={`lang-toggle rounded-full border px-4 py-2 text-xs font-medium tracking-wider shadow-none outline-none transition-all focus:outline-none ${
            isChinese
              ? "border-stone-300 bg-[#faf7f2] text-stone-700 hover:bg-stone-100"
              : "border-white/20 bg-white/5 text-zinc-300 hover:border-white/40 hover:bg-white/10 hover:text-white"
          }`}
          title="Switch language"
        >
          {lang === "en" ? (
            <span style={{ fontFamily: "var(--font-zh-ui), sans-serif", fontWeight: 500 }}>中文</span>
          ) : (
            "EN"
          )}
        </button>

        {/* Volume control - RIGHT */}
        <div className="relative">
          <button
            onClick={() => {
              setShowVolume(!showVolume);
              if (volume === 0) {
                setVolume(5);
              }
              if (isMuted) {
                setIsMuted(false);
              }
              sessionStorage.setItem("audioEnabled", "true");
              window.dispatchEvent(new CustomEvent("requestPlay"));
            }}
            className={`volume-toggle flex h-10 w-10 items-center justify-center rounded-full border shadow-none outline-none transition-all focus:outline-none ${
              isChinese
                ? "border-stone-300 bg-[#faf7f2] text-stone-700 hover:bg-stone-100"
                : "border-white/20 bg-white/5 text-zinc-300 hover:border-white/40 hover:bg-white/10 hover:text-white"
            }`}
            aria-label={isMuted ? "Unmute" : "Mute"}
            title={isMuted ? (isChinese ? "点击收听音乐" : "Click to listen to the music") : undefined}
          >
            {isMuted || volume === 0 ? (
              <SpeakerXMarkIcon className="h-5 w-5" />
            ) : (
              <SpeakerWaveIcon className="h-5 w-5" />
            )}
          </button>

          {showVolume && (
            <div className={`volume-panel absolute right-0 top-full z-30 mt-2 flex h-32 w-10 flex-col items-center justify-center rounded-2xl border py-3 shadow-none backdrop-blur-sm ${
              isChinese
                ? "border-stone-300 bg-white"
                : "border-white/10 bg-zinc-900/95"
            }`}>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const nextVolume = Number(e.target.value);
                  setVolume(nextVolume);
                  if (nextVolume === 0) {
                    setIsMuted(true);
                  } else if (isMuted) {
                    setIsMuted(false);
                  }
                }}
                className={`volume-slider h-20 w-2 cursor-pointer appearance-none rounded-full ${
                  isChinese ? "bg-stone-200" : "bg-zinc-700"
                }`}
                style={{ writingMode: "vertical-lr", direction: "rtl" }}
              />
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`mt-2 text-[10px] shadow-none outline-none focus:outline-none ${isChinese ? "text-stone-600" : "text-zinc-500"}`}
              >
                {isMuted || volume === 0 ? "off" : "on"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
