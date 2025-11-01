import BottomNavBar from '@/components/BottomNavBar';
import { LayoutDashboard, TrendingUp, Target, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <>
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-md w-full mx-auto px-6 py-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/10 mx-auto mb-2">
              <LayoutDashboard className="h-8 w-8 text-primary" strokeWidth={2} />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              数据看板
            </h1>
            <p className="text-muted-foreground text-sm">
              今天吃什么？点击下方开始抽奖 🎲
            </p>
          </div>

          {/* Quick Action Card - 抽奖快捷入口 */}
          <div 
            onClick={() => navigate('/')}
            className="rounded-3xl bg-gradient-to-br from-primary to-accent p-6 shadow-lg cursor-pointer transition-transform duration-300 active:scale-95 hover:scale-105"
          >
            <div className="flex items-center justify-between text-foreground">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold">开始抽奖</h2>
                <p className="text-sm opacity-90">随机决定今天吃什么</p>
              </div>
              <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Sparkles className="h-8 w-8" strokeWidth={2.5} />
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-3xl bg-card p-5 shadow-[var(--shadow-card)] border border-primary/10 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground">总抽奖次数</span>
              </div>
              <p className="text-3xl font-bold text-primary">0</p>
            </div>

            <div className="rounded-3xl bg-card p-5 shadow-[var(--shadow-card)] border border-primary/10 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center">
                  <Target className="h-4 w-4 text-accent" />
                </div>
                <span className="text-xs text-muted-foreground">收藏餐厅</span>
              </div>
              <p className="text-3xl font-bold text-accent">0</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-3xl bg-card p-6 shadow-[var(--shadow-card)] border border-primary/10 space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <span>最近活动</span>
            </h3>
            <div className="text-center py-8 text-muted-foreground text-sm">
              <p>暂无抽奖记录</p>
              <p className="mt-2">开始你的第一次抽奖吧！</p>
            </div>
          </div>

          {/* Feature Shortcuts */}
          <div className="rounded-3xl bg-card p-6 shadow-[var(--shadow-card)] border border-primary/10 space-y-4">
            <h3 className="text-lg font-semibold text-foreground">快捷功能</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/favorites')}
                className="rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 p-4 text-left transition-transform duration-200 active:scale-95 hover:scale-105"
              >
                <p className="text-sm font-medium text-primary">收藏管理</p>
                <p className="text-xs text-muted-foreground mt-1">查看收藏</p>
              </button>
              <button
                onClick={() => navigate('/history')}
                className="rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 p-4 text-left transition-transform duration-200 active:scale-95 hover:scale-105"
              >
                <p className="text-sm font-medium text-accent">历史记录</p>
                <p className="text-xs text-muted-foreground mt-1">查看历史</p>
              </button>
            </div>
          </div>

          {/* Tips */}
          <div className="rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 p-4 border border-primary/10">
            <p className="text-sm text-muted-foreground text-center">
              💡 提示：点击底部中央的 🍔 按钮快速开始抽奖
            </p>
          </div>
        </div>
      </div>

      <BottomNavBar />
    </>
  );
}
