// ==========================================
// 数据追踪分析工具
// 功能：UTM参数、匿名用户ID、事件埋点、数据上报
// ==========================================

import { supabase } from './supabase';

// ========== 1. 用户标识管理 ==========
/**
 * 生成唯一的匿名用户ID
 */
export function generateUserId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 11);
  return `user_${timestamp}_${random}`;
}

/**
 * 获取或创建匿名用户ID（存储在localStorage）
 */
export function getUserId(): string {
  const STORAGE_KEY = 'anonymous_user_id';
  let userId = localStorage.getItem(STORAGE_KEY);
  
  if (!userId) {
    userId = generateUserId();
    localStorage.setItem(STORAGE_KEY, userId);
    console.log('[Analytics] 新用户ID已创建:', userId);
  }
  
  return userId;
}

/**
 * 获取用户首次访问时间
 */
export function getFirstVisitTime(): string {
  const STORAGE_KEY = 'first_visit_time';
  let firstVisit = localStorage.getItem(STORAGE_KEY);
  
  if (!firstVisit) {
    firstVisit = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, firstVisit);
  }
  
  return firstVisit;
}

// ========== 2. UTM参数管理 ==========
export interface UTMParams {
  utm_source?: string;      // 渠道来源: canteen/biaobai/qzone/kol/dorm
  utm_medium?: string;       // 媒介类型: offline/social/kol/qr
  utm_campaign?: string;     // 活动名称: w1_launch
  utm_content?: string;      // 创意版本: copyA/copyB/storyA
  utm_term?: string;         // 可选标识: dorm-3-414 / 2025w45
}

/**
 * 从URL中解析UTM参数
 */
export function parseUTMParams(): UTMParams {
  const params = new URLSearchParams(window.location.search);
  
  return {
    utm_source: params.get('utm_source') || undefined,
    utm_medium: params.get('utm_medium') || undefined,
    utm_campaign: params.get('utm_campaign') || undefined,
    utm_content: params.get('utm_content') || undefined,
    utm_term: params.get('utm_term') || undefined,
  };
}

/**
 * 保存UTM参数到localStorage（仅首次有效，用于归因）
 */
export function saveUTMParams(params: UTMParams): void {
  const STORAGE_KEY = 'utm_params';
  
  // 只在第一次访问时保存UTM参数（首次归因原则）
  if (!localStorage.getItem(STORAGE_KEY)) {
    // 过滤掉undefined值
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined)
    );
    
    if (Object.keys(cleanParams).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanParams));
      console.log('[Analytics] UTM参数已保存:', cleanParams);
    }
  }
}

/**
 * 获取保存的UTM参数
 */
export function getUTMParams(): UTMParams {
  const STORAGE_KEY = 'utm_params';
  const stored = localStorage.getItem(STORAGE_KEY);
  
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return {};
    }
  }
  
  return {};
}

// ========== 3. 事件定义 ==========
export type EventType = 
  | 'app_launch'        // 应用启动
  | 'page_view'         // 页面浏览
  | 'mode_selected'     // 模式选择（系统推荐/自定义）
  | 'draw_clicked'      // 点击抽取按钮
  | 'draw_result'       // 抽取结果展示
  | 'draw_again'        // 再抽一次
  | 'share_clicked'     // 点击分享
  | 'favorite_added'    // 添加收藏
  | 'favorite_removed'  // 取消收藏
  | 'custom_item_added' // 添加自定义店铺
  | 'custom_item_removed'; // 删除自定义店铺

export interface EventData {
  event_type: EventType;
  user_id: string;
  timestamp: string;
  session_id: string;
  
  // UTM参数（归因）
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  
  // 事件特定属性
  properties?: Record<string, any>;
}

// ========== 4. 会话管理 ==========
/**
 * 获取或创建会话ID（30分钟无操作后过期）
 */
export function getSessionId(): string {
  const STORAGE_KEY = 'session_id';
  const TIMESTAMP_KEY = 'session_timestamp';
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30分钟
  
  const storedSessionId = sessionStorage.getItem(STORAGE_KEY);
  const storedTimestamp = sessionStorage.getItem(TIMESTAMP_KEY);
  
  const now = Date.now();
  
  // 检查会话是否过期
  if (storedSessionId && storedTimestamp) {
    const lastActivity = parseInt(storedTimestamp);
    if (now - lastActivity < SESSION_TIMEOUT) {
      // 更新时间戳
      sessionStorage.setItem(TIMESTAMP_KEY, now.toString());
      return storedSessionId;
    }
  }
  
  // 创建新会话
  const newSessionId = `session_${now}_${Math.random().toString(36).substring(2, 9)}`;
  sessionStorage.setItem(STORAGE_KEY, newSessionId);
  sessionStorage.setItem(TIMESTAMP_KEY, now.toString());
  
  return newSessionId;
}

