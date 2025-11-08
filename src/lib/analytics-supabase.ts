// ==========================================
// 从Supabase读取所有用户的分析数据
// ==========================================

import { supabase } from './supabase';
import type { EventData } from './analytics';

// 时间范围类型
export type TimeRange = 'today' | 'yesterday' | 'week' | 'month' | 'year' | 'all';

/**
 * 获取时间范围的起始日期
 */
export function getTimeRangeStart(range: TimeRange): Date | null {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (range) {
    case 'today':
      return today;
    case 'yesterday': {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday;
    }
    case 'week': {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      return weekStart;
    }
    case 'month': {
      return new Date(now.getFullYear(), now.getMonth(), 1);
    }
    case 'year': {
      return new Date(now.getFullYear(), 0, 1);
    }
    case 'all':
      return null;
    default:
      return today;
  }
}

/**
 * 获取时间范围的结束日期
 */
export function getTimeRangeEnd(range: TimeRange): Date {
  const now = new Date();
  
  if (range === 'yesterday') {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return today;
  }
  
  return now;
}

/**
 * 从Supabase获取所有事件数据
 */
export async function getAllEventsFromSupabase(timeRange?: TimeRange): Promise<EventData[]> {
  try {
    let query = supabase
      .from('analytics_events')
      .select('*')
      .order('timestamp', { ascending: false });
    
    // 添加时间范围过滤
    if (timeRange && timeRange !== 'all') {
      const startDate = getTimeRangeStart(timeRange);
      if (startDate) {
        query = query.gte('timestamp', startDate.toISOString());
      }
    }
    
    const { data, error } = await query.limit(1000);  // 最近1000条
    
    if (error) {
      console.error('[Analytics] 获取Supabase数据失败:', error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error('[Analytics] 获取Supabase数据异常:', err);
    return [];
  }
}

/**
 * 获取今日UV（从Supabase）
 */
export async function getTodayUVFromSupabase(): Promise<number> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data, error } = await supabase
      .from('analytics_events')
      .select('user_id')
      .gte('timestamp', today.toISOString());
    
    if (error) {
      console.error('[Analytics] 获取今日UV失败:', error);
      return 0;
    }
    
    const uniqueUsers = new Set(data.map(e => e.user_id));
    return uniqueUsers.size;
  } catch (err) {
    console.error('[Analytics] 获取今日UV异常:', err);
    return 0;
  }
}

/**
 * 计算转化率（从Supabase）
 */
export async function getConversionRateFromSupabase(): Promise<number> {
  try {
    // 获取有app_launch的用户
    const { data: launchData, error: launchError } = await supabase
      .from('analytics_events')
      .select('user_id')
      .eq('event_type', 'app_launch');
    
    if (launchError) throw launchError;
    
    // 获取有draw_clicked的用户
    const { data: drawData, error: drawError } = await supabase
      .from('analytics_events')
      .select('user_id')
      .eq('event_type', 'draw_clicked');
    
    if (drawError) throw drawError;
    
    const launchUsers = new Set(launchData.map(e => e.user_id));
    const drawUsers = new Set(drawData.map(e => e.user_id));
    
    if (launchUsers.size === 0) return 0;
    
    return (drawUsers.size / launchUsers.size) * 100;
  } catch (err) {
    console.error('[Analytics] 计算转化率失败:', err);
    return 0;
  }
}

/**
 * 计算分享率（从Supabase）
 */
export async function getShareRateFromSupabase(): Promise<number> {
  try {
    const { data: drawData, error: drawError } = await supabase
      .from('analytics_events')
      .select('user_id')
      .eq('event_type', 'draw_clicked');
    
    if (drawError) throw drawError;
    
    const { data: shareData, error: shareError } = await supabase
      .from('analytics_events')
      .select('user_id')
      .eq('event_type', 'share_clicked');
    
    if (shareError) throw shareError;
    
    const drawUsers = new Set(drawData.map(e => e.user_id));
    const shareUsers = new Set(shareData.map(e => e.user_id));
    
    if (drawUsers.size === 0) return 0;
    
    return (shareUsers.size / drawUsers.size) * 100;
  } catch (err) {
    console.error('[Analytics] 计算分享率失败:', err);
    return 0;
  }
}

/**
 * 获取渠道统计（从Supabase）
 */
