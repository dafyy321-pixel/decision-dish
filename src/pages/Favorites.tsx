import BottomNavBar from '@/components/BottomNavBar';
import { Heart } from 'lucide-react';

export default function Favorites() {
  return (
    <>
      <div className="min-h-screen bg-background flex items-center justify-center pb-24">
        <div className="max-w-md w-full mx-auto px-6 py-8 text-center space-y-6">
          {/* Icon */}
          <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/10 mx-auto">
            <Heart className="h-12 w-12 text-primary" strokeWidth={2} />
          </div>
          
          {/* Title */}
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            收藏功能
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
              <li>💚 收藏喜欢的餐厅</li>
              <li>⭐ 快速访问常去的店铺</li>
              <li>🎯 从收藏列表中抽取</li>
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
