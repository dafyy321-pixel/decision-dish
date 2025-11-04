# Supabase 数据库配置

## 🎯 配置概览

本项目支持 **Supabase 云端数据 + 本地回退** 双层架构：
- 优先从 Supabase 获取餐厅数据
- 若请求失败或返回空数据，自动回退到 `src/data/restaurants.ts` 本地数据
- 注意：当前 `src/lib/supabase.ts` 在未配置 .env 时会抛错，请先配置或按下文“静默降级方案”改造
- 应用可完全离线使用（采用回退数据）

## 配置步骤

### 1. 安装依赖（✅ 已完成）
```bash
npm install @supabase/supabase-js
```

### 2. 环境变量配置（可选）

**步骤1**: 创建 `.env` 文件
```bash
# 复制模板文件
cp .env.example .env
```

**步骤2**: 填写 Supabase 配置
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**步骤3**: 获取配置信息
1. 访问 [Supabase Dashboard](https://app.supabase.com/)
2. 选择你的项目
3. 进入 `Settings` > `API`
4. 复制 `Project URL` 和 `anon public` key

> 🚨 **重要**：`.env` 文件已在 `.gitignore` 中，切勿提交到版本库

> ℹ️ **提示**：未配置 Supabase 时，应用会自动使用本地 20 家预设餐厅

### 3. 使用 Supabase 客户端

**基本用法**：
```typescript
import { supabase } from '@/lib/supabase'

// 查询餐厅数据
const { data, error } = await supabase
  .from('restaurants')
  .select('*')
  .eq('is_active', true)
  .order('name')

// 插入餐厅数据
const { data, error } = await supabase
  .from('restaurants')
  .insert([{ 
    name: '麦当劳', 
    address: '大学路123号',
    category: '快餐',
    is_active: true 
  }])
```

**数据回退策略**（在 `src/pages/Index.tsx` 中实现）：
```typescript
// 使用云端数据；为空则回退本地 + 类型映射
const { data: supabaseRestaurants } = useRestaurants();

const restaurants: Restaurant[] =
  Array.isArray(supabaseRestaurants) && supabaseRestaurants.length > 0
    ? supabaseRestaurants.map(r => ({
        id: r.id,
        name: r.name,
        address: r.address ?? '',
        category: r.category ?? ''
      }))
    : presetRestaurants; // 本地 20 家预设餐厅
```

## 文件结构

- `src/lib/supabase.ts` - Supabase 客户端配置
- `src/types/database.types.ts` - 数据库类型定义
- `.env` - 环境变量（不提交到 git）
- `.env.example` - 环境变量模板

## ✅ 已完成配置

1. ✅ 创建了 `restaurants` 表（餐厅信息）
2. ✅ 创建了 `user_favorites` 表（用户收藏）
3. ✅ 导入了 20 家预设餐厅数据
4. ✅ 更新了 TypeScript 类型定义
5. ✅ 创建了 React hooks（`useRestaurants`, `useFavorites`）
6. ✅ 更新了主页面以使用 Supabase 数据

## 实现进度（当前代码）

- 已实现
  - 云端读取餐厅列表（`is_active=true`，按名称排序）+ 本地回退（20 条）
  - Hooks：`useRestaurants`、`useRestaurantsByCategory`、`useCategories`
  - 本地收藏与历史：`favorites`、`draw_history`、`total_draws`、`last_draw_time`
  - UI 对接云端数据（`Index.tsx`），为空自动回退本地

- 待完善
  - 环境变量缺失时的静默降级（避免 `supabase.ts` 抛错）
  - 收藏云端同步（`user_favorites`，需启用 Supabase Auth 与 RLS）
  - GA4 埋点接入与仪表盘
  - 云端历史记录表（当前为 localStorage）

## 数据库表结构

### restaurants 表
- `id` (uuid) - 主键
- `name` (text) - 餐厅名称
- `address` (text) - 地址
- `category` (text) - 分类
- `image_url` (text, 可选) - 图片URL
- `rating` (numeric) - 评分
- `price_level` (int) - 价格等级 1-5
- `is_active` (boolean) - 是否启用
- `created_at` (timestamp)
- `updated_at` (timestamp)

### user_favorites 表
- `id` (uuid) - 主键
- `user_id` (uuid, 可选) - 用户ID
- `restaurant_id` (uuid) - 关联餐厅
- `custom_name` (text, 可选) - 自定义名称
- `created_at` (timestamp)

---

## 📊 数据流架构

```
用户请求
    ↓
【Index.tsx】
    ↓
使用 useRestaurants() Hook
    ↓
【TanStack Query + Supabase】
    │
    ├── ✅ Supabase 请求成功 → 返回云端数据
    │
    └── ❌ Supabase 未配置/失败 → 自动回退到 presetRestaurants
                                    (本地 20 家餐厅)
```

---

## 🛠️ 环境变量示例

**`.env` 文件**：
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**`.env.example` 文件**（提交到 Git）：
```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## SQL 建表脚本（可直接在 Supabase SQL Editor 执行）

```sql
-- 餐厅表
create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  category text,
  image_url text,
  rating numeric,
  price_level int,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 自动更新时间戳触发器
create or replace function public.set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_restaurants_updated_at on public.restaurants;
create trigger set_restaurants_updated_at
before update on public.restaurants
for each row execute function public.set_updated_at();

-- 用户收藏表
create table if not exists public.user_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  custom_name text,
  created_at timestamptz not null default now()
);
```

---

## 🔒 RLS 策略配置

### 方案 1：允许匿名读取（推荐）

```sql
-- 开启 RLS
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

