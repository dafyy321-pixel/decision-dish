import { useState, useEffect } from "react";
import { presetRestaurants, Restaurant } from "@/data/restaurants";
import { useRestaurants } from "@/hooks/useRestaurants";
import ModeSelector from "@/components/ModeSelector";
import CustomListManager from "@/components/CustomListManager";
import DrawButton from "@/components/DrawButton";
import ResultDisplay from "@/components/ResultDisplay";
import SpinWheel from "@/components/SpinWheel";
import BottomNavBar from "@/components/BottomNavBar";
import FeedbackCard from "@/components/FeedbackCard";
import titleLogo from "@/assets/title-logo.png";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";

const STORAGE_KEY = "custom-restaurants";

const Index = () => {
  const [mode, setMode] = useState<"system" | "custom">("system");
  const [customItems, setCustomItems] = useState<Restaurant[]>([]);
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
          // 持上斗 - 兑换于旧的字符串数组格式
          const converted = parsed.map((item: string | Restaurant) => {
            if (typeof item === 'string') {
              return {
                id: `custom-${item}`,
                name: item,
                address: "",
                category: "自定义"
              };
            }
            return item as Restaurant;
          });
          setCustomItems(converted);
        }
      } catch (error) {
        console.error("Failed to load custom items:", error);
      }
    }
  }, []);

  // Save custom items to localStorage
  const handleCustomItemsChange = (items: Restaurant[]) => {
    setCustomItems(items);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  };

  const handleDraw = () => {
    // Validate
    if (mode === "custom" && customItems.length === 0) {
      toast.error("请先添加自定义店铺");
      return;
    }

    // 埋点：点击抽取按钮
    trackEvent('draw_clicked', {
      mode: mode,
      available_items: mode === "system" ? restaurants.length : customItems.length,
    });

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
    
    // 埋点：抽取结果展示
    if (result) {
      const resultName = typeof result === 'string' ? result : result.name;
      trackEvent('draw_result', {
        mode: mode,
        result: resultName,
      });
    }
    
    // 历史记录与统计的写入已统一在 ResultDisplay 中处理，避免重复保存
  };

  const handleDrawAgain = () => {
    // 埋点：再抽一次
    trackEvent('draw_again', {
      mode: mode,
    });
    
    setResult(null);
    setShowWheel(false);
  };

  return (
    <>
      {/* Spin Wheel Overlay */}
      {showWheel && result && (
        <SpinWheel
          items={mode === "system" ? restaurants.map(r => r.name) : customItems.map(r => r.name)}
          result={result}
          onComplete={handleWheelComplete}
        />
      )}

      <div className="min-h-screen bg-background flex items-center justify-center pb-24">
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

            {/* Feedback Card */}
            <FeedbackCard />

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
      
      {/* Bottom Navigation Bar */}
      <BottomNavBar />
    </>
  );
};

export default Index;
