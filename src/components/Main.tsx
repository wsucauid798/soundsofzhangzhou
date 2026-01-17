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

interface MainProps {
  title: string;
  description: string;
  launchIn: string;
  timeLeft: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
  labels: {
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
  };
  isPlaying: boolean;
  audioFrequencies: number[];
  currentTrack: number;
  totalTracks: number;
  onPlayPause: () => void;
  onPrevTrack: () => void;
  onNextTrack: () => void;
}

export default function Main({
  title,
  description,
  launchIn,
  timeLeft,
  labels,
  isPlaying,
  audioFrequencies,
  currentTrack,
  totalTracks,
  onPlayPause,
  onPrevTrack,
  onNextTrack,
}: MainProps) {
  return (
    <main className="container mx-auto flex flex-1 flex-col justify-center px-4 py-4">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[200px] w-[80%] max-w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-[80px]"
        style={{
          background: isPlaying
            ? `radial-gradient(ellipse, rgba(249, 115, 22, 0.6) 0%, transparent 70%)`
            : `radial-gradient(ellipse, rgba(80, 80, 80, 0.4) 0%, transparent 70%)`,
        }}
      />

      {/* Title - Centered */}
      <h1
        className="relative mb-3 text-center text-3xl font-light tracking-wide text-white sm:text-4xl md:text-5xl"
        style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
      >
        {title}
      </h1>

      {/* Description - Centered */}
      <div className="prose prose-sm prose-invert prose-zinc relative mx-auto mb-8 max-w-md prose-p:text-zinc-400 prose-p:text-sm prose-p:leading-relaxed sm:mb-10">
        <p className="text-center">{description}</p>
      </div>

      {/* Countdown - Centered, more legible */}
      <div className="relative mb-12 text-center sm:mb-14">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.25em] text-zinc-500 sm:text-sm">
          {launchIn}
        </p>
        <div className="flex justify-center gap-4 sm:gap-6">
          {[
            { value: timeLeft.days, label: labels.days },
            { value: timeLeft.hours, label: labels.hours },
            { value: timeLeft.minutes, label: labels.minutes },
            { value: timeLeft.seconds, label: labels.seconds },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-3xl font-light tabular-nums text-zinc-100 sm:text-4xl md:text-5xl">
                {String(item.value).padStart(2, "0")}
              </span>
              <span className="mt-1 text-[10px] uppercase tracking-[0.1em] text-zinc-500 sm:text-xs">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Equalizer */}
      <div className="relative mx-auto mb-6 flex h-16 w-4/5 max-w-xs items-end gap-[2px] sm:h-20 sm:gap-1">
        {audioFrequencies.map((freq, i) => {
          const height = isPlaying ? Math.max(15, freq) : 15;
          const hue = 15 + i * 8;
          return (
            <div
              key={i}
              className="flex-1 rounded-t-sm transition-all duration-75"
              style={{
                height: `${height}%`,
                background: isPlaying
                  ? `linear-gradient(to top, hsl(${hue}, 90%, 50%), hsl(${hue}, 100%, 65%))`
                  : "linear-gradient(to top, #3f3f46, #52525b)",
                boxShadow: isPlaying
                  ? `0 0 8px hsl(${hue}, 90%, 50%, 0.3)`
                  : "none",
              }}
            />
          );
        })}
      </div>

      {/* Transport controls - Centered */}
      <div className="mb-2 flex items-center justify-center gap-2">
        <button
          onClick={onPrevTrack}
          className="flex h-12 w-12 items-center justify-center rounded-full text-zinc-400 active:bg-white/10"
          aria-label="Previous track"
        >
          <SkipPreviousIcon className="h-6 w-6" />
        </button>

        <button
          onClick={onPlayPause}
          className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white active:bg-white/20"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <PauseIcon className="h-7 w-7" />
          ) : (
            <PlayIcon className="ml-1 h-7 w-7" />
          )}
        </button>

        <button
          onClick={onNextTrack}
          className="flex h-12 w-12 items-center justify-center rounded-full text-zinc-400 active:bg-white/10"
          aria-label="Next track"
        >
          <SkipNextIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Track dots - Centered under controls */}
      <div className="mb-2 flex justify-center gap-2">
        {Array.from({ length: totalTracks }).map((_, i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-full transition-colors ${
              i === currentTrack ? "bg-orange-500" : "bg-zinc-700"
            }`}
          />
        ))}
      </div>
    </main>
  );
}
