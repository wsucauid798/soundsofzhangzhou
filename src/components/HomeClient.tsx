"use client";

import { useState, useEffect, useRef, useCallback, useLayoutEffect } from "react";
import { PlayIcon, PauseIcon } from "@heroicons/react/24/solid";

type Language = "en" | "zh";

// Skip Previous Icon (|◀)
function SkipPreviousIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="6" width="3" height="12" />
      <path d="M18 6v12l-9-6z" />
    </svg>
  );
}

// Skip Next Icon (▶|)
function SkipNextIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 6v12l9-6z" />
      <rect x="15" y="6" width="3" height="12" />
    </svg>
  );
}

const tracks = [
  "/sound/music/song-1.mp3",
  "/sound/music/song-2.mp3",
  "/sound/music/song-3.mp3",
  "/sound/music/song-4.mp3",
];

const content = {
  en: {
    title: "Sounds of Zhangzhou",
    description: [
      "This project captures the pulse of Zhangzhou during the Spring Festival through sound, images and video. Drawn from streets, corners and sidewalks, it explores the city's rhythm — its textures, colours, aromas, loudness and ambience.",
      "It's a sensory journey into vibrant celebrations and spiritual moments, turning discovery into documentary and offering you a way to see, hear and feel Zhangzhou too.",
    ],
    launchIn: "Launches in",
    days: "days",
    hours: "hours",
    min: "min",
    sec: "sec",
  },
  zh: {
    title: "Sounds of Zhangzhou",
    description: [
      "这个项目通过声音、图像和视频捕捉漳州在春节期间的脉动。取材于街道、角落和人行道，它探索这座城市的节奏——它的质感、色彩、气味、响亮度和氛围。",
      "这是一场感官之旅，进入充满活力的庆祝活动和精神性的时刻，把发现变成纪录片，并为你提供一种也能看见、听见并感受漳州的方式。",
    ],
    launchIn: "发布倒计时",
    days: "天",
    hours: "时",
    min: "分",
    sec: "秒",
  },
};

// Chinese New Year festive colors
const cnyColors = [
  { h: 0, s: 80, l: 45 },
  { h: 5, s: 85, l: 50 },
  { h: 15, s: 90, l: 50 },
  { h: 25, s: 95, l: 50 },
  { h: 38, s: 95, l: 50 },
  { h: 45, s: 100, l: 45 },
  { h: 42, s: 95, l: 50 },
  { h: 35, s: 90, l: 50 },
  { h: 20, s: 90, l: 50 },
  { h: 8, s: 85, l: 50 },
  { h: 0, s: 80, l: 48 },
  { h: 350, s: 75, l: 55 },
  { h: 340, s: 70, l: 60 },
  { h: 355, s: 80, l: 50 },
  { h: 5, s: 85, l: 48 },
  { h: 0, s: 80, l: 45 },
];

