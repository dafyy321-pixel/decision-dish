// ==========================================
// 从Supabase读取所有用户的分析数据
// ==========================================

import { supabase } from './supabase';
import type { EventData } from './analytics';

/**
 * 从Supabase获取所有事件数据
 */
export async function getAllEventsFromSupabase(): Promise<EventData[]> {
  try {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(1000);  // 最近1000条
    
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
 * 获取统计摘要（所有关键指标）
 */
export async function getAnalyticsSummary() {
  try {
    const [
      allEvents,
      todayUV,
      conversionRate,
      shareRate,
      activeUsers,
      channelStats,
      activeHours
    ] = await Promise.all([
      getAllEventsFromSupabase(),
      getTodayUVFromSupabase(),
      getConversionRateFromSupabase(),
      getShareRateFromSupabase(),
      getActiveUsersFromSupabase(),
      getChannelStatsFromSupabase(),
      getActiveHoursFromSupabase()
    ]);
    
    const totalUV = new Set(allEvents.map(e => e.user_id)).size;
    const totalEvents = allEvents.length;
    const drawCount = allEvents.filter(e => e.event_type === 'draw_clicked').length;
    const shareCount = allEvents.filter(e => e.event_type === 'share_clicked').length;
    
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
      },
      channelStats,
      activeHours
    };
  } catch (err) {
    console.error('[Analytics] 获取统计摘要失败:', err);
    return null;
  }
}
