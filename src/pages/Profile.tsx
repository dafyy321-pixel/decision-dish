import { useState, useEffect } from 'react';
import BottomNavBar from '@/components/BottomNavBar';
import { BarChart3, Clock, Heart, Coffee, Flame, User, Tag, Award, Sparkles, Edit, Zap, TrendingUp, Star, Camera, Calendar, MapPin, Trophy, Plus, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';

export default function Profile() {
  const [stats, setStats] = useState({
    totalDraws: 0,
    favoritesCount: 0,
    historyCount: 0,
    lastDrawTime: '',
    frequencyData: [] as Array<{ name: string; count: number }>
  });

  // 个人信息状态
  const [userInfo, setUserInfo] = useState({
    nickname: '',
    signature: '',
    avatar: ''
  });

  // 喜好标签状态
  const [preferences, setPreferences] = useState({
    spiciness: '' as string,
    spicinessOptions: ['不辣', '微辣', '中辣', '特辣', '变态辣'],
    taste: [] as string[],
    tasteOptions: ['清淡', '咸香', '甜味', '酸爽', '麻辣'],
    avoid: [] as string[],
    avoidOptions: ['海鲜', '牛肉', '羊肉', '香菜', '葱姜蒜']
  });

  // 添加新标签的输入状态
  const [newTagInputs, setNewTagInputs] = useState({
    spiciness: '',
    taste: '',
    avoid: ''
  });

  // 显示添加输入框的状态
  const [showAddInput, setShowAddInput] = useState({
    spiciness: false,
    taste: false,
    avoid: false
  });

  // 成就数据
  const [achievements, setAchievements] = useState({
    consecutiveDays: 0,
    totalRestaurants: 0,
    explorerLevel: 0
  });

  // 今日运势
  const [todayFortune, setTodayFortune] = useState({
    level: '',
    description: '',
    recommendation: '',
    luckyFood: ''
  });

  useEffect(() => {
    // 从 localStorage 加载统计数据
    const totalDraws = parseInt(localStorage.getItem('total_draws') || '0');
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const history = JSON.parse(localStorage.getItem('draw_history') || '[]');
    const lastDrawTime = localStorage.getItem('last_draw_time') || '还没有抽取记录';

    // 加载个人信息
    const savedUserInfo = JSON.parse(localStorage.getItem('user_info') || '{"nickname":"美食探索者","signature":"今天吃什么呢？","avatar":""}');
    setUserInfo(savedUserInfo);

    // 加载喜好标签
    const defaultPreferences = {
      spiciness: '',
      spicinessOptions: ['不辣', '微辣', '中辣', '特辣', '变态辣'],
      taste: [],
      tasteOptions: ['清淡', '咸香', '甜味', '酸爽', '麻辣'],
      avoid: [],
      avoidOptions: ['海鲜', '牛肉', '羊肉', '香菜', '葱姜蒜']
    };
    const savedPreferences = JSON.parse(localStorage.getItem('preferences') || JSON.stringify(defaultPreferences));
    setPreferences({ ...defaultPreferences, ...savedPreferences });

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

    // 计算成就数据
    const firstDrawDate = localStorage.getItem('first_draw_date');
    const lastDrawDate = localStorage.getItem('last_draw_date');
    let consecutiveDays = 0;
    
    if (firstDrawDate && lastDrawDate) {
      const daysDiff = Math.floor((new Date(lastDrawDate).getTime() - new Date(firstDrawDate).getTime()) / (1000 * 60 * 60 * 24));
      consecutiveDays = daysDiff + 1;
    }

    // 统计不同餐厅数量
    const uniqueRestaurants = new Set(history.map((item: any) => item.name).filter((name: string) => name && name.trim()));
    const totalRestaurants = uniqueRestaurants.size;
    
    // 探索者等级（每5家餐厅升1级）
    const explorerLevel = Math.floor(totalRestaurants / 5);

    setAchievements({
      consecutiveDays,
      totalRestaurants,
      explorerLevel
    });

    // 生成今日运势
    generateTodayFortune();
  }, []);

  // 生成今日运势
  const generateTodayFortune = () => {
    const today = new Date().toDateString();
    const savedFortune = localStorage.getItem('today_fortune');
    const savedDate = localStorage.getItem('fortune_date');

    // 如果今天已经生成过运势，直接使用
    if (savedFortune && savedDate === today) {
      setTodayFortune(JSON.parse(savedFortune));
      return;
    }

    // 否则生成新的运势
    const fortunes = [
      {
        level: '大吉',
        description: '今日美食运势极佳！',
        recommendation: '适合尝试新餐厅，会有意外惊喜',
        luckyFood: '川菜'
      },
      {
        level: '中吉',
        description: '今日美食运势不错',
        recommendation: '去熟悉的店铺会更安心',
        luckyFood: '粤菜'
      },
      {
        level: '小吉',
        description: '今日运势平稳',
        recommendation: '随心选择即可，保持好心情',
        luckyFood: '简餐'
      },
      {
        level: '吉',
        description: '今日美食运不错哦',
        recommendation: '适合约朋友一起觅食',
        luckyFood: '火锅'
      },
      {
        level: '中平',
        description: '今日运势平平',
        recommendation: '选择清淡饮食更佳',
        luckyFood: '素菜'
      }
    ];

    // 基于日期生成伪随机索引
    const seed = new Date().getDate() + new Date().getMonth() * 31;
    const randomIndex = seed % fortunes.length;
    const fortune = fortunes[randomIndex];

    setTodayFortune(fortune);
    localStorage.setItem('today_fortune', JSON.stringify(fortune));
    localStorage.setItem('fortune_date', today);
  };

  // 处理头像上传
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newUserInfo = { ...userInfo, avatar: reader.result as string };
        setUserInfo(newUserInfo);
        localStorage.setItem('user_info', JSON.stringify(newUserInfo));
      };
      reader.readAsDataURL(file);
    }
  };

  // 添加新标签选项
  const handleAddOption = (category: 'spiciness' | 'taste' | 'avoid') => {
    const newTag = newTagInputs[category].trim();
    if (newTag && !preferences[`${category}Options`].includes(newTag)) {
      const newPreferences = {
        ...preferences,
        [`${category}Options`]: [...preferences[`${category}Options`], newTag]
      };
      setPreferences(newPreferences);
      localStorage.setItem('preferences', JSON.stringify(newPreferences));
      setNewTagInputs({ ...newTagInputs, [category]: '' });
      setShowAddInput({ ...showAddInput, [category]: false });
    }
  };

  // 删除标签选项
  const handleDeleteOption = (category: 'spiciness' | 'taste' | 'avoid', option: string) => {
    const newOptions = preferences[`${category}Options`].filter(item => item !== option);
    let newPreferences = {
      ...preferences,
      [`${category}Options`]: newOptions
    };
    
    // 如果删除的选项被选中，同时取消选中
    if (category === 'spiciness' && preferences.spiciness === option) {
      newPreferences = { ...newPreferences, spiciness: '' };
    } else if (category === 'taste' && preferences.taste.includes(option)) {
      newPreferences = { ...newPreferences, taste: preferences.taste.filter(t => t !== option) };
    } else if (category === 'avoid' && preferences.avoid.includes(option)) {
      newPreferences = { ...newPreferences, avoid: preferences.avoid.filter(a => a !== option) };
    }
    
    setPreferences(newPreferences);
    localStorage.setItem('preferences', JSON.stringify(newPreferences));
  };

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

          {/* 个人信息卡片 */}
          <Card className="border-primary/20 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <Avatar className="h-16 w-16 border-2 border-primary/20">
                    {userInfo.avatar ? (
                      <AvatarImage src={userInfo.avatar} alt={userInfo.nickname} />
                    ) : (
                      <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                        {userInfo.nickname.charAt(0) || '美'}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <label htmlFor="avatar-upload" className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="h-6 w-6 text-white" />
                  </label>
                  <Input 
                    id="avatar-upload" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleAvatarChange}
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">{userInfo.nickname}</h2>
                    <Edit className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-primary transition-colors" />
                  </div>
                  <p className="text-sm text-muted-foreground">{userInfo.signature}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 今日运势 */}
          <Card className="border-primary/20 shadow-lg bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                今日美食运势
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="px-6 py-3 rounded-lg bg-primary text-white">
                  <span className="text-3xl font-bold">{todayFortune.level}</span>
                </div>
                <Badge variant="secondary" className="bg-white text-primary border-primary/20 text-sm px-3 py-1">
                  幸运美食：{todayFortune.luckyFood}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Star className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">{todayFortune.description}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Zap className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">{todayFortune.recommendation}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 成就系统 */}
          <Card className="border-primary/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                我的成就
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-lg font-bold text-primary">{achievements.consecutiveDays}</div>
                  <div className="text-xs text-muted-foreground">使用天数</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-lg font-bold text-primary">{achievements.totalRestaurants}</div>
                  <div className="text-xs text-muted-foreground">探索餐厅</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-lg font-bold text-primary">Lv.{achievements.explorerLevel}</div>
                  <div className="text-xs text-muted-foreground">探索等级</div>
                </div>
              </div>
              {achievements.explorerLevel >= 3 && (
                <div className="mt-4 pt-4 border-t border-border text-center">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    🎉 尝鲜达人
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 喜好标签 */}
          <Card className="border-primary/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-primary" />
                我的喜好
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 辣度偏好 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-foreground">辣度偏好</div>
                  <button 
                    onClick={() => setShowAddInput({ ...showAddInput, spiciness: !showAddInput.spiciness })}
                    className="text-primary hover:text-primary/80 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                {showAddInput.spiciness && (
                  <div className="flex gap-2">
                    <Input 
                      placeholder="输入新选项" 
                      value={newTagInputs.spiciness}
                      onChange={(e) => setNewTagInputs({ ...newTagInputs, spiciness: e.target.value })}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddOption('spiciness')}
                      className="flex-1"
                    />
                    <button 
                      onClick={() => handleAddOption('spiciness')}
                      className="px-3 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                    >
                      添加
                    </button>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {preferences.spicinessOptions.map((item) => (
                    <div key={item} className="relative group">
                      <Badge 
                        variant={preferences.spiciness === item ? 'default' : 'outline'}
                        className="cursor-pointer transition-all hover:scale-105 px-4 py-2 text-sm pr-8"
                        onClick={() => {
                          const newSpiciness = preferences.spiciness === item ? '' : item;
                          const newPreferences = { ...preferences, spiciness: newSpiciness };
                          setPreferences(newPreferences);
                          localStorage.setItem('preferences', JSON.stringify(newPreferences));
                        }}
                      >
                        {item}
                      </Badge>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteOption('spiciness', item);
                        }}
                        className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 口味偏好 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-foreground">口味偏好</div>
                  <button 
                    onClick={() => setShowAddInput({ ...showAddInput, taste: !showAddInput.taste })}
                    className="text-primary hover:text-primary/80 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                {showAddInput.taste && (
                  <div className="flex gap-2">
                    <Input 
                      placeholder="输入新选项" 
                      value={newTagInputs.taste}
                      onChange={(e) => setNewTagInputs({ ...newTagInputs, taste: e.target.value })}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddOption('taste')}
                      className="flex-1"
                    />
                    <button 
                      onClick={() => handleAddOption('taste')}
                      className="px-3 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                    >
                      添加
                    </button>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {preferences.tasteOptions.map((item) => (
                    <div key={item} className="relative group">
                      <Badge 
                        variant={preferences.taste.includes(item) ? 'default' : 'outline'}
                        className="cursor-pointer transition-all hover:scale-105 px-4 py-2 text-sm pr-8"
                        onClick={() => {
                          const newTaste = preferences.taste.includes(item)
                            ? preferences.taste.filter(t => t !== item)
                            : [...preferences.taste, item];
                          const newPreferences = { ...preferences, taste: newTaste };
                          setPreferences(newPreferences);
                          localStorage.setItem('preferences', JSON.stringify(newPreferences));
                        }}
                      >
                        {item}
                      </Badge>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteOption('taste', item);
                        }}
                        className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 忌口食材 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-foreground">忌口食材</div>
                  <button 
                    onClick={() => setShowAddInput({ ...showAddInput, avoid: !showAddInput.avoid })}
                    className="text-primary hover:text-primary/80 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                {showAddInput.avoid && (
                  <div className="flex gap-2">
                    <Input 
                      placeholder="输入新选项" 
                      value={newTagInputs.avoid}
                      onChange={(e) => setNewTagInputs({ ...newTagInputs, avoid: e.target.value })}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddOption('avoid')}
                      className="flex-1"
                    />
                    <button 
                      onClick={() => handleAddOption('avoid')}
                      className="px-3 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                    >
                      添加
                    </button>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {preferences.avoidOptions.map((item) => (
                    <div key={item} className="relative group">
                      <Badge 
                        variant={preferences.avoid.includes(item) ? 'default' : 'outline'}
                        className="cursor-pointer transition-all hover:scale-105 px-4 py-2 text-sm pr-8"
                        onClick={() => {
                          const newAvoid = preferences.avoid.includes(item)
                            ? preferences.avoid.filter(a => a !== item)
                            : [...preferences.avoid, item];
                          const newPreferences = { ...preferences, avoid: newAvoid };
                          setPreferences(newPreferences);
                          localStorage.setItem('preferences', JSON.stringify(newPreferences));
                        }}
                      >
                        {item}
                      </Badge>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteOption('avoid', item);
                        }}
                        className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

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