export async function getChannelStatsFromSupabase(): Promise<Record<string, number>> {
  try {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('utm_source');
    
    if (error) throw error;
    
    const channelCounts: Record<string, number> = {};
    
    data.forEach(event => {
      const channel = event.utm_source || 'direct';
      channelCounts[channel] = (channelCounts[channel] || 0) + 1;
    });
    
    return channelCounts;
  } catch (err) {
    console.error('[Analytics] 获取渠道统计失败:', err);
    return {};
  }
}

/**
 * 获取本周有效用户数（从Supabase）
 */
export async function getActiveUsersFromSupabase(): Promise<number> {
  try {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const { data, error } = await supabase
      .from('analytics_events')
      .select('user_id')
      .eq('event_type', 'draw_clicked')
      .gte('timestamp', weekStart.toISOString());
    
    if (error) throw error;
    
    const activeUsers = new Set(data.map(e => e.user_id));
    return activeUsers.size;
  } catch (err) {
    console.error('[Analytics] 获取有效用户数失败:', err);
    return 0;
  }
}

/**
 * 获取活跃时段统计（从Supabase）
 */
export async function getActiveHoursFromSupabase(): Promise<Record<number, number>> {
  try {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('timestamp');
    
    if (error) throw error;
    
    const hourCounts: Record<number, number> = {};
    
    data.forEach(event => {
      const hour = new Date(event.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    
    return hourCounts;
  } catch (err) {
    console.error('[Analytics] 获取活跃时段失败:', err);
    return {};
  }
}

/**
 * 获取昨天的数据（用于环比计算）
 */
export async function getYesterdayData(): Promise<{ uv: number; events: number }> {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data, error } = await supabase
      .from('analytics_events')
      .select('user_id')
      .gte('timestamp', yesterday.toISOString())
      .lt('timestamp', today.toISOString());
    
    if (error) throw error;
    
    return {
      uv: new Set(data.map(e => e.user_id)).size,
      events: data.length
    };
  } catch (err) {
    console.error('[获取昨天数据失败]:', err);
    return { uv: 0, events: 0 };
  }
}

/**
 * 计算次日留存率
 */
export async function getRetentionRate(days: number = 1): Promise<number> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() - days);
    
    const dayAfterTarget = new Date(targetDate);
    dayAfterTarget.setDate(dayAfterTarget.getDate() + 1);
    
    // 获取目标日期的用户
    const { data: targetDayData, error: targetError } = await supabase
      .from('analytics_events')
      .select('user_id')
      .gte('timestamp', targetDate.toISOString())
      .lt('timestamp', dayAfterTarget.toISOString());
    
    if (targetError) throw targetError;
    
    const targetUsers = new Set(targetDayData.map(e => e.user_id));
    
    if (targetUsers.size === 0) return 0;
    
    // 获取第二天的用户
    const returnDate = new Date(dayAfterTarget);
    const dayAfterReturn = new Date(returnDate);
    dayAfterReturn.setDate(dayAfterReturn.getDate() + 1);
    
    const { data: returnData, error: returnError } = await supabase
      .from('analytics_events')
      .select('user_id')
      .gte('timestamp', returnDate.toISOString())
      .lt('timestamp', dayAfterReturn.toISOString());
    
    if (returnError) throw returnError;
    
    // 计算留存用户
    const returnUsers = returnData.filter(e => targetUsers.has(e.user_id));
    const retentionUsers = new Set(returnUsers.map(e => e.user_id));
    
    return (retentionUsers.size / targetUsers.size) * 100;
  } catch (err) {
    console.error('[计算留存率失败]:', err);
    return 0;
  }
}

/**
 * 获取最近N天的趋势数据
 */
export async function getTrendData(days: number = 7): Promise<Array<{ date: string; uv: number; events: number }>> {
  try {
    const result = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const { data, error } = await supabase
        .from('analytics_events')
        .select('user_id')
        .gte('timestamp', date.toISOString())
        .lt('timestamp', nextDate.toISOString());
      
      if (error) throw error;
      
      result.push({
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        uv: new Set(data.map(e => e.user_id)).size,
        events: data.length
      });
    }
    
    return result;
  } catch (err) {
    console.error('[获取趋势数据失败]:', err);
    return [];
  }
}

/**
 * 获取周分布数据（周一到周日）
 */
export async function getWeekDistribution(): Promise<Record<string, number>> {
  try {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('timestamp');
    
    if (error) throw error;
    
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekCounts: Record<string, number> = {};
    
    weekDays.forEach(day => weekCounts[day] = 0);
    
    data.forEach(event => {
      const date = new Date(event.timestamp);
      const dayOfWeek = date.getDay();
      weekCounts[weekDays[dayOfWeek]]++;
    });
    
    return weekCounts;
  } catch (err) {
    console.error('[获取周分布失败]:', err);
    return {};
  }
}

