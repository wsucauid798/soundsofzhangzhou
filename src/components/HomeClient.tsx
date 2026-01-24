"use client";

import { useEffect, useRef, useState } from "react";

type Language = "en" | "zh";

const COPY = {
  en: {
    title: "Sounds of Zhangzhou",
    description: [
      "A living archive of the city’s soundscape — from morning markets to temple bells.",
      "Step inside and explore the voices, rhythms, and memories of Zhangzhou.",
    ],
    enter: "Enter",
  },
  zh: {
    title: "漳州之声",
    description: [
      "这是一座城市声音的活档案——从清晨的市集到寺庙的钟声。",
      "走进其中，探索漳州的声音、节奏与记忆。",
    ],
    enter: "进入",
  },
} as const;

export default function HomeClient({ initialLang }: { initialLang: Language }) {
  const [lang, setLang] = useState<Language>(initialLang);
  const [isReady, setIsReady] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [view, setView] = useState<"start" | "experience">("start");
  const [hasUserAudioEnabled, setHasUserAudioEnabled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const tracks = [
    "/sound/music/song-1.mp3",
    "/sound/music/song-2.mp3",
    "/sound/music/song-3.mp3",
  ];

  useEffect(() => {
    const stored = localStorage.getItem("lang");
    if (stored === "en" || stored === "zh") {
      setLang(stored);
    }
  }, []);

  useEffect(() => {
    const handleLangChange = (event: Event) => {
      const custom = event as CustomEvent<Language>;
      if (custom.detail === "en" || custom.detail === "zh") {
        setLang(custom.detail);
      }
    };

    window.addEventListener("langChange", handleLangChange);
    return () => window.removeEventListener("langChange", handleLangChange);
  }, []);

  const isChinese = lang === "zh";
  const t = COPY[lang];

  useEffect(() => {
    const storedEnabled = sessionStorage.getItem("audioEnabled") === "true";
    if (storedEnabled) {
      setHasUserAudioEnabled(true);
    }
  }, []);

  useEffect(() => {
    const handleVolumeChange = (event: Event) => {
      const custom = event as CustomEvent<{ volume: number; muted: boolean }>;
      const audio = audioRef.current;
      if (!audio) return;
      audio.volume = Math.max(0, Math.min(1, custom.detail.volume / 100));
      audio.muted = custom.detail.muted;
      if (!custom.detail.muted && custom.detail.volume > 0) {
        setHasUserAudioEnabled(true);
        sessionStorage.setItem("audioEnabled", "true");
      }
      if (!custom.detail.muted && !audio.paused) return;
      if (!custom.detail.muted && custom.detail.volume > 0) {
        audio.play().then(() => setIsReady(true)).catch(() => {});
      }
    };

    window.addEventListener("volumeChange", handleVolumeChange);
    return () => window.removeEventListener("volumeChange", handleVolumeChange);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!hasUserAudioEnabled) {
      audio.volume = 0.05;
      audio.muted = true;
      return;
    }
    audio.muted = false;
    if (audio.volume === 0) {
      audio.volume = 0.05;
    }
    audio.play().then(() => setIsReady(true)).catch(() => {});
  }, [hasUserAudioEnabled]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setIsReady(false);
  }, []);

  useEffect(() => {
    const handleRequestPlay = () => {
      const audio = audioRef.current;
      if (!audio) return;
      if (!audio.paused) return;
      audio.play().then(() => setIsReady(true)).catch(() => {});
    };

    window.addEventListener("requestPlay", handleRequestPlay);
    return () => window.removeEventListener("requestPlay", handleRequestPlay);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = tracks[currentTrack];
    audio.load();
    if (isReady) audio.play().catch(() => {});
  }, [currentTrack, isReady, tracks]);

  const handleTrackEnd = () => {
    setCurrentTrack((prev) => (prev + 1) % tracks.length);
  };

  const handleEnter = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (isFadingOut) return;
    setIsFadingOut(true);

    const audio = audioRef.current;
    if (audio && !audio.muted && audio.volume > 0) {
      const steps = 10;
      const stepDuration = 300;
      const startVolume = audio.volume;

      for (let i = 1; i <= steps; i += 1) {
        audio.volume = Math.max(0, startVolume * (1 - i / steps));
        await new Promise((resolve) => setTimeout(resolve, stepDuration));
      }

      audio.pause();
      audio.currentTime = 0;
    }

    setView("experience");
  };

  return (
    <div className="start-screen flex h-full w-full">
      <audio ref={audioRef} onEnded={handleTrackEnd} preload="auto" />
      {view === "start" ? (
        <div className={`start-screen__content container mx-auto flex flex-1 flex-col items-center justify-center px-4 ${isChinese ? "text-stone-900" : ""}`}>
          <h1
            className={`start-screen__title relative mb-3 text-center text-3xl font-light tracking-wide sm:text-4xl md:text-5xl ${
              isChinese ? "text-stone-900" : "text-white"
            }`}
            style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
          >
            {t.title}
          </h1>

          <div
            className={`start-screen__description prose relative mx-auto mb-8 max-w-md sm:mb-10 prose-p:text-base prose-p:leading-relaxed ${
              isChinese
                ? "prose-p:text-stone-700"
                : "prose-invert prose-zinc prose-p:text-zinc-400"
            }`}
            style={{ fontFamily: "var(--font-body-serif), Georgia, serif" }}
          >
            {t.description.map((para, i) => (
              <p key={i} className="text-center">
                {para}
              </p>
            ))}
          </div>

          <div className="mt-6 flex justify-center">
            <button
              type="button"
              className={`start-screen__enter inline-flex items-center justify-center rounded-full border px-6 py-3 text-sm font-medium tracking-[0.2em] uppercase transition-colors ${
                isChinese
                  ? "border-red-600 bg-red-600 text-white hover:bg-red-700"
                  : "border-white/20 bg-white/10 text-white hover:bg-white/20"
              }`}
              title="Enter experience"
              onClick={handleEnter}
            >
              {t.enter}
            </button>
          </div>
        </div>
      ) : (
        <div className={`experience-view container mx-auto flex h-full w-full flex-col px-6 py-12 ${isChinese ? "text-stone-900" : "text-white"}`}>
          <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-10 overflow-y-auto">
            <section className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
              <h2 className="text-2xl font-light tracking-wide" style={{ fontFamily: "var(--font-serif), Georgia, serif" }}>
                Experience coming soon
              </h2>
              <p className="mt-4 text-sm text-zinc-300">
                This area will become the immersive, scrolling experience.
              </p>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
