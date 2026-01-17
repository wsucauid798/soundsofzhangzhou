interface HeaderProps {
  title: string;
  lang: "en" | "zh";
  onToggleLang: () => void;
}

export default function Header({ title, lang, onToggleLang }: HeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6 sm:py-4 md:px-8 lg:px-12">
      <h1 className="text-lg font-semibold tracking-tight sm:text-xl md:text-2xl lg:text-3xl">
        {title}
      </h1>
      <button
        onClick={onToggleLang}
        className="rounded-md border border-white/20 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-white/10 sm:px-4 sm:py-2 sm:text-sm"
        aria-label="Toggle language"
      >
        {lang === "en" ? "中文" : "EN"}
      </button>
    </header>
  );
}
