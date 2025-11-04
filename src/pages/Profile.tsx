import { useState, useEffect } from 'react';
import BottomNavBar from '@/components/BottomNavBar';
import { BarChart3, Clock, Heart, Coffee, Flame } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Profile() {
  const [stats, setStats] = useState({
    totalDraws: 0,
    favoritesCount: 0,
    historyCount: 0,
    lastDrawTime: '',
    frequencyData: [] as Array<{ name: string; count: number }>
  });

  useEffect(() => {
    // 从 localStorage 加载统计数据
    const totalDraws = parseInt(localStorage.getItem('total_draws') || '0');
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const history = JSON.parse(localStorage.getItem('draw_history') || '[]');
    const lastDrawTime = localStorage.getItem('last_draw_time') || '还没有抽取记录';

    // 计算餐厅频率
    const frequencyMap = new Map<string, number>();
    history.forEach((item: { name: string; timestamp: string; mode: string }) => {
      const name = item.name || '';
      // 只计算有名字的项目
      if (name && name.trim()) {
        frequencyMap.set(name, (frequencyMap.get(name) || 0) + 1);
      }
    });

    // 转换为数组并按频率排序，排除空名字
    const frequencyData = Array.from(frequencyMap.entries())
      .map(([name, count]) => ({ name, count }))
      .filter(item => item.name && item.name.trim())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // 只显示前 5 个

    setStats({
      totalDraws,
      favoritesCount: favorites.length,
      historyCount: history.length,
      lastDrawTime,
      frequencyData
    });
  }, []);

  return (
    <>
      <div className="min-h-screen bg-background pb-32 pt-8 px-4">
        <div className="max-w-md w-full mx-auto px-6 py-8 space-y-6">
          {/* 标题 */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              个人中心
            </h1>
            <p className="text-muted-foreground">
              你的小助手，一直在这里
            </p>
          </div>

          {/* 使用统计 */}
          <Card className="border-primary/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                使用统计
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-primary">{stats.totalDraws}</div>
                  <div className="text-xs text-muted-foreground">抽取次数</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-primary">{stats.favoritesCount}</div>
                  <div className="text-xs text-muted-foreground">收藏店铺</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-primary">{stats.historyCount}</div>
                  <div className="text-xs text-muted-foreground">历史记录</div>
                </div>
              </div>
              
              {stats.lastDrawTime && (
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>最后抽取：{stats.lastDrawTime}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 使用频率统计 */}
          {stats.frequencyData.length > 0 && (
            <Card className="border-primary/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-primary" />
                  最常选择
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.frequencyData.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                            {index + 1}
                          </div>
                          <span className="text-sm text-foreground font-medium truncate">{item.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-primary ml-2 flex-shrink-0">{item.count}次</span>
                      </div>
                      <div className="h-2 bg-primary/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all" 
                          style={{ width: `${(item.count / Math.max(...stats.frequencyData.map(d => d.count), 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 关于应用 */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coffee className="h-5 w-5 text-primary" />
                关于应用
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">应用名称</span>
                  <span className="font-semibold">岭师专用（首的守金校区）</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">版本号</span>
                  <span className="font-semibold">v1.0.0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">适用范围</span>
                  <span className="font-semibold">岭南师院附近</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 功能介绍 */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                主要功能
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">1</span>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">智能抽取</div>
                    <div className="text-xs">随机从岭师附近店铺中抽取，告别选择困难</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">2</span>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">收藏管理</div>
                    <div className="text-xs">收藏喜欢的店铺，下次直接查看</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">3</span>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">历史记录</div>
                    <div className="text-xs">记录每次抽取结果，方便回顾</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
      
      <BottomNavBar />
    </>
  );
}
