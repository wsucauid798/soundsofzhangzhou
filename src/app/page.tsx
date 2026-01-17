"use client";

import { useState, useEffect } from "react";
import Header from "./components/Header";
import Main from "./components/Main";
import Footer from "./components/Footer";

export default function Home() {
  const [lang, setLang] = useState<"en" | "zh">("en");
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(70);

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
        "Sounds of Zhangzhou is a digital interactive installation that captures the pulse of the city during the Spring Festival. Through field recordings, images, and videos collected across Zhangzhou's streets, alleyways, and celebrations, the project explores a newcomer's fascination with the city's rhythm—its sounds, textures, and traditions. It's a celebration of the vibrant chaos, quiet corners, and fleeting moments that define life during one of China's most culturally charged seasons. This project transforms documentary into discovery, inviting others to hear, see, and feel Zhangzhou through the eyes—and ears—of a curious outsider.",
      launchIn: "Launch in",
      days: "days",
      hours: "hours",
      minutes: "minutes",
      seconds: "seconds",
      copyright: `© ${new Date().getFullYear()} Sounds of Zhangzhou. All rights reserved.`,
    },
    zh: {
      title: "漳州之声",
      description:
        "漳州之声是一个数字互动装置，捕捉春节期间城市的脉搏。通过在漳州的街道、小巷和庆祝活动中收集的现场录音、图像和视频，该项目探索了一个新来者对城市节奏的迷恋——它的声音、质感和传统。这是对充满活力的混乱、安静的角落和转瞬即逝的时刻的庆祝，这些时刻定义了中国文化最丰富的季节之一的生活。这个项目将纪录片转化为发现，邀请他人通过一个好奇的局外人的眼睛和耳朵来听、看和感受漳州。",
      launchIn: "发布倒计时",
      days: "天",
      hours: "时",
      minutes: "分",
      seconds: "秒",
      copyright: `© ${new Date().getFullYear()} 漳州之声。保留所有权利。`,
    },
  };

  const currentContent = content[lang];

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a] text-[#ededed]">
      <Header
        title={currentContent.title}
        lang={lang}
        onToggleLang={() => setLang(lang === "en" ? "zh" : "en")}
      />
      <Main
        description={currentContent.description}
        launchIn={currentContent.launchIn}
        timeLeft={timeLeft}
        labels={{
          days: currentContent.days,
          hours: currentContent.hours,
          minutes: currentContent.minutes,
          seconds: currentContent.seconds,
        }}
        isMuted={isMuted}
        volume={volume}
        onToggleMute={() => setIsMuted(!isMuted)}
        onVolumeChange={setVolume}
      />
      <Footer copyright={currentContent.copyright} />
    </div>
  );
}
