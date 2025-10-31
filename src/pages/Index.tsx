import { useState, useEffect } from "react";
import { presetRestaurants, Restaurant } from "@/data/restaurants";
import ModeSelector from "@/components/ModeSelector";
import CustomListManager from "@/components/CustomListManager";
import DrawButton from "@/components/DrawButton";
import ResultDisplay from "@/components/ResultDisplay";
import heroCharacter from "@/assets/hero-character.png";
import { toast } from "sonner";

const STORAGE_KEY = "custom-restaurants";

const Index = () => {
  const [mode, setMode] = useState<"system" | "custom">("system");
  const [customItems, setCustomItems] = useState<string[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [result, setResult] = useState<Restaurant | string | null>(null);

  // Load custom items from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setCustomItems(parsed);
        }
      } catch (error) {
        console.error("Failed to load custom items:", error);
      }
    }
  }, []);

  // Save custom items to localStorage
  const handleCustomItemsChange = (items: string[]) => {
    setCustomItems(items);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  };

  const handleDraw = () => {
    // Validate
    if (mode === "custom" && customItems.length === 0) {
      toast.error("请先添加自定义店铺");
      return;
    }

    setIsDrawing(true);
    setResult(null);

    // Simulate drawing animation
    setTimeout(() => {
      if (mode === "system") {
        const randomIndex = Math.floor(Math.random() * presetRestaurants.length);
        setResult(presetRestaurants[randomIndex]);
      } else {
        const randomIndex = Math.floor(Math.random() * customItems.length);
        setResult(customItems[randomIndex]);
      }
      setIsDrawing(false);
    }, 1500);
  };

  const handleDrawAgain = () => {
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-6 py-8 space-y-6">
        {/* Header with Hero Character */}
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <img
              src={heroCharacter}
              alt="Cute mascot"
              className="w-32 h-32 mx-auto animate-float"
            />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">等会吃啥</h1>
            <p className="text-muted-foreground">选择困难症？让我帮你决定～</p>
          </div>
        </div>

        {/* Mode Selector */}
        {!result && <ModeSelector mode={mode} onModeChange={setMode} />}

        {/* Main Content */}
        {result ? (
          <ResultDisplay result={result} mode={mode} onDrawAgain={handleDrawAgain} />
        ) : (
          <div className="space-y-6">
            {/* Custom List Manager */}
            {mode === "custom" && (
              <div className="bg-card rounded-3xl p-6 shadow-md border border-border">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  自定义店铺列表
                </h2>
                <CustomListManager
                  items={customItems}
                  onItemsChange={handleCustomItemsChange}
                />
              </div>
            )}

            {/* System Mode Description */}
            {mode === "system" && (
              <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl p-6 border border-primary/10">
                <p className="text-center text-muted-foreground">
                  点击下方按钮，从{" "}
                  <span className="text-primary font-semibold">
                    {presetRestaurants.length} 家
                  </span>{" "}
                  精选店铺中随机抽取
                </p>
              </div>
            )}

            {/* Draw Button */}
            <DrawButton
              onClick={handleDraw}
              isDrawing={isDrawing}
              disabled={mode === "custom" && customItems.length === 0}
            />
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pt-4">
          <p>吃饭愉快 🍱</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
