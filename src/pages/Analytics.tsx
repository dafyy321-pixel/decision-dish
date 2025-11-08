import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowLeft, RefreshCw, Download, BarChart3, Clock, Activity, TrendingUp, TrendingDown, HelpCircle, PieChart, CalendarDays, Award, Minus } from 'lucide-react';
import { getUserId, getFirstVisitTime, getUTMParams, EventData } from '@/lib/analytics';
import { getAnalyticsSummary, getAnalyticsSummaryByCustomRange, TimeRange } from '@/lib/analytics-supabase';
import { DateTimeRangePicker, DateRange } from '@/components/ui/date-time-range-picker';
import { toast } from 'sonner';
import titleLogo from '@/assets/title-logo.png';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, BarChart as RechartsBar, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, LineChart, Line, CartesianGrid } from 'recharts';

// 图表颜色
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// 趋势箭头组件
const TrendIndicator = ({ value, showZero = false }: { value: number; showZero?: boolean }) => {
  if (value === 0 && !showZero) return null;
  
  const isPositive = value > 0;
  const isZero = value === 0;
  
  return (
    <span className={`inline-flex items-center gap-1 text-sm font-medium ${
      isZero ? 'text-muted-foreground' : isPositive ? 'text-green-600' : 'text-red-600'
    }`}>
      {isZero ? (
        <Minus className="w-4 h-4" />
      ) : isPositive ? (
        <TrendingUp className="w-4 h-4" />
      ) : (
        <TrendingDown className="w-4 h-4" />
      )}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
};

export default function Analytics() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [userId] = useState(getUserId());
  const [firstVisit] = useState(getFirstVisitTime());
  const [utmParams] = useState(getUTMParams());
  const [loading, setLoading] = useState(true);
  const [supabaseData, setSupabaseData] = useState<any>(null);
  const [customDateRange, setCustomDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });

  // 初始加载所有数据
  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAnalyticsSummary('all');
      if (data) {
        setSupabaseData(data);
        setEvents(data.allEvents.slice(0, 10));
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

  // 页面加载时获取所有数据
  useEffect(() => {
    loadData();
  }, []);

  // 使用 Supabase 数据（所有用户）
  const stats = supabaseData ? supabaseData.summary : {
    totalUV: 0,
    todayUV: 0,
    totalEvents: 0,
    drawCount: 0,
    shareCount: 0,
    conversionRate: 0,
    shareRate: 0,
    activeUsers: 0,
  };

  // 渠道统计
  const channelStats = supabaseData?.channelStats || {};

  // 活跃时段
  const activeHours = supabaseData?.activeHours || {};
  const mostActiveHour = Object.keys(activeHours).length > 0
    ? Object.entries(activeHours).sort(([, a], [, b]) => (b as number) - (a as number))[0]
    : null;

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
    a.download = `analytics_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('数据已导出！');
  };

  // 事件类型中文映射
  const eventTypeMap: Record<string, string> = {
    'app_launch': '打开应用',
    'page_view': '浏览页面',
    'mode_selected': '切换模式',
    'draw_clicked': '点击抽取',
    'draw_result': '展示结果',
    'draw_again': '再抽一次',
    'share_clicked': '点击分享',
    'favorite_added': '添加收藏',
    'favorite_removed': '取消收藏',
  };

  // 渠道名称映射
  const channelNames: Record<string, string> = {
    'canteen': '食堂地推',
    'biaobai': '表白墙',
    'qzone': 'QQ空间',
    'kol': 'KOL推广',
    'dorm': '宿舍楼',
    'direct': '直接访问'
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background pb-8 pt-8 px-4">
        <div className="max-w-4xl w-full mx-auto space-y-6">
          {/* 头部 */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="rounded-3xl"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={loading}
              className="rounded-3xl"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              刷新
            </Button>
          </div>

        {/* Logo和标题 */}
        <div className="text-center space-y-3">
          <img
            src={titleLogo}
            alt="等会吃啥"
            className="w-64 max-w-full mx-auto"
          />
          <div>
            <h2 className="text-2xl font-bold text-foreground">数据统计</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {loading ? '加载中...' : '所有用户的实时数据汇总'}
            </p>
          </div>
        </div>

        {/* 时间范围选择器 */}
        <Card className="rounded-3xl border-primary/20 shadow-sm">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">时间范围</span>
            </div>
            <DateTimeRangePicker
              value={customDateRange}
              onChange={async (range) => {
                setCustomDateRange(range);
                setLoading(true);
                
                try {
                  if (!range.from || !range.to) {
                    // 选择了"全部"，加载所有数据
                    const data = await getAnalyticsSummary('all');
                    if (data) {
                      setSupabaseData(data);
                      setEvents(data.allEvents.slice(0, 10));
                      toast.success('数据加载成功！');
                    } else {
                      toast.error('无法加载数据');
                    }
                  } else {
                    // 使用自定义日期范围查询
                    const data = await getAnalyticsSummaryByCustomRange(range.from, range.to);
                    if (data) {
                      setSupabaseData(data);
                      setEvents(data.allEvents.slice(0, 10));
                      toast.success(`已加载 ${range.from.toLocaleDateString()} 至 ${range.to.toLocaleDateString()} 的数据`);
                    } else {
                      toast.error('无法加载数据');
                    }
                  }
                } catch (err) {
                  console.error('加载数据失败:', err);
                  toast.error('加载数据失败');
                } finally {
                  setLoading(false);
                }
              }}
              showTimeSelect={true}
            />
          </CardContent>
        </Card>

        {/* 核心指标卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="rounded-3xl border-primary/20 shadow-sm hover:shadow-md transition-shadow cursor-help">
                <CardContent className="pt-6 pb-6 text-center">
                  <div className="text-5xl font-bold text-primary mb-2">{stats.totalUV || 0}</div>
                  <div className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-1">
                    总用户数
                    <HelpCircle className="w-3 h-3" />
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>选定时间范围内的独立访问用户数量（UV）</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="rounded-3xl border-primary/20 shadow-sm hover:shadow-md transition-shadow cursor-help">
                <CardContent className="pt-6 pb-6 text-center">
                  <div className="text-5xl font-bold text-primary mb-2">{stats.todayUV || 0}</div>
                  <div className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-1">
                    今日访客
                    <HelpCircle className="w-3 h-3" />
                  </div>
                  {stats.uvChange !== undefined && (
                    <div className="mt-2">
                      <TrendIndicator value={stats.uvChange} showZero />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>今天 0:00 到现在的独立访问用户数</p>
              {stats.uvChange !== undefined && (
                <p className="text-xs mt-1">相比昨天 {stats.uvChange > 0 ? '增长' : stats.uvChange < 0 ? '下降' : '持平'}</p>
              )}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="rounded-3xl border-primary/20 shadow-sm hover:shadow-md transition-shadow cursor-help">
                <CardContent className="pt-6 pb-6 text-center">
                  <div className="text-5xl font-bold text-primary mb-2">{stats.conversionRate.toFixed(0)}%</div>
                  <div className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-1">
                    转化率
                    <HelpCircle className="w-3 h-3" />
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>打开应用后实际使用抽取功能的用户比例</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="rounded-3xl border-primary/20 shadow-sm hover:shadow-md transition-shadow cursor-help">
                <CardContent className="pt-6 pb-6 text-center">
                  <div className="text-5xl font-bold text-primary mb-2">{stats.shareRate.toFixed(0)}%</div>
                  <div className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-1">
                    分享率
                    <HelpCircle className="w-3 h-3" />
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>使用抽取后点击分享的用户比例</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* 详细数据 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 左侧：用户行为统计 */}
          <Card className="rounded-3xl border-primary/20 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                用户行为统计
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex justify-between items-center p-3 bg-primary/5 rounded-2xl cursor-help">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        总事件数
                        <HelpCircle className="w-3 h-3" />
                      </span>
                      <span className="text-2xl font-bold text-primary">{stats.totalEvents || 0}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>所有用户触发的总事件次数（包括打开、抽取、分享等）</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex justify-between items-center p-3 bg-primary/5 rounded-2xl cursor-help">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        抽取次数
                        <HelpCircle className="w-3 h-3" />
                      </span>
                      <span className="text-2xl font-bold text-primary">{stats.drawCount || 0}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>用户点击“开始抽取”按钮的总次数</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex justify-between items-center p-3 bg-primary/5 rounded-2xl cursor-help">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        分享次数
                        <HelpCircle className="w-3 h-3" />
                      </span>
                      <span className="text-2xl font-bold text-primary">{stats.shareCount || 0}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>用户点击“分享”按钮的总次数</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex justify-between items-center p-3 bg-primary/5 rounded-2xl cursor-help">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        本周活跃用户
                        <HelpCircle className="w-3 h-3" />
                      </span>
                      <span className="text-2xl font-bold text-primary">{stats.activeUsers || 0}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>本周（周日至今）至少抽取过 1 次的独立用户数</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardContent>
          </Card>

          {/* 右侧：活跃时段 */}
          {mostActiveHour ? (
            <Card className="rounded-3xl border-primary/20 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  活跃时段分析
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-8 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl">
                  <div className="text-6xl font-bold text-primary mb-3">{mostActiveHour[0]}:00</div>
                  <div className="text-sm text-muted-foreground mb-4">峰值时段</div>
                  <div className="inline-block px-4 py-2 bg-primary/20 rounded-full">
                    <span className="text-sm font-medium">共 {mostActiveHour[1]} 次操作</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-3xl border-primary/20 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  活跃时段分析
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-8 text-muted-foreground">
                  暂无数据
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 留存率卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="rounded-3xl border-primary/20 shadow-sm hover:shadow-md transition-shadow cursor-help">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    用户留存率
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl">
                      <div className="text-5xl font-bold text-primary mb-2">
                        {stats.retention1Day?.toFixed(1) || 0}%
                      </div>
                      <div className="text-sm text-muted-foreground">次日留存</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-2xl">
                      <div className="text-4xl font-bold text-green-600 mb-2">
                        {stats.retention7Day?.toFixed(1) || 0}%
                      </div>
                      <div className="text-sm text-muted-foreground">7日留存</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>次日留存：今天返回的昨天新用户比例</p>
              <p>7日留存：第7天返回的首日用户比例</p>
            </TooltipContent>
          </Tooltip>

          {/* 空占位或其他卡片 */}
          <Card className="rounded-3xl border-primary/20 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                核心指标概览
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">总用户数</span>
                  <span className="font-bold text-lg">{stats.totalUV || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">转化率</span>
                  <span className="font-bold text-lg text-primary">{stats.conversionRate.toFixed(0)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">分享率</span>
                  <span className="font-bold text-lg text-primary">{stats.shareRate.toFixed(0)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">本周活跃</span>
                  <span className="font-bold text-lg">{stats.activeUsers || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 7天趋势图 */}
        {supabaseData?.trendData && supabaseData.trendData.length > 0 && (
          <Card className="rounded-3xl border-primary/20 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                最近7天趋势
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={supabaseData.trendData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="uv" name="访客数" stroke="#0088FE" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="events" name="事件数" stroke="#00C49F" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* 周分布图 */}
        {supabaseData?.weekDistribution && Object.keys(supabaseData.weekDistribution).length > 0 && (
          <Card className="rounded-3xl border-primary/20 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary" />
                一周活跃分布
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBar 
                  data={['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map(day => ({
                    day,
                    count: supabaseData.weekDistribution[day] || 0
                  }))}
                  margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
                >
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <RechartsTooltip />
                  <Bar dataKey="count" name="活动次数" fill="#00C49F" radius={[8, 8, 0, 0]} />
                </RechartsBar>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* 渠道来源 */}
        {Object.keys(channelStats).length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="rounded-3xl border-primary/20 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  渠道来源分析
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(channelStats)
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .slice(0, 5)
                    .map(([channel, count]) => {
                      const total = Object.values(channelStats).reduce((a: number, b) => a + (b as number), 0);
                      const percentage = ((count as number / total) * 100).toFixed(0);
                      
                      return (
                        <div key={channel}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-foreground">
                              {channelNames[channel] || channel}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {count as number} ({percentage}%)
                            </span>
                          </div>
                          <div className="h-3 bg-primary/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full transition-all duration-500" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>

            {/* 渠道占比饼图 */}
            <Card className="rounded-3xl border-primary/20 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-primary" />
                  渠道占比图
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPie>
                    <Pie
                      data={Object.entries(channelStats)
                        .sort(([, a], [, b]) => (b as number) - (a as number))
                        .map(([channel, count], index) => ({
                          name: channelNames[channel] || channel,
                          value: count as number,
                          fill: COLORS[index % COLORS.length]
                        }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {Object.entries(channelStats).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </RechartsPie>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 活跃时段柱状图 */}
        {Object.keys(activeHours).length > 0 && (
          <Card className="rounded-3xl border-primary/20 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                24小时活跃分布
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBar data={Array.from({ length: 24 }, (_, hour) => ({
                  hour: `${hour}:00`,
                  count: activeHours[hour] || 0
                }))}
                  margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
                >
                  <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <RechartsTooltip />
                  <Bar dataKey="count" fill="#0088FE" radius={[8, 8, 0, 0]} />
                </RechartsBar>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}


        {/* 热门抽取结果 Top 10 */}
        {supabaseData?.topDrawResults && supabaseData.topDrawResults.length > 0 && (
          <Card className="rounded-3xl border-primary/20 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                热门抽取结果 Top 10
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {supabaseData.topDrawResults.map((item, index) => {
                  const maxCount = supabaseData.topDrawResults[0].count;
                  const percentage = (item.count / maxCount) * 100;
                  
                  return (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                            index === 0 ? 'bg-yellow-500 text-white' :
                            index === 1 ? 'bg-gray-400 text-white' :
                            index === 2 ? 'bg-orange-600 text-white' :
                            'bg-primary/10 text-primary'
                          }`}>
                            {index + 1}
                          </span>
                          <span className="text-sm font-medium text-foreground">{item.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{item.count} 次</span>
                      </div>
                      <div className="h-2 bg-primary/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-500" 
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

        {/* 最近活动 */}
        <Card className="rounded-3xl border-primary/20 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              最近活动
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {events.slice(0, 8).map((event, index) => (
                <div 
                  key={index} 
                  className="flex justify-between items-center p-3 bg-primary/5 rounded-2xl text-sm hover:bg-primary/10 transition-colors"
                >
                  <span className="font-medium text-foreground">{eventTypeMap[event.event_type] || event.event_type}</span>
                  <span className="text-muted-foreground text-xs">
                    {new Date(event.timestamp).toLocaleTimeString('zh-CN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              ))}
              {events.length === 0 && (
                <div className="text-center text-muted-foreground py-8">暂无活动记录</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className="flex justify-center gap-4">
          <Button 
            onClick={handleExport}
            disabled={!supabaseData}
            className="rounded-3xl h-12 px-8 bg-primary hover:bg-primary/90 shadow-sm"
          >
            <Download className="mr-2 h-4 w-4" />
            导出数据
          </Button>
        </div>

        {/* 底部说明 */}
        <div className="text-center text-xs text-muted-foreground space-y-1 pt-4">
          <p>数据来源：Supabase • 实时更新</p>
          <p>你的ID: {userId.substring(0, 20)}...</p>
          {Object.keys(utmParams).length > 0 && (
            <p>来源渠道: {utmParams.utm_source || 'direct'}</p>
          )}
        </div>
      </div>
      </div>
    </TooltipProvider>
  );
}
