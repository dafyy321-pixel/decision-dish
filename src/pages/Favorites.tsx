import { useState, useEffect } from 'react';
import BottomNavBar from '@/components/BottomNavBar';
import { Heart, Trash2, MapPin, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Restaurant } from '@/data/restaurants';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function Favorites() {
  const [favorites, setFavorites] = useState<Restaurant[]>([]);
  const [showClearDialog, setShowClearDialog] = useState(false);

  // 从 localStorage 加载收藏列表
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

  // 删除单个收藏
  const handleRemove = (id: string) => {
    const updated = favorites.filter(item => item.id !== id);
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
  };

  // 清空所有收藏
  const handleClearAll = () => {
    setFavorites([]);
    localStorage.setItem('favorites', JSON.stringify([]));
    setShowClearDialog(false);
  };

  return (
    <>
      <div className="min-h-screen bg-background pb-32 pt-8 px-4">
        <div className="max-w-md w-full mx-auto px-6 py-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/10">
              <Heart className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              我的收藏
            </h1>
            <p className="text-muted-foreground">
              {favorites.length > 0 ? `已收藏 ${favorites.length} 家店铺` : '还没有收藏任何店铺'}
            </p>
          </div>

          {/* 收藏列表 */}
          {favorites.length > 0 ? (
            <>
              <Card className="border-primary/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary" />
                    收藏列表
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {favorites.map((restaurant) => (
                      <div
                        key={restaurant.id}
                        className="flex items-start justify-between p-4 rounded-lg bg-card border border-primary/10 hover:border-primary/30 transition-colors"
                      >
                        <div className="flex-1 space-y-1 min-w-0">
                          <div className="font-semibold text-foreground truncate">{restaurant.name}</div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground truncate">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{restaurant.address}</span>
                          </div>
                          {restaurant.category && (
                            <span className="inline-block px-2 py-0.5 rounded-full bg-accent/20 text-accent-foreground text-xs">
                              {restaurant.category}
                            </span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemove(restaurant.id)}
                          className="text-muted-foreground hover:text-destructive ml-2 flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
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
                清空所有收藏
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
                    <p className="text-muted-foreground">暂无收藏</p>
                    <p className="text-sm text-muted-foreground">
                      抽取结果后点击收藏按钮
                      <br />
                      即可保存喜欢的店铺
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 使用提示 */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Heart className="h-4 w-4 text-primary" />
                收藏功能说明
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <span className="text-primary font-semibold">•</span>
                  <span>在抽取结果页面点击爱心按钮收藏店铺</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-semibold">•</span>
                  <span>收藏的店铺会保存在本地，方便下次查看</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary font-semibold">•</span>
                  <span>点击垃圾桶图标可以删除单个收藏</span>
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
            <AlertDialogTitle>确认清空收藏？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将删除所有收藏的店铺，且无法恢复。
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
