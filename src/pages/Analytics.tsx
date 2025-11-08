import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Download, Trash2, Users, Clock, ArrowLeft, RefreshCw } from 'lucide-react';
import { 
  getUserId, 
  getFirstVisitTime, 
  getUTMParams,
  EventData
} from '@/lib/analytics';
import { getAnalyticsSummary } from '@/lib/analytics-supabase';
import { toast } from 'sonner';

export default function Analytics() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [userId] = useState(getUserId());
  const [firstVisit] = useState(getFirstVisitTime());
  const [utmParams] = useState(getUTMParams());
  const [loading, setLoading] = useState(true);
  const [supabaseData, setSupabaseData] = useState<any>(null);

  // 加载 Supabase 数据（所有用户）
  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAnalyticsSummary();
      if (data) {
        setSupabaseData(data);
        setEvents(data.allEvents.slice(0, 10)); // 最近10条
        toast.success('数据加载成功！');
      } else {
        toast.error('无法加载数据');
      }
    } catch (err) {
      console.error('加载数据失败:', err);
      toast.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 使用 Supabase 数据（所有用户）
  const stats = supabaseData ? {
    totalEvents: supabaseData.summary.totalEvents,
    drawCount: supabaseData.summary.drawCount,
    shareCount: supabaseData.summary.shareCount,
    favoriteCount: events.filter(e => e.event_type === 'favorite_added').length,
    totalUV: supabaseData.summary.totalUV,
  } : {
    totalEvents: 0,
    drawCount: 0,
    shareCount: 0,
    favoriteCount: 0,
    totalUV: 0,
  };

  // 关键指标（所有用户）
  const keyMetrics = supabaseData ? {
    todayUV: supabaseData.summary.todayUV,
    conversionRate: supabaseData.summary.conversionRate,
    shareRate: supabaseData.summary.shareRate,
    activeUsers: supabaseData.summary.activeUsers,
  } : {
    todayUV: 0,
    conversionRate: 0,
    shareRate: 0,
    activeUsers: 0,
  };

  // 渠道统计（所有用户）
  const channelStats = supabaseData?.channelStats || {};

  // 导出数据
  const handleExport = () => {
    if (!supabaseData) {
      toast.error('没有数据可导出');
      return;
    }
    const data = JSON.stringify(supabaseData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_all_users_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('数据已导出！');
  };

  // 刷新数据
  const handleRefresh = () => {
    loadData();
  };

  // 活跃时段统计（所有用户）
  const activeHours = supabaseData?.activeHours || {};

  // 找出最活跃的时段
  const mostActiveHour = Object.keys(activeHours).length > 0
    ? Object.entries(activeHours).sort(([, a], [, b]) => b - a)[0]
    : null;

  // 事件类型中文映射
  const eventTypeMap: Record<string, string> = {
    'app_launch': '📱 打开应用',
    'page_view': '👀 浏览页面',
    'mode_selected': '🎯 切换模式',
    'draw_clicked': '🎲 点击抽取',
    'draw_result': '✨ 展示结果',
    'draw_again': '🔄 再抽一次',
    'share_clicked': '📤 点击分享',
    'favorite_added': '❤️ 添加收藏',
    'favorite_removed': '💔 取消收藏',
  };

  // 格式化事件属性为易读文本
  const formatProperties = (event: EventData): string => {
    if (!event.properties) return '';
    const props = event.properties;
    
    if (event.event_type === 'mode_selected') {
      return props.mode === 'system' ? '→ 系统推荐' : '→ 自定义';
    }
    if (event.event_type === 'draw_result') {
      return `→ ${props.result}`;
    }
    if (event.event_type === 'share_clicked') {
      const platformMap: Record<string, string> = {
        'wechat': '微信',
        'qq': 'QQ',
        'copy_link': '复制链接'
      };
      return `→ ${platformMap[props.platform] || props.platform}`;
    }
    if (event.event_type === 'favorite_added' || event.event_type === 'favorite_removed') {
      return `→ ${props.restaurant_name}`;
    }
    return '';
  };

  return (
    <div className="min-h-screen bg-background pb-8 pt-8 px-4">
      <div className="max-w-md w-full mx-auto space-y-6">
        {/* 返回按钮 */}
        <Button
          variant="ghost"
          className="-ml-2"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回
        </Button>

        {/* 标题 */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <BarChart className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">数据统计</h1>
          </div>
          <p className="text-muted-foreground">所有用户的实时数据汇总</p>
          {loading && <p className="text-sm text-primary">加载中...</p>}
        </div>

          {/* 统计概览 */}
          <Card className="border-2 border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  全局概览
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={loading}
                  className="h-8"
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                  刷新
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-primary/10 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{stats.totalUV}</div>
                  <div className="text-xs text-muted-foreground mt-1">总用户数</div>
                </div>
                <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalEvents}</div>
                  <div className="text-xs text-muted-foreground mt-1">总事件数</div>
                </div>
              </div>
              <div className="pt-2 border-t text-xs text-muted-foreground">
                <p>• 数据来源：Supabase（所有用户）</p>
                <p>• 你的用户ID: {userId.substring(0, 15)}...</p>
                {Object.keys(utmParams).length > 0 && (
                  <p>• 你的来源: {utmParams.utm_source || 'direct'}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 关键运营指标 */}
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📊 关键运营指标
              </CardTitle>
              <CardDescription>每天必看的核心数据</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* UV */}
                <div className="flex justify-between items-center p-3 bg-blue-500/10 rounded-lg">
                  <div>
                    <div className="text-sm text-muted-foreground">UV（今日独立访客）</div>
                    <div className="text-xs text-muted-foreground mt-1">目标: Day1:10 → Day7:50+</div>
                  </div>
                  <div className="text-3xl font-bold text-blue-600">{keyMetrics.todayUV}</div>
                </div>
                
                {/* 转化率 */}
                <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg">
                  <div>
                    <div className="text-sm text-muted-foreground">转化率（打开后实际使用）</div>
                    <div className="text-xs text-muted-foreground mt-1">目标: &gt;60%</div>
                  </div>
                  <div className="text-3xl font-bold text-green-600">{keyMetrics.conversionRate.toFixed(1)}%</div>
                </div>

                {/* 分享率 */}
                <div className="flex justify-between items-center p-3 bg-purple-500/10 rounded-lg">
                  <div>
                    <div className="text-sm text-muted-foreground">分享率（使用后分享）</div>
                    <div className="text-xs text-muted-foreground mt-1">目标: &gt;10%</div>
                  </div>
                  <div className="text-3xl font-bold text-purple-600">{keyMetrics.shareRate.toFixed(1)}%</div>
                </div>

                {/* 留存率 */}
                <div className="flex justify-between items-center p-3 bg-orange-500/10 rounded-lg">
                  <div>
                    <div className="text-sm text-muted-foreground">留存率</div>
                    <div className="text-xs text-muted-foreground mt-1">目标: Day2:40% / Day7:20%</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-orange-600">Day2: {keyMetrics.retention2.toFixed(1)}%</div>
                    <div className="text-sm font-semibold text-orange-600">Day7: {keyMetrics.retention7.toFixed(1)}%</div>
                  </div>
                </div>

                {/* 有效用户 */}
                <div className="flex justify-between items-center p-3 bg-pink-500/10 rounded-lg">
                  <div>
                    <div className="text-sm text-muted-foreground">有效用户（本周抽取≥1次）</div>
                    <div className="text-xs text-muted-foreground mt-1">核心使用人群</div>
                  </div>
                  <div className="text-3xl font-bold text-pink-600">{keyMetrics.activeUsers}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 渠道来源分析 */}
          {Object.keys(channelStats).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>📡 渠道来源分析</CardTitle>
                <CardDescription>UTM参数追踪统计</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(channelStats)
                    .sort(([, a], [, b]) => b - a)
                    .map(([channel, count]) => {
                      const total = Object.values(channelStats).reduce((a, b) => a + b, 0);
                      const percentage = ((count / total) * 100).toFixed(1);
                      const channelNames: Record<string, string> = {
                        'canteen': '🍴 食堂地推',
                        'biaobai': '💌 表白墙',
                        'qzone': '💙 QQ空间',
                        'kol': '🌟 KOL推广',
                        'dorm': '🏠 宿舍楼',
                        'direct': '🔗 直接访问'
                      };
                      
                      return (
                        <div key={channel} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{channelNames[channel] || channel}</span>
                            <span className="font-medium">{count} ({percentage}%)</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 基础数据统计 */}
          <Card>
            <CardHeader>
              <CardTitle>基础数据</CardTitle>
              <CardDescription>你的使用统计</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary/10 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-primary">{stats.totalEvents}</div>
                  <div className="text-xs text-muted-foreground mt-1">总事件数</div>
                </div>
                <div className="bg-blue-500/10 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600">{stats.drawCount}</div>
                  <div className="text-xs text-muted-foreground mt-1">抽取次数</div>
                </div>
                <div className="bg-green-500/10 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-green-600">{stats.shareCount}</div>
                  <div className="text-xs text-muted-foreground mt-1">分享次数</div>
                </div>
                <div className="bg-pink-500/10 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-pink-600">{stats.favoriteCount}</div>
                  <div className="text-xs text-muted-foreground mt-1">收藏次数</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 活跃时段 */}
          {mostActiveHour && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  活跃时段
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">
                    {mostActiveHour[0]}:00
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    这个时段你最活跃，共 {mostActiveHour[1]} 次操作
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 最近事件 */}
          <Card>
            <CardHeader>
              <CardTitle>最近活动</CardTitle>
              <CardDescription>最新的10条用户行为记录</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {events.slice(-10).reverse().map((event, index) => (
                  <div 
                    key={index} 
                    className="flex justify-between items-start gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {eventTypeMap[event.event_type] || event.event_type}
                      </div>
                      {formatProperties(event) && (
                        <div className="text-muted-foreground text-xs mt-1">
                          {formatProperties(event)}
                        </div>
                      )}
                    </div>
                    <div className="text-muted-foreground text-xs whitespace-nowrap">
                      {new Date(event.timestamp).toLocaleTimeString('zh-CN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </div>
                  </div>
                ))}
                {events.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    暂无活动记录
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 操作按钮 */}
          <div className="flex gap-3">
            <Button 
              onClick={handleExport}
              disabled={!supabaseData}
              className="flex-1 bg-primary hover:bg-primary/90 rounded-2xl h-12"
            >
              <Download className="mr-2 h-4 w-4" />
              导出数据
            </Button>
          </div>

          {/* 说明 */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-base">数据说明</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>• 此页面显示的是<strong>所有用户</strong>的汇总数据</p>
              <p>• 数据来源：Supabase云数据库</p>
              <p>• 实时更新，可以看到所有用户的行为数据</p>
              <p>• 匿名追踪，不包含个人隐私信息</p>
              <p>• 可导出JSON格式用于Excel/Python分析</p>
            </CardContent>
          </Card>
        </div>
      </div>
  );
}
