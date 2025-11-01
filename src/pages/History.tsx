import BottomNavBar from '@/components/BottomNavBar';
import { Clock } from 'lucide-react';

export default function History() {
  return (
    <>
      <div className="min-h-screen bg-background flex items-center justify-center pb-24">
        <div className="max-w-md w-full mx-auto px-6 py-8 text-center space-y-6">
          {/* Icon */}
          <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/10 mx-auto">
            <Clock className="h-12 w-12 text-primary" strokeWidth={2} />
          </div>
          
          {/* Title */}
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            历史记录
          </h1>
          
          {/* Description */}
          <div className="rounded-3xl bg-card p-6 shadow-[var(--shadow-card)] border border-primary/10 space-y-3">
            <p className="text-muted-foreground">
              🚧 此功能正在开发中...
            </p>
            <p className="text-sm text-muted-foreground">
              未来你可以在这里：
            </p>
            <ul className="text-sm text-muted-foreground text-left space-y-2">
              <li>📜 查看抽奖历史记录</li>
              <li>📊 分析就餐偏好数据</li>
              <li>🔄 快速重新抽取</li>
            </ul>
          </div>
          
          {/* Coming Soon Badge */}
          <div className="w-full h-16 rounded-3xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-black text-lg font-semibold shadow-lg transition-all hover:scale-105 flex items-center justify-center">
            即将推出 🎉
          </div>
        </div>
      </div>
      
      <BottomNavBar />
    </>
  );
}
