# Supabase 数据库配置

## 配置步骤

1. **安装依赖**（已完成）
   ```bash
   npm install @supabase/supabase-js
   ```

2. **环境变量配置**
   - 已创建 `.env` 文件
   - Supabase URL: `https://ewhurzxnmxbqwceahgfu.supabase.co`
   - 需要在 `.env` 文件中填入你的 `VITE_SUPABASE_ANON_KEY`

3. **获取 Anon Key**
   你需要从 Supabase 控制台获取 Anon Key 并更新 `.env` 文件

4. **使用 Supabase 客户端**
   ```typescript
   import { supabase } from '@/lib/supabase'

   // 查询示例
   const { data, error } = await supabase
     .from('your_table')
     .select('*')

   // 插入示例
   const { data, error } = await supabase
     .from('your_table')
     .insert([{ name: 'value' }])
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

## 下一步可选功能

1. 配置 Row Level Security (RLS) 策略
2. 添加用户认证系统
3. 创建抽取历史记录表
