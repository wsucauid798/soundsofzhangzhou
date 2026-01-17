"use client";

import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import Main from "@/components/Main";
import Footer from "@/components/Footer";

export default function Home() {
  const [lang, setLang] = useState<"en" | "zh">("en");
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(5);
  const [audioFrequencies, setAudioFrequencies] = useState<number[]>(
    Array(16).fill(0)
  );
  const [currentTrack, setCurrentTrack] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>(0);

  const tracks = [
    "/music/song-1.mp3",
    "/music/song-2.mp3",
    "/music/song-3.mp3",
  ];

  // Initialize Web Audio API
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const initAudio = () => {
      if (audioContextRef.current) return;

      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyserRef.current = analyser;

      const source = audioContext.createMediaElementSource(audio);

      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.7;

      source.connect(analyser);
      analyser.connect(audioContext.destination);
    };

    // Initialize on first user interaction
    const handleInteraction = () => {
      initAudio();
      document.removeEventListener("click", handleInteraction);
    };
    document.addEventListener("click", handleInteraction);

    return () => {
      document.removeEventListener("click", handleInteraction);
    };
  }, []);

  // Equalizer animation loop
  useEffect(() => {
    const updateFrequencies = () => {
      const analyser = analyserRef.current;
      if (!analyser || !isPlaying) {
        animationRef.current = requestAnimationFrame(updateFrequencies);
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      // Use logarithmic distribution for more natural audio visualization
      const bands = 16;
      const barData: number[] = [];
      
      // Logarithmic frequency bands (more resolution in bass/mids)
      for (let i = 0; i < bands; i++) {
        const lowFreq = Math.pow(i / bands, 1.5) * bufferLength;
        const highFreq = Math.pow((i + 1) / bands, 1.5) * bufferLength;
        const start = Math.floor(lowFreq);
        const end = Math.min(Math.floor(highFreq), bufferLength);
        
        let sum = 0;
        const count = Math.max(1, end - start);
        for (let j = start; j < end; j++) {
          sum += dataArray[j];
        }
        const average = sum / count;
        // Boost higher frequencies which tend to be quieter
        const boost = 1 + (i / bands) * 0.5;
        const amplified = Math.min(100, (average / 255) * 150 * boost);
        barData.push(amplified);
      }

      setAudioFrequencies(barData);
      animationRef.current = requestAnimationFrame(updateFrequencies);
    };

    animationRef.current = requestAnimationFrame(updateFrequencies);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying]);

  // Play/Pause
  const handlePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audioContextRef.current?.state === "suspended") {
      await audioContextRef.current.resume();
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (err) {
        console.log("Playback failed:", err);
      }
    }
  };

  // Previous track
  const handlePrevTrack = () => {
    setCurrentTrack((prev) => (prev - 1 + tracks.length) % tracks.length);
  };

  // Next track
  const handleNextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % tracks.length);
  };

  // Handle track ended - loop to next
  const handleTrackEnded = () => {
    setCurrentTrack((prev) => (prev + 1) % tracks.length);
  };

  // Auto-play when track changes (if was playing)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.load();
    if (isPlaying) {
      audio.play().catch(() => {});
    }
  }, [currentTrack]);

  // Update volume/mute
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume / 100;
      audio.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Countdown to 02 March 2026 00:00:00 CST (China Standard Time = UTC+8)
  useEffect(() => {
    const targetDate = new Date("2026-03-02T00:00:00+08:00");

    const updateCountdown = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const content = {
    en: {
      title: "Sounds of Zhangzhou",
      description:
        "A digital interactive installation that captures the pulse of the city during the Spring Festival. Through field recordings, images, and videos collected across Zhangzhou's streets, alleyways, and celebrations, this project explores a newcomer's fascination with the city's rhythm—its sounds, textures, and traditions.",
      launchIn: "Launches in",
      days: "days",
      hours: "hours",
      minutes: "min",
      seconds: "sec",
      copyright: `© ${new Date().getFullYear()} Sounds of Zhangzhou`,
    },
    zh: {
      title: "Sounds of Zhangzhou",
      description:
        "一个捕捉春节期间城市脉搏的数字互动装置。通过在漳州的街道、小巷和庆祝活动中收集的现场录音、图像和视频，该项目探索了一个新来者对城市节奏的迷恋——它的声音、质感和传统。",
      launchIn: "发布倒计时",
      days: "天",
      hours: "时",
      minutes: "分",
      seconds: "秒",
      copyright: `© ${new Date().getFullYear()} 漳州之声`,
    },
  };

  const currentContent = content[lang];

  return (
    <div className="relative flex min-h-screen flex-col bg-[#050505] text-[#ededed]">
      {/* Background gradient */}
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50" />

      {/* Audio element */}
      <audio ref={audioRef} src={tracks[currentTrack]} onEnded={handleTrackEnded} />

      <Header
        lang={lang}
        onToggleLang={() => setLang(lang === "en" ? "zh" : "en")}
        isMuted={isMuted}
        volume={volume}
        onToggleMute={() => setIsMuted(!isMuted)}
        onVolumeChange={setVolume}
      />

      <Main
        title={currentContent.title}
        description={currentContent.description}
        launchIn={currentContent.launchIn}
        timeLeft={timeLeft}
        labels={{
          days: currentContent.days,
          hours: currentContent.hours,
          minutes: currentContent.minutes,
          seconds: currentContent.seconds,
        }}
        isPlaying={isPlaying}
        audioFrequencies={audioFrequencies}
        currentTrack={currentTrack}
        totalTracks={tracks.length}
        onPlayPause={handlePlayPause}
        onPrevTrack={handlePrevTrack}
        onNextTrack={handleNextTrack}
      />

      <Footer copyright={currentContent.copyright} />
    </div>
  );
}
