import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus, Star } from "lucide-react";
import { toast } from "sonner";
import { Restaurant } from "@/data/restaurants";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CustomListManagerProps {
  items: Restaurant[];
  onItemsChange: (items: Restaurant[]) => void;
}

const CustomListManager = ({ items, onItemsChange }: CustomListManagerProps) => {
  const [inputValue, setInputValue] = useState("");
  const [favorites, setFavorites] = useState<Restaurant[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);

  // 加载收藏列表
  useEffect(() => {
    const loadFavorites = () => {
      const stored = localStorage.getItem('favorites');
      if (stored) {
        try {
          setFavorites(JSON.parse(stored));
        } catch (e) {
          console.error('Failed to parse favorites:', e);
        }
      }
    };
    loadFavorites();
  }, []);

  const handleAdd = () => {
    if (!inputValue.trim()) {
      toast.error("请输入店铺名称");
      return;
    }
    if (items.some(item => item.name === inputValue.trim())) {
      toast.error("该店铺已存在");
      return;
    }
    if (items.length >= 20) {
      toast.error("最多添加20个店铺");
      return;
    }
    const newRestaurant: Restaurant = {
      id: `custom-${Date.now()}`,
      name: inputValue.trim(),
      address: "",
      category: "自定义"
    };
    onItemsChange([...items, newRestaurant]);
    setInputValue("");
    toast.success("添加成功");
  };

  const handleRemove = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onItemsChange(newItems);
    toast.success("删除成功");
  };

  // 从收藏添加店铺
  const handleAddFromFavorites = (restaurant: Restaurant) => {
    if (items.some(item => item.id === restaurant.id)) {
      toast.error("该店铺已存在");
      return;
    }
    if (items.length >= 20) {
      toast.error("最多添加20个店铺");
      return;
    }
    onItemsChange([...items, restaurant]);
    setShowFavorites(false);
    toast.success(`从收藏添加 ${restaurant.name} 成功`);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="输入店铺名称..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="flex-1 h-12 rounded-2xl border-2 border-border focus-visible:ring-primary"
        />
        <Button
          onClick={handleAdd}
          size="icon"
          className="h-12 w-12 rounded-2xl bg-primary hover:bg-primary/90"
        >
          <Plus className="w-5 h-5" />
        </Button>
        <Popover open={showFavorites} onOpenChange={setShowFavorites}>
          <PopoverTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              className="h-12 w-12 rounded-2xl border-2"
              disabled={favorites.length === 0}
            >
              <Star className="w-5 h-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <Card className="border-0">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Star className="w-4 h-4 text-accent" />
                  我的收藏
                </CardTitle>
              </CardHeader>
              <CardContent>
                {favorites.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground py-4">
                    还没有收藏任何店铺
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {favorites
                      .filter(fav => !items.some(item => item.id === fav.id))
                      .map((restaurant) => (
                        <div
                          key={restaurant.id}
                          className="flex items-start justify-between p-3 rounded-lg border border-border hover:border-primary/50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{restaurant.name}</div>
                            <div className="text-xs text-muted-foreground truncate">{restaurant.address}</div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleAddFromFavorites(restaurant)}
                            className="ml-2 flex-shrink-0"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    {favorites.filter(fav => !items.some(item => item.id === fav.id)).length === 0 && (
                      <div className="text-center text-sm text-muted-foreground py-4">
                        所有收藏都已添加到自定义列表
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </PopoverContent>
        </Popover>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="mb-2">还没有添加任何店铺</p>
          <p className="text-sm">快来添加你喜欢的店铺吧～</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="flex items-start justify-between p-3 bg-card rounded-2xl border border-border hover:border-primary/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="text-foreground font-medium truncate">{item.name}</div>
                {item.address && (
                  <div className="text-xs text-muted-foreground truncate">{item.address}</div>
                )}
                {item.category && (
                  <div className="text-xs text-muted-foreground">{item.category}</div>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 ml-2 flex-shrink-0"
                onClick={() => handleRemove(index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          已添加 {items.length}/20 个店铺
        </p>
      )}
    </div>
  );
};

export default CustomListManager;
