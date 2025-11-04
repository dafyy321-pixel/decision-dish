import { useState, useEffect } from 'react';
import BottomNavBar from '@/components/BottomNavBar';
import { Clock, Trash2, MapPin, AlertCircle, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Restaurant } from '@/data/restaurants';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface HistoryItem {
  id?: string;
  result?: Restaurant | string;
  name?: string;
  timestamp: string;
  mode: 'system' | 'custom';
}

export default function History() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [favorited, setFavorited] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // 从 localStorage 加载历史记录和收藏
  useEffect(() => {
    const loadHistory = () => {
      const stored = localStorage.getItem('draw_history');
      if (stored) {
        try {
          const data = JSON.parse(stored) as Array<any>;
          // 转换数据格式以确保兼容性
          const converted = data.map((item, index) => ({
            id: item.id || `history-${index}`,
            result: item.result || item.name,
            name: item.name,
            timestamp: item.timestamp,
            mode: item.mode || 'system'
          }));
          setHistory(converted);
        } catch (e) {
          console.error('Failed to parse history:', e);
        }
      }
    };
    const loadFavorited = () => {
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      const favSet = new Set(favorites.map((fav: Restaurant) => fav.id));
      setFavorited(favSet);
    };
    loadHistory();
    loadFavorited();
  }, []);

  // 删除单个历史记录
  const handleRemove = (id: string) => {
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem('draw_history', JSON.stringify(updated));
  };

  // 清空所有历史记录
  const handleClearAll = () => {
    setHistory([]);
    localStorage.setItem('draw_history', JSON.stringify([]));
    setShowClearDialog(false);
  };

  // 判断是否为餐厅对象
  const isRestaurant = (item: Restaurant | string): item is Restaurant => {
    return typeof item === 'object' && item !== null && 'id' in item;
  };

  // 收藏店铺
  const handleFavorite = (item: Restaurant | string) => {
    if (!isRestaurant(item)) {
      toast({
        title: "提示",
        description: "只能收藏系统店铺",
      });
      return;
    }

    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const index = favorites.findIndex((fav: Restaurant) => fav.id === item.id);

    if (index > -1) {
      // 已收藏，取消收藏
      favorites.splice(index, 1);
      setFavorited(prev => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });
      toast({
        title: "已取消收藏",
        description: `${item.name} 已从收藏列表移除`,
      });
    } else {
      // 未收藏，添加收藏
      favorites.push(item);
      setFavorited(prev => new Set(prev).add(item.id));
      toast({
        title: "收藏成功",
        description: `${item.name} 已加入收藏列表`,
      });
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
  };

  return (
    <>
      <div className="min-h-screen bg-background pb-32 pt-8 px-4">
        <div className="max-w-md w-full mx-auto px-6 py-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/10">
              <Clock className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              历史记录
            </h1>
            <p className="text-muted-foreground">
              {history.length > 0 ? `共有 ${history.length} 条记录` : '还没有抽取任何记录'}
            </p>
          </div>

          {/* 历史记录列表 */}
          {history.length > 0 ? (
            <>
              <Card className="border-primary/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    抽取记录
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {history.map((item) => {
                      const restaurant = isRestaurant(item.result) ? item.result : null;
                      const displayName = item.result ? (typeof item.result === 'string' ? item.result : item.result.name) : item.name;
                      return (
                        <div
                          key={item.id}
                          className="flex items-start justify-between p-4 rounded-lg bg-card border border-primary/10 hover:border-primary/30 transition-colors"
                        >
                          <div className="flex-1 space-y-1 min-w-0">
                            <div className="font-semibold text-foreground truncate">
                              {displayName}
                            </div>
                            {restaurant && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground truncate">
                                <MapPin className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{restaurant.address}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3 flex-shrink-0" />
                              <span>{item.timestamp}</span>
                            </div>
                            {restaurant && restaurant.category && (
                              <span className="inline-block px-2 py-0.5 rounded-full bg-accent/20 text-accent-foreground text-xs">
                                {restaurant.category}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-1 ml-2 flex-shrink-0">
                            {restaurant && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleFavorite(item.result)}
                                className={`${
                                  favorited.has(restaurant.id)
                                    ? 'text-primary'
                                    : 'text-muted-foreground hover:text-primary'
                                }`}
                              >
                                <Heart
                                  className="w-4 h-4"
                                  fill={favorited.has(restaurant.id) ? 'currentColor' : 'none'}
                                />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemove(item.id)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* 清空按钮 */}
              <Button
                variant="outline"
                onClick={() => setShowClearDialog(true)}
                className="w-full h-14 rounded-3xl border-2 hover:bg-secondary hover:border-primary/50 transition-all shadow-md"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                清空所有记录
              </Button>
            </>
          ) : (
            <Card className="border-primary/20">
              <CardContent className="py-12">
                <div className="text-center space-y-4">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto">
                    <AlertCircle className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-muted-foreground">暂无记录</p>
                    <p className="text-sm text-muted-foreground">
                      点击首页的抽取按钮
                      <br />
                      即可开始记录每次抽取
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 功能说明 */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4 text-primary" />
                历史记录说明
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <span className="text-primary font-semibold">•</span>
                  <span>每次抽取都会自动保存到历史记录</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-semibold">•</span>
                  <span>最多保存最近 100 条记录</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-semibold">•</span>
                  <span>点击垃圾桶图标可以删除单条记录</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 清空确认对话框 */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认清空历史记录？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将删除所有历史记录，且无法恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              确认清空
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <BottomNavBar />
    </>
  );
}
