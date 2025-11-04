import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Restaurant } from "@/data/restaurants";
import { MapPin, RefreshCw, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ResultDisplayProps {
  result: Restaurant | string;
  mode: "system" | "custom";
  onDrawAgain: () => void;
}

const ResultDisplay = ({ result, mode, onDrawAgain }: ResultDisplayProps) => {
  const isRestaurant = typeof result !== "string";
  const { toast } = useToast();
  const [isFavorited, setIsFavorited] = useState(false);

  // 检查是否已收藏
  useEffect(() => {
    if (isRestaurant) {
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      setIsFavorited(favorites.some((fav: Restaurant) => fav.id === result.id));
    }
  }, [result, isRestaurant]);

  // 切换收藏状态
  const toggleFavorite = () => {
    if (!isRestaurant) return;

    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const index = favorites.findIndex((fav: Restaurant) => fav.id === result.id);

    if (index > -1) {
      // 已收藏，删除
      favorites.splice(index, 1);
      setIsFavorited(false);
      toast({
        title: "已取消收藏",
        description: `${result.name} 已从收藏列表移除`,
      });
    } else {
      // 未收藏，添加
      favorites.push(result);
      setIsFavorited(true);
      toast({
        title: "收藏成功",
        description: `${result.name} 已加入收藏列表`,
      });
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
  };

  // 组件挂载时保存历史记录
  useEffect(() => {
    if (result) {
      const history = JSON.parse(localStorage.getItem('draw_history') || '[]');
      const historyItem = {
        id: `${Date.now()}`,
        result: result,
        timestamp: new Date().toLocaleString('zh-CN'),
        mode: mode
      };

      history.unshift(historyItem);
      if (history.length > 100) {
        history.pop();
      }
      localStorage.setItem('draw_history', JSON.stringify(history));
      localStorage.setItem('last_draw_time', new Date().toLocaleString('zh-CN'));
      const totalDraws = parseInt(localStorage.getItem('total_draws') || '0');
      localStorage.setItem('total_draws', String(totalDraws + 1));
    }
  }, [result, mode]);

  return (
    <div className="animate-bounce-in">
      <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 rounded-3xl p-8 shadow-xl border-2 border-primary/20 mb-6">
        <div className="text-center space-y-4">
          <div className="text-sm text-muted-foreground font-medium">今天吃这个！</div>
          <div className="text-4xl font-bold text-foreground mb-2">
            {isRestaurant ? result.name : result}
          </div>
          {isRestaurant && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{result.address}</span>
            </div>
          )}
          {isRestaurant && result.category && (
            <div className="inline-block px-4 py-1 rounded-full bg-accent/20 text-accent-foreground text-sm font-medium">
              {result.category}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        {isRestaurant && mode === "system" && (
          <Button
            onClick={toggleFavorite}
            variant="outline"
            className={`h-14 rounded-3xl border-2 transition-all shadow-md ${
              isFavorited
                ? 'bg-primary/10 border-primary hover:bg-primary/20'
                : 'hover:bg-secondary hover:border-primary/50'
            }`}
          >
            <Heart
              className={`w-5 h-5 ${
                isFavorited ? 'fill-primary text-primary' : ''
              }`}
            />
          </Button>
        )}
        <Button
          onClick={onDrawAgain}
          variant="outline"
          className="flex-1 h-14 rounded-3xl border-2 hover:bg-secondary hover:border-primary/50 transition-all shadow-md"
          style={{
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.15), 0 0 0.5px rgba(255, 255, 255, 0.5)',
          }}
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          再抽一次
        </Button>
      </div>
    </div>
  );
};

export default ResultDisplay;