export default function HomeClient({ initialLang = "en" }: { initialLang?: Language }) {
  const [lang, setLang] = useState<Language>(initialLang);
  const [isMounted, setIsMounted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const animationRef = useRef<number>(0);
  const isAudioInitRef = useRef(false);

  const t = content[lang];
  const isChinese = lang === "zh";
  const cnBarColor = "#1c1917";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Broadcast language to other components and update body class
  useEffect(() => {
    document.body.setAttribute("data-lang", lang);
  }, [lang]);

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

  // Listen for language changes from Header
  useEffect(() => {
    const handleLangChange = (e: CustomEvent<Language>) => {
      setLang(e.detail);
    };
    window.addEventListener("langChange", handleLangChange as EventListener);
    return () => window.removeEventListener("langChange", handleLangChange as EventListener);
  }, []);

  // Listen for volume changes from Header
  useEffect(() => {
    const handleVolumeChange = (e: CustomEvent<{ volume: number; muted: boolean }>) => {
      const gainNode = gainNodeRef.current;
      if (gainNode) {
        gainNode.gain.value = e.detail.muted ? 0 : e.detail.volume / 100;
      }
    };
    window.addEventListener("volumeChange", handleVolumeChange as EventListener);
    return () => window.removeEventListener("volumeChange", handleVolumeChange as EventListener);
  }, []);

  // Initialize Web Audio API
  const initAudio = useCallback(() => {
    if (isAudioInitRef.current) return;
    const audio = audioRef.current;
    if (!audio) return;

    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    audioContextRef.current = ctx;

    const source = ctx.createMediaElementSource(audio);

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.5;
    analyser.minDecibels = -85;
    analyser.maxDecibels = -10;
    analyserRef.current = analyser;

    const gainNode = ctx.createGain();
    gainNode.gain.value = 0.05;
    gainNodeRef.current = gainNode;

    source.connect(analyser);
    analyser.connect(gainNode);
    gainNode.connect(ctx.destination);

    isAudioInitRef.current = true;
  }, []);

  // Initialize on first user interaction
  useEffect(() => {
    const handle = () => {
      initAudio();
      document.removeEventListener("click", handle);
    };
    document.addEventListener("click", handle);
    return () => document.removeEventListener("click", handle);
  }, [initAudio]);

  // Canvas equalizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const bands = 16;
    const dataArray = new Uint8Array(256);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      const analyser = analyserRef.current;
      if (analyser && isPlaying) {
        analyser.getByteFrequencyData(dataArray);

        const barWidth = width / (bands * 1.6);
        const gap = barWidth * 0.6;

        for (let i = 0; i < bands; i++) {
          const idx = Math.floor((i / bands) * 64);
          const magnitude = dataArray[idx] / 255;
          const barHeight = (height * 0.85 * magnitude) + height * 0.15;
          const x = i * (barWidth + gap);
          const y = height - barHeight;

          if (isChinese) {
            ctx.fillStyle = cnBarColor;
            ctx.shadowBlur = 8;
            ctx.shadowColor = "rgba(28, 25, 23, 0.3)";
          } else {
            ctx.fillStyle = `rgba(255, 255, 255, ${0.7 + magnitude * 0.3})`;
            ctx.shadowBlur = 8;
            ctx.shadowColor = "rgba(255, 255, 255, 0.4)";
          }

          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
          ctx.fill();
        }
      } else {
        const barWidth = width / (bands * 1.6);
        const gap = barWidth * 0.6;

        for (let i = 0; i < bands; i++) {
          const x = i * (barWidth + gap);
          const barHeight = height * 0.06;

          ctx.fillStyle = isChinese ? cnBarColor : "#3f3f46";
          ctx.shadowBlur = 0;

          ctx.beginPath();
          ctx.roundRect(x, height - barHeight, barWidth, barHeight, [4, 4, 0, 0]);
          ctx.fill();
        }
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [isPlaying, isChinese]);

  // Track change
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.load();
    if (isPlaying) audio.play().catch(() => {});
  }, [currentTrack, isPlaying]);

  // Countdown
  useEffect(() => {
    const target = new Date("2026-07-31T00:00:00+08:00");
    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / 86400000),
          hours: Math.floor((diff / 3600000) % 24),
          minutes: Math.floor((diff / 60000) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const handlePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    initAudio();

    if (audioContextRef.current?.state === "suspended") {
      await audioContextRef.current.resume();
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      await audio.play();
      setIsPlaying(true);
    }
  };

  const handlePrevTrack = () => setCurrentTrack((p) => (p - 1 + tracks.length) % tracks.length);
  const handleNextTrack = () => setCurrentTrack((p) => (p + 1) % tracks.length);

  return (
    <div className={`flex min-h-screen flex-col ${isChinese ? "bg-[#faf7f2]" : ""}`}>
      <audio id="audio-player" ref={audioRef} src={tracks[currentTrack]} onEnded={handleNextTrack} />

      <div
        className={`container mx-auto flex flex-1 flex-col justify-center px-4 py-4 ${isChinese ? "text-stone-900" : ""}`}
        style={isChinese ? { fontFamily: "var(--font-zh), serif" } : undefined}
      >
        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[200px] w-[80%] max-w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[80px]"
          style={{
            opacity: isChinese ? 0.4 : 0.2,
            background: isChinese
              ? isPlaying
                ? "radial-gradient(ellipse, rgba(220, 38, 38, 0.8) 0%, rgba(234, 179, 8, 0.4) 50%, transparent 70%)"
                : "radial-gradient(ellipse, rgba(220, 38, 38, 0.3) 0%, transparent 70%)"
              : isPlaying
                ? "radial-gradient(ellipse, rgba(249, 115, 22, 0.6) 0%, transparent 70%)"
                : "radial-gradient(ellipse, rgba(80, 80, 80, 0.4) 0%, transparent 70%)",
          }}
        />

        {/* Title */}
        <h1
          className={`relative mb-3 text-center text-3xl font-light tracking-wide sm:text-4xl md:text-5xl ${
            isChinese ? "text-stone-900" : "text-white"
          }`}
          style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
        >
          {t.title}
        </h1>

        {/* Description */}
        <div 
          className={`prose relative mx-auto mb-8 max-w-md sm:mb-10 prose-p:text-base prose-p:leading-relaxed ${
            isChinese 
              ? "prose-p:text-stone-700" 
              : "prose-invert prose-zinc prose-p:text-zinc-400"
          }`}
          style={{ fontFamily: "var(--font-body-serif), Georgia, serif" }}
        >
          {t.description.map((para, i) => (
            <p key={i} className="text-center">{para}</p>
          ))}
        </div>

        {/* Countdown */}
        {isMounted ? (
          <div className="relative mb-12 text-center sm:mb-14">
            <p className={`mb-2 text-xs font-medium uppercase tracking-[0.25em] sm:text-sm ${
              isChinese ? "text-red-700" : "text-zinc-500"
            }`}>
              {t.launchIn}
            </p>
            <div className="flex justify-center gap-4 sm:gap-6">
              {[
                { value: timeLeft.days, label: t.days },
                { value: timeLeft.hours, label: t.hours },
                { value: timeLeft.minutes, label: t.min },
                { value: timeLeft.seconds, label: t.sec },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center">
                  <span className={`text-3xl font-light tabular-nums sm:text-4xl md:text-5xl ${
                    isChinese ? "text-red-700" : "text-zinc-100"
                  }`}>
                    {String(item.value).padStart(2, "0")}
                  </span>
                  <span className={`mt-1 uppercase tracking-[0.1em] ${
                    isChinese 
                      ? "text-sm text-stone-600 sm:text-base" 
                      : "text-[10px] text-zinc-500 sm:text-xs"
                  }`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-12 h-[120px] sm:mb-14" aria-hidden="true" />
        )}

        {/* Canvas Equalizer */}
        <div className="relative mx-auto mb-6 w-4/5 max-w-xs">
          <canvas
            ref={canvasRef}
            className="h-20 w-full sm:h-24"
            style={{ display: "block" }}
          />
        </div>

        {/* Transport controls */}
        <div className="mb-2 flex items-center justify-center gap-2">
          <button
            onClick={handlePrevTrack}
            className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
              isChinese 
                ? "text-stone-500 hover:bg-stone-200 hover:text-stone-700 active:bg-stone-200"
                : "text-zinc-400 hover:bg-white/5 hover:text-white active:bg-white/10"
            }`}
            aria-label="Previous track"
          >
            <SkipPreviousIcon className="h-6 w-6" />
          </button>

          <button
            onClick={handlePlayPause}
            className={`flex h-14 w-14 items-center justify-center rounded-full border transition-colors ${
              isChinese
                ? "border-red-600 bg-red-600 text-white hover:bg-red-700"
                : "border-white/20 bg-white/10 text-white hover:bg-white/20 active:bg-white/20"
            }`}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <PauseIcon className="h-7 w-7" />
            ) : (
              <PlayIcon className="ml-1 h-7 w-7" />
            )}
          </button>

          <button
            onClick={handleNextTrack}
            className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
              isChinese 
                ? "text-stone-500 hover:bg-stone-200 hover:text-stone-700 active:bg-stone-200"
                : "text-zinc-400 hover:bg-white/5 hover:text-white active:bg-white/10"
            }`}
            aria-label="Next track"
          >
            <SkipNextIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Track indicator */}
        <div className="flex items-center justify-center gap-1">
          {tracks.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-4 rounded-full transition-all ${
                i === currentTrack
                  ? isChinese
                    ? "bg-red-600"
                    : "bg-white"
                  : isChinese
                    ? "bg-stone-300"
                    : "bg-zinc-700"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
