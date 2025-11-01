import BottomNavBar from '@/components/BottomNavBar';
import { User } from 'lucide-react';

export default function Profile() {
  return (
    <>
      <div className="min-h-screen bg-background flex items-center justify-center pb-24">
        <div className="max-w-md w-full mx-auto px-6 py-8 text-center space-y-6">
          {/* Icon */}
          <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/10 mx-auto">
            <User className="h-12 w-12 text-primary" strokeWidth={2} />
          </div>
          
          {/* Title */}
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            我的
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
              <li>👤 管理个人信息</li>
              <li>⚙️ 设置应用偏好</li>
              <li>📱 查看使用统计</li>
            </ul>
          </div>
          
          {/* Coming Soon Badge */}
          <div className="inline-block px-6 py-2 rounded-full bg-gradient-to-r from-primary to-accent text-foreground font-medium text-sm shadow-md">
            即将推出 🎉
          </div>
        </div>
      </div>
      
      <BottomNavBar />
    </>
  );
}