-- 允许所有用户（包括匿名）读取激活的餐厅
CREATE POLICY "Allow anonymous read active restaurants"
ON public.restaurants
FOR SELECT
USING (is_active = true);
```

### 方案 2：关闭 RLS（开发阶段）

```sql
-- 仅开发阶段使用，生产环境不推荐
ALTER TABLE public.restaurants DISABLE ROW LEVEL SECURITY;
```

### user_favorites 表 RLS（需要启用 Supabase Auth）

```sql
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- 仅允许用户操作自己的收藏
CREATE POLICY "Users can read own favorites"
ON public.user_favorites
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
ON public.user_favorites
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
ON public.user_favorites
FOR DELETE
USING (auth.uid() = user_id);
```

## 本地开发：导入示例数据（可选）

```sql
insert into public.restaurants (name, address, category) values
  ('食堂一楼', '学校食堂一楼东区', '中餐'),
  ('兰州拉面', '校门口美食街 12 号', '面食'),
  ('麻辣烫', '二食堂北侧', '麻辣烫');
```


---

## 🧯 静默降级方案（可选）

> 目的：在未配置 Supabase 环境变量时不崩溃，自动回退本地数据。

1) 修改 `src/lib/supabase.ts`

```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseEnabled = !!supabaseUrl && !!supabaseAnonKey
export const supabase: SupabaseClient | null = isSupabaseEnabled
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null
```

2) 在 `src/hooks/useRestaurants.ts` 中容错

```typescript
import { supabase } from '@/lib/supabase'

export const useRestaurants = () => {
  return useQuery({
    queryKey: ['restaurants'],
    queryFn: async () => {
      if (!supabase) return [] // 环境未配置：直接返回空，触发回退
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('is_active', true)
        .order('name')
      if (error) throw error
      return data
    }
  })
}
```

3) 在 `src/pages/Index.tsx` 保持回退 + 类型映射（示例见上）

> 小结：采用该方案后，未配置 .env 时应用可直接使用本地数据运行。

## ❓ 常见问题排查（FAQ）

### Q1: 运行时报错 "Missing Supabase environment variables"

**原因**：环境变量未正确配置

**解决方案**：
1. 检查 `.env` 文件是否存在且在项目根目录
2. 确认变量名以 `VITE_` 开头（Vite 要求）
3. 重启开发服务器 `npm run dev`
4. 测试：`console.log(import.meta.env.VITE_SUPABASE_URL)`
5. 或按上文“静默降级方案（可选）”改造，使未配置时自动回退本地数据

### Q2: 读取餐厅数据 403 Forbidden

**原因**：RLS 策略阻止了匿名访问

**解决方案**：
```sql
-- 方法1：创建匿名读取策略
CREATE POLICY "Allow anonymous read" 
ON public.restaurants FOR SELECT USING (true);

-- 方法2：开发阶段暂时关闭 RLS（不推荐生产环境）
ALTER TABLE public.restaurants DISABLE ROW LEVEL SECURITY;
```

### Q3: 网络请求失败（CORS Error）

**原因**：Supabase 项目未允许开发域名

**解决方案**：
1. 进入 Supabase Dashboard
2. `Settings` > `API` > `CORS Configuration`
3. 添加 `http://localhost:8080` 到允许列表

### Q4: 应用一直使用本地数据，不请求 Supabase

**原因**：这是正常行为，回退机制生效

**验证 Supabase 连接**：
```javascript
// 在浏览器控制台执行
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Configured' : '❌ Missing')
```

---

## 🚀 下一步可选功能

- [ ] 配置 Row Level Security (RLS) 策略
- [ ] 添加用户认证系统（Supabase Auth: Email / OAuth）
- [ ] 创建云端抽取历史记录表（目前使用 localStorage）
- [ ] 实现用户收藏功能云端同步（user_favorites 表）
- [ ] 添加餐厅评分与评论系统
