-- ==========================================
-- Supabase数据追踪表结构
-- 用于存储所有用户的分析数据
-- ==========================================

-- 1. 创建events表（存储所有事件）
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 事件基本信息
  event_type TEXT NOT NULL,
  user_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- UTM参数（渠道追踪）
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  
  -- 事件属性（JSON格式存储）
  properties JSONB,
  
  -- 用户环境信息
  user_agent TEXT,
  referrer TEXT,
  
  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 创建索引（提升查询性能）
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_utm_source ON analytics_events(utm_source);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);

-- 3. 创建用户首次访问表（记录用户首次访问信息）
CREATE TABLE IF NOT EXISTS analytics_users (
  user_id TEXT PRIMARY KEY,
  first_visit TIMESTAMPTZ NOT NULL,
  
  -- 首次访问的UTM参数（归因）
  first_utm_source TEXT,
  first_utm_medium TEXT,
  first_utm_campaign TEXT,
  first_utm_content TEXT,
  first_utm_term TEXT,
  
  -- 统计信息
  total_sessions INTEGER DEFAULT 1,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 创建索引
CREATE INDEX IF NOT EXISTS idx_analytics_users_first_visit ON analytics_users(first_visit);
CREATE INDEX IF NOT EXISTS idx_analytics_users_first_utm_source ON analytics_users(first_utm_source);
CREATE INDEX IF NOT EXISTS idx_analytics_users_last_seen ON analytics_users(last_seen);

-- 5. 启用RLS（Row Level Security）- 允许所有人插入和读取
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_users ENABLE ROW LEVEL SECURITY;

-- 允许匿名用户插入事件数据
CREATE POLICY "Allow anonymous insert on analytics_events" 
  ON analytics_events 
  FOR INSERT 
  TO anon 
  WITH CHECK (true);

-- 允许匿名用户读取事件数据（用于统计）
CREATE POLICY "Allow anonymous select on analytics_events" 
  ON analytics_events 
  FOR SELECT 
  TO anon 
  USING (true);

-- 允许匿名用户插入用户数据
CREATE POLICY "Allow anonymous insert on analytics_users" 
  ON analytics_users 
  FOR INSERT 
  TO anon 
  WITH CHECK (true);

-- 允许匿名用户更新自己的用户数据
CREATE POLICY "Allow anonymous update on analytics_users" 
  ON analytics_users 
  FOR UPDATE 
  TO anon 
  USING (true);

-- 允许匿名用户读取用户数据
CREATE POLICY "Allow anonymous select on analytics_users" 
  ON analytics_users 
  FOR SELECT 
  TO anon 
  USING (true);

-- 6. 创建视图：每日UV统计
CREATE OR REPLACE VIEW daily_uv AS
SELECT 
  DATE(timestamp) as date,
  COUNT(DISTINCT user_id) as uv,
  COUNT(*) as total_events
FROM analytics_events
GROUP BY DATE(timestamp)
ORDER BY date DESC;

-- 7. 创建视图：渠道来源统计
CREATE OR REPLACE VIEW channel_stats AS
SELECT 
  COALESCE(utm_source, 'direct') as channel,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(*) as total_events
FROM analytics_events
GROUP BY COALESCE(utm_source, 'direct')
ORDER BY unique_users DESC;

-- 8. 创建视图：事件类型统计
CREATE OR REPLACE VIEW event_type_stats AS
SELECT 
  event_type,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(*) as total_count,
  DATE(MAX(timestamp)) as last_occurrence
FROM analytics_events
GROUP BY event_type
ORDER BY total_count DESC;

-- ==========================================
-- 完成！
-- 在Supabase Dashboard中执行此SQL脚本
-- ==========================================
