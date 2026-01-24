"use client";

import { useState, useEffect } from "react";

type Language = "en" | "zh";

export default function Footer({ initialLang = "en" }: { initialLang?: Language }) {
  const [lang, setLang] = useState<Language>(initialLang);
  const isChinese = lang === "zh";

  useEffect(() => {
    const handleLangChange = (e: CustomEvent<"en" | "zh">) => {
      setLang(e.detail);
    };
    window.addEventListener("langChange", handleLangChange as EventListener);
    return () => window.removeEventListener("langChange", handleLangChange as EventListener);
  }, []);

  return (
    <footer className="site-footer shrink-0 bg-transparent transition-colors">
      <div className={`container mx-auto border-t px-4 py-4 text-center ${
        isChinese ? "border-stone-300" : "border-white/10"
      }`}>
        <p className={`footer-text text-xs tracking-wide ${isChinese ? "text-stone-600" : "text-zinc-500"}`}>
          © {new Date().getFullYear()} William Sawyerr and Zhiling Zhang. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