// ========== 5. 事件上报 ==========
/**
 * 上报事件到Supabase
 */
async function sendToSupabase(eventData: EventData): Promise<void> {
  try {
    const { error } = await supabase
      .from('analytics_events')
      .insert([{
        event_type: eventData.event_type,
        user_id: eventData.user_id,
        session_id: eventData.session_id,
        timestamp: eventData.timestamp,
        utm_source: eventData.utm_source,
        utm_medium: eventData.utm_medium,
        utm_campaign: eventData.utm_campaign,
        utm_content: eventData.utm_content,
        utm_term: eventData.utm_term,
        properties: eventData.properties,
        user_agent: navigator.userAgent,
        referrer: document.referrer || null,
      }]);
    
    if (error) {
      console.error('[Analytics] Supabase上报失败:', error);
    }
  } catch (err) {
    console.error('[Analytics] Supabase上报异常:', err);
  }
}

/**
 * 记录事件（同时存储到localStorage和Supabase）
 */
export function trackEvent(eventType: EventType, properties?: Record<string, any>): void {
  const userId = getUserId();
  const sessionId = getSessionId();
  const utmParams = getUTMParams();
  
  const eventData: EventData = {
    event_type: eventType,
    user_id: userId,
    timestamp: new Date().toISOString(),
    session_id: sessionId,
    ...utmParams,
    properties,
  };
  
  // 1. 存储到localStorage（用于本地备份和离线查看）
  const STORAGE_KEY = 'analytics_events';
  const events = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  events.push(eventData);
  
  // 只保留最近100
  if (events.length > 1000) {
    events.splice(0, events.length - 1000);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  
  // 2. 上报到Supabase（异步，不阻塞用户操作）
  sendToSupabase(eventData).catch(err => {
    console.error('[Analytics] Supabase上报失败:', err);
  });
  
  // 控制台输出（开发调试用）
  console.log('[Analytics] 事件已记录:', eventType, properties || '');
}

// ========== 6. 初始化函数 ==========
/**
 * 初始化分析工具（在应用启动时调用）
 */
export function initAnalytics(): void {
  // 1. 获取或创建用户ID
  const userId = getUserId();
  
  // 2. 解析并保存UTM参数
  const utmParams = parseUTMParams();
  saveUTMParams(utmParams);
  
  // 3. 获取首次访问时间
  const firstVisit = getFirstVisitTime();
  
  // 4. 发送app_launch事件
  trackEvent('app_launch', {
    first_visit: firstVisit,
    referrer: document.referrer || 'direct',
    user_agent: navigator.userAgent,
    screen_width: window.screen.width,
    screen_height: window.screen.height,
  });
  
  console.log('[Analytics] 分析工具已初始化');
  console.log('用户ID:', userId);
  console.log('UTM参数:', utmParams);
}

// ========== 7. 统计计算函数 ==========
/**
 * 获取所有事件数据
 */
export function getAllEvents(): EventData[] {
  const STORAGE_KEY = 'analytics_events';
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

/**
 * 获取今日事件数据
 */
export function getTodayEvents(): EventData[] {
  const events = getAllEvents();
  const today = new Date().toDateString();
  
  return events.filter(e => {
    const eventDate = new Date(e.timestamp).toDateString();
    return eventDate === today;
  });
}

/**
 * 获取指定日期的事件数据
 */
export function getEventsByDate(date: Date): EventData[] {
  const events = getAllEvents();
  const targetDate = date.toDateString();
  
  return events.filter(e => {
    const eventDate = new Date(e.timestamp).toDateString();
    return eventDate === targetDate;
  });
}

/**
 * 计算UV（独立访客） - 今日
 */
export function getTodayUV(): number {
  const todayEvents = getTodayEvents();
  const uniqueUsers = new Set(todayEvents.map(e => e.user_id));
  return uniqueUsers.size;
}

/**
 * 计算UV（独立访客） - 指定日期范围
 */
export function getUVByDateRange(startDate: Date, endDate: Date): number {
  const events = getAllEvents();
  const start = startDate.getTime();
  const end = endDate.getTime();
  
  const rangeEvents = events.filter(e => {
    const eventTime = new Date(e.timestamp).getTime();
    return eventTime >= start && eventTime <= end;
  });
  
  const uniqueUsers = new Set(rangeEvents.map(e => e.user_id));
  return uniqueUsers.size;
}

/**
 * 计算转化率（打开后实际使用的比例）
 * 定义：有draw_clicked事件的用户 / 有app_launch事件的用户
 */
export function getConversionRate(): number {
  const events = getAllEvents();
  
  // 统计有app_launch的用户（打开过的）
  const launchUsers = new Set(
    events.filter(e => e.event_type === 'app_launch').map(e => e.user_id)
  );
  
  // 统计有draw_clicked的用户（实际使用的）
  const drawUsers = new Set(
    events.filter(e => e.event_type === 'draw_clicked').map(e => e.user_id)
  );
  
  if (launchUsers.size === 0) return 0;
  
  return (drawUsers.size / launchUsers.size) * 100;
}

/**
 * 计算分享率（使用后分享的比例）
 * 定义：有share_clicked的用户 / 有draw_clicked的用户
 */
export function getShareRate(): number {
  const events = getAllEvents();
  
  const drawUsers = new Set(
    events.filter(e => e.event_type === 'draw_clicked').map(e => e.user_id)
  );
  const shareUsers = new Set(
    events.filter(e => e.event_type === 'share_clicked').map(e => e.user_id)
  );
  
  if (drawUsers.size === 0) return 0;
  
  return (shareUsers.size / drawUsers.size) * 100;
}

/**
 * 计算留存率（Day N留存）
 * @param day 第几天（1=次日，7=第7日）
 */
export function getRetentionRate(day: number): number {
  const events = getAllEvents();
  const firstVisit = getFirstVisitTime();
  const firstDate = new Date(firstVisit);
  const targetDate = new Date(firstDate);
  targetDate.setDate(targetDate.getDate() + day);
  
  // 首日活跃用户
  const firstDayUsers = new Set(
    events.filter(e => {
      const eventDate = new Date(e.timestamp).toDateString();
      return eventDate === firstDate.toDateString();
    }).map(e => e.user_id)
  );
  
  // 目标日期活跃用户（且在首日活跃过的）
  const targetDayUsers = new Set(
    events.filter(e => {
      const eventDate = new Date(e.timestamp).toDateString();
      return eventDate === targetDate.toDateString() && firstDayUsers.has(e.user_id);
    }).map(e => e.user_id)
  );
  
  if (firstDayUsers.size === 0) return 0;
  
  return (targetDayUsers.size / firstDayUsers.size) * 100;
}

/**
 * 计算有效用户数（当周至少抽取1次的用户）
 */
export function getActiveUsers(): number {
  const events = getAllEvents();
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay()); // 本周第一天
  weekStart.setHours(0, 0, 0, 0);
  
  const weekEvents = events.filter(e => {
    const eventTime = new Date(e.timestamp);
    return eventTime >= weekStart && e.event_type === 'draw_clicked';
  });
  
  const activeUsers = new Set(weekEvents.map(e => e.user_id));
  return activeUsers.size;
}

/**
 * 获取活跃时段统计
 */
export function getActiveHours(): Record<number, number> {
  const events = getAllEvents();
  const hourCounts: Record<number, number> = {};
  
  events.forEach(event => {
    const hour = new Date(event.timestamp).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  
  return hourCounts;
}

/**
 * 获取渠道来源统计
 */
export function getChannelStats(): Record<string, number> {
  const events = getAllEvents();
  const channelCounts: Record<string, number> = {};
  
  events.forEach(event => {
    if (event.utm_source) {
      channelCounts[event.utm_source] = (channelCounts[event.utm_source] || 0) + 1;
    } else {
      channelCounts['direct'] = (channelCounts['direct'] || 0) + 1;
    }
  });
  
  return channelCounts;
}

// ========== 8. 数据导出 ==========
/**
 * 导出所有分析数据（用于数据分析）
 */
export function exportAnalyticsData(): string {
  const data = {
    user_id: getUserId(),
    first_visit: getFirstVisitTime(),
    utm_params: getUTMParams(),
    events: getAllEvents(),
    stats: {
      conversion_rate: getConversionRate(),
      share_rate: getShareRate(),
      active_hours: getActiveHours(),
    },
  };
  
  return JSON.stringify(data, null, 2);
}

/**
 * 清空所有分析数据（仅用于测试）
 */
export function clearAnalyticsData(): void {
  localStorage.removeItem('analytics_events');
  console.log('[Analytics] 数据已清空');
}