/**
 * 获取最热门的抽取结果 Top N
 */
export async function getTopDrawResults(limit: number = 10): Promise<Array<{ name: string; count: number }>> {
  try {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('properties')
      .eq('event_type', 'draw_result');
    
    if (error) throw error;
    
    // 统计每个结果的出现次数
    const resultCounts: Record<string, number> = {};
    
    data.forEach(event => {
      if (event.properties && event.properties.result) {
        const result = event.properties.result;
        resultCounts[result] = (resultCounts[result] || 0) + 1;
      }
    });
    
    // 转换为数组并排序
    return Object.entries(resultCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  } catch (err) {
    console.error('[获取热门结果失败]:', err);
    return [];
  }
}

/**
 * 根据自定义日期范围获取统计摘要
 */
export async function getAnalyticsSummaryByCustomRange(startDate: Date, endDate: Date) {
  try {
    // 直接使用自定义日期范围查询
    let query = supabase
      .from('analytics_events')
      .select('*')
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString())
      .order('timestamp', { ascending: false })
      .limit(10000);
    
    const { data: allEvents, error } = await query;
    
    if (error) {
      console.error('[Analytics] 获取数据失败:', error);
      return null;
    }
    
    if (!allEvents || allEvents.length === 0) {
      return {
        allEvents: [],
        summary: {
          totalUV: 0,
          todayUV: 0,
          totalEvents: 0,
          drawCount: 0,
          shareCount: 0,
          conversionRate: 0,
          shareRate: 0,
          activeUsers: 0,
          uvChange: 0,
          eventsChange: 0,
          retention1Day: 0,
          retention7Day: 0,
        },
        channelStats: {},
        activeHours: {},
        trendData: [],
        weekDistribution: {},
        topDrawResults: []
      };
    }
    
    // 计算指标
    const totalUV = new Set(allEvents.map(e => e.user_id)).size;
    const totalEvents = allEvents.length;
    const drawCount = allEvents.filter(e => e.event_type === 'draw_clicked').length;
    const shareCount = allEvents.filter(e => e.event_type === 'share_clicked').length;
    
    // 计算今日UV
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEvents = allEvents.filter(e => new Date(e.timestamp) >= today);
    const todayUV = new Set(todayEvents.map(e => e.user_id)).size;
    
    // 计算转化率
    const launchUsers = new Set(
      allEvents.filter(e => e.event_type === 'app_launch').map(e => e.user_id)
    );
    const drawUsers = new Set(
      allEvents.filter(e => e.event_type === 'draw_clicked').map(e => e.user_id)
    );
    const conversionRate = launchUsers.size === 0 ? 0 : (drawUsers.size / launchUsers.size) * 100;
    
    // 计算分享率
    const shareUsers = new Set(
      allEvents.filter(e => e.event_type === 'share_clicked').map(e => e.user_id)
    );
    const shareRate = drawUsers.size === 0 ? 0 : (shareUsers.size / drawUsers.size) * 100;
    
    // 计算活跃用户
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEvents = allEvents.filter(e => 
      new Date(e.timestamp) >= weekStart && e.event_type === 'draw_clicked'
    );
    const activeUsers = new Set(weekEvents.map(e => e.user_id)).size;
    
    // 渠道统计
    const channelCounts: Record<string, number> = {};
    allEvents.forEach(event => {
      const channel = event.utm_source || 'direct';
      channelCounts[channel] = (channelCounts[channel] || 0) + 1;
    });
    
    // 活跃时段
    const hourCounts: Record<number, number> = {};
    allEvents.forEach(event => {
      const hour = new Date(event.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    
    // 周分布
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekCounts: Record<string, number> = {};
    weekDays.forEach(day => weekCounts[day] = 0);
    allEvents.forEach(event => {
      const date = new Date(event.timestamp);
      const dayOfWeek = date.getDay();
      weekCounts[weekDays[dayOfWeek]]++;
    });
    
    // 热门抽取结果
    const resultCounts: Record<string, number> = {};
    allEvents
      .filter(e => e.event_type === 'draw_result')
      .forEach(event => {
        if (event.properties && event.properties.result) {
          const result = event.properties.result;
          resultCounts[result] = (resultCounts[result] || 0) + 1;
        }
      });
    const topDrawResults = Object.entries(resultCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // 趋势数据（简化版）
    const trendData = [];
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysToShow = Math.min(daysDiff + 1, 30); // 最多显示30天
    
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(endDate);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const dayEvents = allEvents.filter(e => {
        const eventDate = new Date(e.timestamp);
        return eventDate >= date && eventDate < nextDate;
      });
      
      trendData.push({
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        uv: new Set(dayEvents.map(e => e.user_id)).size,
        events: dayEvents.length
      });
    }
    
    return {
      allEvents: allEvents.slice(0, 10),
      summary: {
        totalUV,
        todayUV,
        totalEvents,
        drawCount,
        shareCount,
        conversionRate,
        shareRate,
        activeUsers,
        uvChange: 0,
        eventsChange: 0,
        retention1Day: 0,
        retention7Day: 0,
      },
      channelStats: channelCounts,
      activeHours: hourCounts,
      trendData,
      weekDistribution: weekCounts,
      topDrawResults
    };
  } catch (err) {
    console.error('[Analytics] 获取自定义范围统计失败:', err);
    return null;
  }
}

/**
 * 获取统计摘要（所有关键指标）
 */
export async function getAnalyticsSummary(timeRange: TimeRange = 'all') {
  try {
    const startDate = getTimeRangeStart(timeRange);
    const endDate = getTimeRangeEnd(timeRange);
    
    // 获取时间范围内的所有事件
    const allEvents = await getAllEventsFromSupabase(timeRange);
    
    // 计算指标
    const totalUV = new Set(allEvents.map(e => e.user_id)).size;
    const totalEvents = allEvents.length;
    const drawCount = allEvents.filter(e => e.event_type === 'draw_clicked').length;
    const shareCount = allEvents.filter(e => e.event_type === 'share_clicked').length;
    
    // 计算今日UV（仅当前日的数据）
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEvents = allEvents.filter(e => new Date(e.timestamp) >= today);
    const todayUV = new Set(todayEvents.map(e => e.user_id)).size;
    
    // 计算转化率
    const launchUsers = new Set(
      allEvents.filter(e => e.event_type === 'app_launch').map(e => e.user_id)
    );
    const drawUsers = new Set(
      allEvents.filter(e => e.event_type === 'draw_clicked').map(e => e.user_id)
    );
    const conversionRate = launchUsers.size === 0 ? 0 : (drawUsers.size / launchUsers.size) * 100;
    
    // 计算分享率
    const shareUsers = new Set(
      allEvents.filter(e => e.event_type === 'share_clicked').map(e => e.user_id)
    );
    const shareRate = drawUsers.size === 0 ? 0 : (shareUsers.size / drawUsers.size) * 100;
    
    // 计算有效用户
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEvents = allEvents.filter(e => 
      new Date(e.timestamp) >= weekStart && e.event_type === 'draw_clicked'
    );
    const activeUsers = new Set(weekEvents.map(e => e.user_id)).size;
    
    // 渠道统计
    const channelCounts: Record<string, number> = {};
    allEvents.forEach(event => {
      const channel = event.utm_source || 'direct';
      channelCounts[channel] = (channelCounts[channel] || 0) + 1;
    });
    
    // 活跃时段
    const hourCounts: Record<number, number> = {};
    allEvents.forEach(event => {
      const hour = new Date(event.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    
    // 并行获取额外数据
    const [
      yesterdayData,
      retention1Day,
      retention7Day,
      trendData,
      weekDistribution,
      topDrawResults
    ] = await Promise.all([
      getYesterdayData(),
      getRetentionRate(1),
      getRetentionRate(7),
      getTrendData(7),
      getWeekDistribution(),
      getTopDrawResults(10)
    ]);
    
    // 计算环比增长
    const uvChange = yesterdayData.uv > 0 ? ((todayUV - yesterdayData.uv) / yesterdayData.uv) * 100 : 0;
    const eventsChange = yesterdayData.events > 0 ? ((todayEvents.length - yesterdayData.events) / yesterdayData.events) * 100 : 0;
    
    return {
      allEvents,
      summary: {
        totalUV,
        todayUV,
        totalEvents,
        drawCount,
        shareCount,
        conversionRate,
        shareRate,
        activeUsers,
        // 新增数据
        uvChange,
        eventsChange,
        retention1Day,
        retention7Day,
      },
      channelStats: channelCounts,
      activeHours: hourCounts,
      // 新增数据
      trendData,
      weekDistribution,
      topDrawResults
    };
  } catch (err) {
    console.error('[Analytics] 获取统计摘要失败:', err);
    return null;
  }
}
