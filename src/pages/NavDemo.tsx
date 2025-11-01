import BottomNavBar from '@/components/BottomNavBar';

export default function NavDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background pb-24">
      {/* Demo content */}
      <div className="container mx-auto px-4 pt-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              底部导航栏演示
            </h1>
            <p className="text-muted-foreground">
              点击不同的标签页查看动画效果
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid gap-4 mt-8">
            <div className="rounded-3xl bg-card p-6 shadow-[var(--shadow-card)] border border-primary/10">
              <h3 className="text-lg font-semibold text-primary mb-2">
                🎨 主题配色
              </h3>
              <p className="text-sm text-muted-foreground">
                完美融合草绿色 (#A2D29A) 与暖橙色 (#F7B267)
              </p>
            </div>

            <div className="rounded-3xl bg-card p-6 shadow-[var(--shadow-card)] border border-primary/10">
              <h3 className="text-lg font-semibold text-primary mb-2">
                ✨ 交互特效
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 浮动指示器背景</li>
                <li>• 图标弹跳动画</li>
                <li>• 活跃态圆点指示</li>
                <li>• 毛玻璃背景</li>
              </ul>
            </div>

            <div className="rounded-3xl bg-card p-6 shadow-[var(--shadow-card)] border border-primary/10">
              <h3 className="text-lg font-semibold text-primary mb-2">
                🎯 中央按钮
              </h3>
              <p className="text-sm text-muted-foreground">
                凸起的渐变圆形按钮，带有光晕效果和脉冲动画
              </p>
            </div>
          </div>

          {/* Color palette display */}
          <div className="rounded-3xl bg-card p-6 shadow-[var(--shadow-card)] border border-primary/10 mt-6">
            <h3 className="text-lg font-semibold mb-4">配色方案</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="h-16 rounded-2xl bg-primary shadow-md" />
                <p className="text-xs text-center text-muted-foreground">
                  草绿色 Primary
                </p>
              </div>
              <div className="space-y-2">
                <div className="h-16 rounded-2xl bg-accent shadow-md" />
                <p className="text-xs text-center text-muted-foreground">
                  暖橙色 Accent
                </p>
              </div>
            </div>
          </div>

          {/* Scroll hint */}
          <div className="text-center text-sm text-muted-foreground mt-8 pb-8">
            向下滚动查看更多内容
          </div>

          {/* More content to demonstrate scrolling */}
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-3xl bg-gradient-to-br from-primary/5 to-accent/5 p-6 border border-primary/10"
            >
              <h4 className="font-semibold text-foreground mb-2">
                内容卡片 {i}
              </h4>
              <p className="text-sm text-muted-foreground">
                这是一些示例内容，用于演示滚动时导航栏的固定效果。
                导航栏始终保持在底部，不会随页面滚动。
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavBar />
    </div>
  );
}
