import { useState } from 'react';
import { LayoutDashboard, Heart, Clock, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isCenter?: boolean;
  route?: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: '数据', icon: LayoutDashboard, route: '/dashboard' },
  { id: 'favorites', label: '收藏', icon: Heart, route: '/favorites' },
  { id: 'draw', label: '', icon: LayoutDashboard, isCenter: true }, // 中央按钮：抽奖
  { id: 'history', label: '历史', icon: Clock, route: '/history' },
  { id: 'profile', label: '我的', icon: User, route: '/profile' },
];

export default function BottomNavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 根据当前路由设置活动标签
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/') return 'draw'; // 数据就是抽奖页
    const item = navItems.find(item => item.route === path);
    return item?.id || 'dashboard';
  };
  
  const [activeTab, setActiveTab] = useState(getActiveTab());

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-safe">
      {/* Backdrop blur container */}
      <div className="relative mx-auto max-w-lg">
        {/* Glass morphism background */}
        <div className="absolute inset-0 rounded-[2rem] bg-white/80 backdrop-blur-xl shadow-[0_-2px_20px_rgba(162,210,154,0.15)] border border-primary/10" />
        
        {/* Nav items */}
        <div className="relative flex items-center justify-around px-2 py-3">
          {navItems.map((item, index) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.isCenter) {
                    // 中央按钮：跳转到抽奖页面
                    navigate('/');
                    setActiveTab('draw');
                  } else if (item.route) {
                    // 其他按钮：跳转到对应路由
                    navigate(item.route);
                    setActiveTab(item.id);
                  }
                }}
                className={cn(
                  'relative flex flex-col items-center gap-1 transition-all duration-300',
                  item.isCenter ? 'flex-shrink-0' : 'flex-1',
                )}
              >
                {/* Center button special styling */}
                {item.isCenter ? (
                  <div className="relative -mt-6">
                    {/* Gradient ring */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary via-accent to-primary opacity-20 blur-xl animate-pulse" />
                    
                    {/* Main button */}
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent shadow-[0_4px_20px_rgba(247,178,103,0.4)] transition-transform duration-300 active:scale-90 hover:scale-105">
                      <img src="/2386376_food_hamburder_v1_icon.ico" alt="抽奖" className="h-8 w-8" />
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Floating indicator */}
                    <div
                      className={cn(
                        'absolute inset-x-0 top-0 mx-auto h-12 rounded-2xl transition-all duration-500',
                        isActive
                          ? 'w-16 bg-gradient-to-br from-primary/20 to-accent/10 scale-100 opacity-100'
                          : 'w-0 scale-75 opacity-0',
                      )}
                    />
                    
                    {/* Icon with animation */}
                    <div
                      className={cn(
                        'relative flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300',
                        isActive && 'animate-bounce-in',
                      )}
                    >
                      <Icon
                        className={cn(
                          'transition-all duration-300',
                          isActive
                            ? 'h-6 w-6 text-primary scale-110'
                            : 'h-5 w-5 text-muted-foreground scale-100 hover:scale-110',
                        )}
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                      
                      {/* 移除了橙色小点 */}
                    </div>
                    
                    {/* Label */}
                    <span
                      className={cn(
                        'text-xs font-medium transition-all duration-300',
                        isActive
                          ? 'text-primary scale-105'
                          : 'text-muted-foreground scale-100',
                      )}
                    >
                      {item.label}
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Safe area padding for iOS */}
      <div className="h-safe-bottom" />
    </nav>
  );
}
