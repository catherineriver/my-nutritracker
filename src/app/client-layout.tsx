"use client";
import { useState, useEffect } from "react";
import SplashScreen from "@/components/SplashScreen";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showSplash, setShowSplash] = useState(true);

  // Проверяем, показывался ли splash screen в этой сессии
  useEffect(() => {
    const hasShownSplash = sessionStorage.getItem('hasShownSplash');
    if (hasShownSplash) {
      setShowSplash(false);
    }
  }, []);

  const handleSplashFinish = () => {
    setShowSplash(false);
    sessionStorage.setItem('hasShownSplash', 'true');
  };

  return (
    <>
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
      <div className={showSplash ? 'invisible' : 'visible'}>
        {children}
      </div>
    </>
  );
}