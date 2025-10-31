import { useEffect, useState } from "react";
import splashImage from "@/assets/splash-screen.png";

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fade out after 1.3s
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 1300);

    // Complete after 1.5s
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 1500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] bg-background flex items-center justify-center transition-opacity duration-200 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="w-full h-full flex items-center justify-center p-6 animate-scale-in">
        <img
          src={splashImage}
          alt="等会吃啥"
          className="w-full h-full object-contain max-w-2xl"
        />
      </div>
    </div>
  );
};

export default SplashScreen;
