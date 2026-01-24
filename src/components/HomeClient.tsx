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
    const handleVolumeChange = (event: Event) => {
      const custom = event as CustomEvent<{ volume: number; muted: boolean }>;
      const audio = audioRef.current;
      if (!audio) return;
      audio.volume = Math.max(0, Math.min(1, custom.detail.volume / 100));
      audio.muted = custom.detail.muted;
    };

    window.addEventListener("volumeChange", handleVolumeChange);
    return () => window.removeEventListener("volumeChange", handleVolumeChange);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const tryPlay = async () => {
      try {
        await audio.play();
        setIsReady(true);
      } catch {
        setIsReady(false);
      }
    };

    tryPlay();

    const handleUserStart = () => {
      if (!audio.paused) return;
      audio.play().then(() => setIsReady(true)).catch(() => {});
    };

    window.addEventListener("pointerdown", handleUserStart, { once: true });
    window.addEventListener("keydown", handleUserStart, { once: true });

    return () => {
      window.removeEventListener("pointerdown", handleUserStart);
      window.removeEventListener("keydown", handleUserStart);
    };
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

  return (
    <div className={`flex h-full w-full ${isChinese ? "bg-[#faf7f2]" : ""}`}>
      <audio ref={audioRef} onEnded={handleTrackEnd} preload="auto" />
      <div className={`container mx-auto flex flex-1 flex-col items-center justify-center px-4 ${isChinese ? "text-stone-900" : ""}`}>
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[200px] w-[80%] max-w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[80px]"
          style={{
            opacity: isChinese ? 0.4 : 0.2,
            background: isChinese
              ? "radial-gradient(ellipse, rgba(220, 38, 38, 0.3) 0%, transparent 70%)"
              : "radial-gradient(ellipse, rgba(80, 80, 80, 0.4) 0%, transparent 70%)",
          }}
        />

        <h1
          className={`relative mb-3 text-center text-3xl font-light tracking-wide sm:text-4xl md:text-5xl ${
            isChinese ? "text-stone-900" : "text-white"
          }`}
          style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
        >
          {t.title}
        </h1>

        <div
          className={`prose relative mx-auto mb-8 max-w-md sm:mb-10 prose-p:text-base prose-p:leading-relaxed ${
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
          <a
            href="/experience"
            className={`inline-flex items-center justify-center rounded-full border px-6 py-3 text-sm font-medium tracking-[0.2em] uppercase transition-colors ${
              isChinese
                ? "border-red-600 bg-red-600 text-white hover:bg-red-700"
                : "border-white/20 bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            {t.enter}
          </a>
        </div>
      </div>
    </div>
  );
}
