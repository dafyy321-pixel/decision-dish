import { useState, useEffect } from "react";
import { presetRestaurants, Restaurant } from "@/data/restaurants";
import { useRestaurants } from "@/hooks/useRestaurants";
import ModeSelector from "@/components/ModeSelector";
import CustomListManager from "@/components/CustomListManager";
import DrawButton from "@/components/DrawButton";
import ResultDisplay from "@/components/ResultDisplay";
import SpinWheel from "@/components/SpinWheel";
import SplashScreen from "@/components/SplashScreen";
import titleLogo from "@/assets/title-logo.png";
import { toast } from "sonner";

const STORAGE_KEY = "custom-restaurants";

const Index = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [mode, setMode] = useState<"system" | "custom">("system");
  const [customItems, setCustomItems] = useState<string[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [result, setResult] = useState<Restaurant | string | null>(null);
  const [showWheel, setShowWheel] = useState(false);
  
  // 从 Supabase 获取餐厅数据
  const { data: supabaseRestaurants, isLoading } = useRestaurants();
  
  // 使用 Supabase 数据或本地预设数据
  const restaurants = supabaseRestaurants && supabaseRestaurants.length > 0 
    ? supabaseRestaurants.map(r => ({ id: r.id, name: r.name, address: r.address, category: r.category }))
    : presetRestaurants;
  
  // 调试：显示数据来源
  console.log('数据来源:', supabaseRestaurants && supabaseRestaurants.length > 0 ? 'Supabase' : '本地', '餐厅数量:', restaurants.length);

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
    setShowWheel(true);
    setResult(null);

    // Calculate result immediately for the wheel
    let selectedResult: Restaurant | string;
    if (mode === "system") {
      const randomIndex = Math.floor(Math.random() * restaurants.length);
      selectedResult = restaurants[randomIndex];
    } else {
      const randomIndex = Math.floor(Math.random() * customItems.length);
      selectedResult = customItems[randomIndex];
    }
    setResult(selectedResult);
  };

  const handleWheelComplete = () => {
    setShowWheel(false);
    setIsDrawing(false);
  };

  const handleDrawAgain = () => {
    setResult(null);
    setShowWheel(false);
  };

  return (
    <>
      {/* Splash Screen */}
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}

      {/* Spin Wheel Overlay */}
      {showWheel && result && (
        <SpinWheel
          items={mode === "system" ? restaurants : customItems}
          result={result}
          onComplete={handleWheelComplete}
        />
      )}

      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-6 py-8 space-y-6">
        {/* Header with Title Logo */}
        <div className="text-center space-y-1">
          <div className="relative inline-block">
            <img
              src={titleLogo}
              alt="等会吃啥"
              className="w-80 max-w-full mx-auto"
            />
          </div>
          <p className="text-muted-foreground">选择困难症？让我帮你决定～</p>
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
              <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl p-6 border-2 border-primary/20 shadow-md">
                <p className="text-center text-muted-foreground" style={{
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.15), 0 0 0.5px rgba(255, 255, 255, 0.5)',
                }}>
                  点击下方按钮,从{" "}
                  <span className="text-primary font-semibold" style={{
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.15), 0 0 0.5px rgba(255, 255, 255, 0.5)',
                  }}>
                    {restaurants.length} 家
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
    </>
  );
};

export default Index;
