import { useEffect, useState } from "react";
import { Restaurant } from "@/data/restaurants";

interface SpinWheelProps {
  items: Restaurant[] | string[];
  result: Restaurant | string;
  onComplete: () => void;
}

const SpinWheel = ({ items, result, onComplete }: SpinWheelProps) => {
  const [isSpinning, setIsSpinning] = useState(true);

  useEffect(() => {
    // Spin for 1 second, then wait 0.3 second before completing
    const spinTimer = setTimeout(() => {
      setIsSpinning(false);
    }, 1500);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 1300);

    return () => {
      clearTimeout(spinTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  const segmentCount = 12; // 固定12个扇形

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="relative w-full max-w-md px-6">
        {/* Title */}
        <div className="text-center mb-8 animate-fade-in">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            🍽️ 正在抽取中...
          </h2>
          <p className="text-muted-foreground text-lg">请稍候</p>
        </div>

        {/* Wheel Container */}
        <div className="relative w-full aspect-square max-w-sm mx-auto">
          {/* Pointer/Arrow at top */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20">
            <div className="w-0 h-0 border-l-[24px] border-l-transparent border-r-[24px] border-r-transparent border-t-[36px] border-t-primary drop-shadow-2xl" />
          </div>

          {/* Wheel - Perfect Circle */}
          <div className="relative w-full h-full rounded-full shadow-2xl">
            {/* Rotating Wheel with continuous fast spin */}
            <div
              className={`absolute inset-0 rounded-full transition-all duration-300 ${
                isSpinning ? "animate-spin blur-sm" : "blur-0"
              }`}
              style={{
                animationDuration: isSpinning ? "0.5s" : "0s",
              }}
            >
              {/* Create segments with gradient colors */}
              {Array.from({ length: segmentCount }).map((_, index) => {
                const degreesPerSegment = 360 / segmentCount;
                const rotation = index * degreesPerSegment;
                
                // Create gradient from green to orange
                const gradientAngle = 135 + (index * 30); // Vary the angle
                const bgGradient = `linear-gradient(${gradientAngle}deg, hsl(110 38% 71%), hsl(30 88% 69%))`;

                return (
                  <div
                    key={index}
                    className="absolute w-full h-full"
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      clipPath: `polygon(50% 50%, 50% 0%, ${
                        50 + 50 * Math.sin((degreesPerSegment * Math.PI) / 180)
                      }% ${
                        50 - 50 * Math.cos((degreesPerSegment * Math.PI) / 180)
                      }%)`,
                      background: bgGradient,
                    }}
                  />
                );
              })}
            </div>

            {/* White border to make it perfectly circular */}
            <div className="absolute inset-0 rounded-full border-8 border-white pointer-events-none" />

            {/* Center Circle */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full bg-white shadow-2xl border-4 border-white flex items-center justify-center z-10 transition-all duration-300 ${
              isSpinning ? "" : ""
            }`}>
              <img 
                src="/favicon.png" 
                alt="等会吃啥"
                className={`w-20 h-20 transition-all duration-300 ${
                  isSpinning ? "" : "animate-bounce"
                }`}
              />
            </div>
          </div>

          {/* Soft glow effect matching theme */}
          <div className="absolute inset-0 rounded-full shadow-[0_0_60px_rgba(162,210,154,0.4)] pointer-events-none" />
        </div>

        {/* Decorative elements */}
        {isSpinning && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 text-2xl animate-ping">✨</div>
            <div className="absolute top-1/3 right-1/4 text-2xl animate-ping animation-delay-200">🌟</div>
            <div className="absolute bottom-1/3 left-1/3 text-2xl animate-ping animation-delay-400">⭐</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpinWheel;
