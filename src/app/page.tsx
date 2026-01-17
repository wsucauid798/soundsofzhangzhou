"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { PlayIcon, PauseIcon } from "@heroicons/react/24/solid";

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

const tracks = ["/music/song-1.mp3", "/music/song-2.mp3", "/music/song-3.mp3", "/music/song-4.mp3"];

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
      "本项目通过声音、图像和视频，捕捉漳州春节期间的城市脉动。从街道、转角到人行道，探索城市的节奏 — 它的质感、色彩、香气、喧嚣与氛围。",
      "这是一场感官之旅，深入热闘的庆典与灵性的时刻，将发现转化为纪录，让你得以看见、听见、感受漳州。",
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

export default function Home() {
  const [lang, setLang] = useState<"en" | "zh">("en");
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

  // Broadcast language to other components and update body class
  useEffect(() => {
    document.body.setAttribute("data-lang", lang);
  }, [lang]);

  // Listen for language changes from Header
  useEffect(() => {
    const handleLangChange = (e: CustomEvent<"en" | "zh">) => {
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
      const gap = 4;
      const barWidth = (width - gap * (bands - 1)) / bands;

      if (analyser && isPlaying) {
        analyser.getByteFrequencyData(dataArray);

        for (let i = 0; i < bands; i++) {
          // Map 16 bars across frequency bins 1-150 (where music actually lives)
          const binStart = Math.floor(1 + (i / bands) * 100);
          const binEnd = Math.floor(1 + ((i + 1) / bands) * 100);
          
          // Get max value in this range (peak detection)
          let maxVal = 0;
          for (let j = binStart; j < binEnd && j < dataArray.length; j++) {
            if (dataArray[j] > maxVal) maxVal = dataArray[j];
          }
          
          // Aggressive boost for higher frequencies (they naturally have less energy)
          const boost = 1 + Math.pow(i / bands, 0.7) * 3;
          const value = Math.min(255, maxVal * boost);
          
          const normalizedHeight = (value / 255) * height;
          const barHeight = Math.max(height * 0.08, Math.min(height * 0.95, normalizedHeight));

          const x = i * (barWidth + gap);
          
          let hue: number, sat: number, light: number;
          if (isChinese) {
            const color = cnyColors[i];
            hue = color.h;
            sat = color.s;
            light = color.l;
          } else {
            hue = 15 + i * 8;
            sat = 85;
            light = 50;
          }

          const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
          gradient.addColorStop(0, `hsl(${hue}, ${sat}%, ${light}%)`);
          gradient.addColorStop(1, `hsl(${hue}, ${sat}%, ${light + 15}%)`);

          ctx.fillStyle = gradient;
          ctx.shadowColor = `hsla(${hue}, ${sat}%, ${light}%, 0.5)`;
          ctx.shadowBlur = 10;
          
          ctx.beginPath();
          ctx.roundRect(x, height - barHeight, barWidth, barHeight, [4, 4, 0, 0]);
          ctx.fill();
        }
      } else {
        // Static bars
        for (let i = 0; i < bands; i++) {
          const x = i * (barWidth + gap);
          const barHeight = height * 0.06;
          
          ctx.fillStyle = isChinese ? "#c9b8a8" : "#3f3f46";
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
    const target = new Date("2026-03-02T00:00:00+08:00");
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

      <div className={`container mx-auto flex flex-1 flex-col justify-center px-4 py-4 ${isChinese ? "text-stone-900" : ""}`}>
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
        <div className={`prose prose-sm relative mx-auto mb-8 max-w-md sm:mb-10 prose-p:text-sm prose-p:leading-relaxed ${
          isChinese 
            ? "prose-p:text-stone-700" 
            : "prose-invert prose-zinc prose-p:text-zinc-400"
        }`}>
          {t.description.map((para, i) => (
            <p key={i} className="text-center">{para}</p>
          ))}
        </div>

        {/* Countdown */}
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
                ? "text-stone-500 hover:bg-stone-200 hover:text-stone-700" 
                : "text-zinc-400 active:bg-white/10"
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
                : "border-white/20 bg-white/10 text-white active:bg-white/20"
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
                ? "text-stone-500 hover:bg-stone-200 hover:text-stone-700" 
                : "text-zinc-400 active:bg-white/10"
            }`}
            aria-label="Next track"
          >
            <SkipNextIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Track dots */}
        <div className="flex justify-center gap-2">
          {tracks.map((_, i) => (
            <div
              key={i}
              className={`h-2 w-2 rounded-full transition-colors ${
                i === currentTrack
                  ? isChinese ? "bg-red-600" : "bg-orange-500"
                  : isChinese ? "bg-stone-300" : "bg-zinc-700"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
