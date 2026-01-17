interface MainProps {
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
  isMuted: boolean;
  volume: number;
  onToggleMute: () => void;
  onVolumeChange: (volume: number) => void;
}

export default function Main({
  description,
  launchIn,
  timeLeft,
  labels,
  isMuted,
  volume,
  onToggleMute,
  onVolumeChange,
}: MainProps) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-10 md:px-8 md:py-12 lg:px-12">
      {/* Project Description */}
      <div className="prose prose-invert mb-8 w-full max-w-sm text-center sm:mb-10 sm:max-w-xl md:mb-12 md:max-w-2xl lg:max-w-3xl">
        <p className="text-sm leading-relaxed text-zinc-300 sm:text-base md:text-lg lg:text-xl">
          {description}
        </p>
      </div>

      {/* Countdown */}
      <div className="mb-8 text-center sm:mb-10 md:mb-12">
        <h2 className="mb-4 text-base font-medium text-zinc-400 sm:mb-5 sm:text-lg md:mb-6">
          {launchIn}
        </h2>
        <div className="flex gap-2 text-center sm:gap-4 md:gap-6 lg:gap-8">
          <div className="flex flex-col">
            <span className="text-3xl font-bold tabular-nums sm:text-4xl md:text-5xl lg:text-6xl">
              {String(timeLeft.days).padStart(2, "0")}
            </span>
            <span className="mt-1 text-[0.625rem] uppercase tracking-wider text-zinc-500 sm:mt-2 sm:text-xs md:text-sm">
              {labels.days}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-bold tabular-nums sm:text-4xl md:text-5xl lg:text-6xl">
              {String(timeLeft.hours).padStart(2, "0")}
            </span>
            <span className="mt-1 text-[0.625rem] uppercase tracking-wider text-zinc-500 sm:mt-2 sm:text-xs md:text-sm">
              {labels.hours}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-bold tabular-nums sm:text-4xl md:text-5xl lg:text-6xl">
              {String(timeLeft.minutes).padStart(2, "0")}
            </span>
            <span className="mt-1 text-[0.625rem] uppercase tracking-wider text-zinc-500 sm:mt-2 sm:text-xs md:text-sm">
              {labels.minutes}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-bold tabular-nums sm:text-4xl md:text-5xl lg:text-6xl">
              {String(timeLeft.seconds).padStart(2, "0")}
            </span>
            <span className="mt-1 text-[0.625rem] uppercase tracking-wider text-zinc-500 sm:mt-2 sm:text-xs md:text-sm">
              {labels.seconds}
            </span>
          </div>
        </div>
      </div>

      {/* Audio Controls */}
      <div className="flex flex-wrap items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4 md:flex-nowrap md:gap-6 md:px-8">
        {/* Mute Toggle */}
        <button
          onClick={onToggleMute}
          className="transition-opacity hover:opacity-70"
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <svg
              className="h-5 w-5 sm:h-6 sm:w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
              />
            </svg>
          ) : (
            <svg
              className="h-5 w-5 sm:h-6 sm:w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
            </svg>
          )}
        </button>

        {/* Equalizer Animation */}
        <div className="flex h-5 items-end gap-1 sm:h-6">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="equalizer-bar w-1 bg-zinc-400"
              style={{
                animationDelay: `${i * 0.1}s`,
                opacity: isMuted ? 0.3 : 1,
              }}
            />
          ))}
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2 sm:gap-3">
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className="h-1 w-16 cursor-pointer appearance-none rounded-lg bg-zinc-700 accent-zinc-400 sm:w-20 md:w-24"
            aria-label="Volume"
          />
          <span className="w-7 text-xs tabular-nums text-zinc-400 sm:w-8 sm:text-sm">
            {volume}
          </span>
        </div>
      </div>
    </main>
  );
}
