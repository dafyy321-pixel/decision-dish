import { useEffect, useState } from "react";
import { Restaurant } from "@/data/restaurants";

interface SpinWheelProps {
  items: Restaurant[] | string[];
  result: Restaurant | string;
  onComplete: () => void;
}

const SpinWheel = ({ items, result, onComplete }: SpinWheelProps) => {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(true);

  useEffect(() => {
    // Find the index of the result
    const resultIndex = items.findIndex((item) => {
      if (typeof item === "string") {
        return item === result;
      } else if (typeof result !== "string") {
        return item.id === result.id;
      }
      return false;
    });

    // Calculate rotation: spin multiple times + land on result
    const degreesPerItem = 360 / items.length;
    const targetRotation = -(resultIndex * degreesPerItem);
    const spins = 5; // Number of full rotations before landing
    const finalRotation = spins * 360 + targetRotation;

    // Start spinning after a short delay
    setTimeout(() => {
      setRotation(finalRotation);
    }, 100);

    // Stop spinning and show result
    setTimeout(() => {
      setIsSpinning(false);
      setTimeout(() => {
        onComplete();
      }, 800);
    }, 4000);
  }, [items, result, onComplete]);

  const itemCount = items.length;
  const degreesPerItem = 360 / itemCount;

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="relative w-full max-w-md px-6">
        {/* Title */}
        <div className="text-center mb-8 animate-fade-in">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            正在抽取中...
          </h2>
          <p className="text-muted-foreground">请稍候</p>
        </div>

        {/* Wheel Container */}
        <div className="relative w-full aspect-square max-w-sm mx-auto">
          {/* Pointer/Arrow at top */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20">
            <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[30px] border-t-primary drop-shadow-lg" />
          </div>

          {/* Wheel */}
          <div className="relative w-full h-full rounded-full shadow-2xl overflow-hidden">
            {/* Rotating Wheel */}
            <div
              className="absolute inset-0 rounded-full transition-transform duration-[4000ms] ease-out"
              style={{
                transform: `rotate(${rotation}deg)`,
                transitionTimingFunction: "cubic-bezier(0.25, 0.1, 0.25, 1)",
              }}
            >
              {items.map((item, index) => {
                const rotation = index * degreesPerItem;
                const itemName = typeof item === "string" ? item : item.name;
                
                // Generate colors from design system
                const colors = [
                  "hsl(var(--primary))",
                  "hsl(var(--secondary))",
                  "hsl(var(--accent))",
                  "hsl(var(--primary) / 0.8)",
                  "hsl(var(--secondary) / 0.8)",
                  "hsl(var(--accent) / 0.8)",
                ];
                const bgColor = colors[index % colors.length];

                return (
                  <div
                    key={index}
                    className="absolute w-full h-full"
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      clipPath: `polygon(50% 50%, 50% 0%, ${
                        50 + 50 * Math.sin((degreesPerItem * Math.PI) / 180)
                      }% ${
                        50 - 50 * Math.cos((degreesPerItem * Math.PI) / 180)
                      }%)`,
                      backgroundColor: bgColor,
                    }}
                  >
                    <div
                      className="absolute top-[15%] left-1/2 -translate-x-1/2 w-32 text-center"
                      style={{
                        transform: `translateX(-50%) rotate(${
                          degreesPerItem / 2
                        }deg)`,
                      }}
                    >
                      <p className="text-xs font-semibold text-white drop-shadow-md line-clamp-2 break-words">
                        {itemName}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Center Circle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gradient-to-br from-primary via-primary/90 to-primary/70 shadow-xl border-4 border-white flex items-center justify-center z-10">
              <div className="text-white font-bold text-sm">抽奖中</div>
            </div>
          </div>

          {/* Glow Effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 via-transparent to-accent/20 pointer-events-none" />
        </div>

        {/* Sparkles Animation */}
        {isSpinning && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary rounded-full animate-ping" />
            <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-accent rounded-full animate-ping animation-delay-200" />
            <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-secondary rounded-full animate-ping animation-delay-400" />
          </div>
        )}
      </div>
    </div>
  );
};

export default SpinWheel;
