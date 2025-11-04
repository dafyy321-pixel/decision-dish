# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## 项目概述

这是一个基于 React + TypeScript + Vite 的餐厅选择应用程序，帮助用户快速决定吃什么。应用支持系统预设餐厅列表和用户自定义餐厅列表两种模式。

## 实现进度

- 已实现
  - 抽取流程（系统/自定义）、转盘动画、结果展示
  - 历史记录：存储 + 页面（查看/删除/清空/收藏）
  - 收藏：结果页收藏；收藏页（列表/删除/清空）；自定义列表可从收藏添加
  - 分享：微信/QQ 唤起、复制链接、二维码
  - 个人中心：使用统计（总次数/收藏数/历史数/最近抽取）与 Top5
  - 底部导航、反馈卡片
  - Supabase 数据获取与本地回退（见下述注意）
- 待开发
  - 数据导入/导出（JSON）
  - 埋点接入（GA4）
  - 分享海报生成

## 常用命令

### 开发
```powershell
npm run dev          # 启动开发服务器 (端口: 8080)
npm run build        # 生产环境构建
npm run build:dev    # 开发环境构建
npm run preview      # 预览生产构建
npm run lint         # 运行 ESLint 代码检查
npm run ui:add       # 添加 shadcn/ui 组件
npm run ui:list      # 列出 shadcn/ui 组件
```

### 环境要求
- Node.js >= 16.0.0
- 开发服务器运行在 `http://localhost:8080`（IPv6: `http://[::]:8080`）

## 核心架构

### 应用结构
- **单页应用 (SPA)**: 使用 React Router 进行路由管理
- **状态管理**: 
  - 使用 `useState` 管理本地状态
  - TanStack Query + Supabase 用于云端数据获取与缓存（`src/hooks/useRestaurants.ts`）
  - localStorage 持久化用户自定义餐厅列表 (key: `custom-restaurants`)
- **组件架构**: 功能组件 + React Hooks

### 主要数据流
1. **模式选择**: `Index.tsx` 维护 `mode` 状态 (`system` | `custom`)
2. **餐厅数据**: 
   - 系统模式: 优先从 Supabase 表 `restaurants` 获取（`is_active=true`，按名称排序），失败或无数据时自动回退到 `src/data/restaurants.ts` 的 `presetRestaurants`（20家）
   - 自定义模式: 从 `localStorage` 读取并通过 `customItems` 状态管理
3. **历史记录**: 
   - 每次抽取后自动保存到 `localStorage` (key: `draw_history`)
   - 记录内容: 餐厅名称、时间戳、模式
   - 最多保存 100 条记录，自动移除过旧记录
   - 同时统计总抽取次数 (key: `total_draws`)
4. **抽取流程**: 
   - 点击 DrawButton → 设置 `isDrawing=true` → 随机选择结果 → 显示 SpinWheel 动画 → 显示 ResultDisplay → 保存历史记录

### 关键组件

#### 页面组件 (src/pages/)
- **Index.tsx**: 主页面，协调所有组件和状态，包含历史记录逻辑
- **Share.tsx**: 分享页，支持微信/QQ唤起、复制链接、二维码生成（qrcode.react）
- **Favorites.tsx**: 收藏页（列表/删除/清空）
- **History.tsx**: 历史页（展示/删除/清空历史记录，支持收藏）
- **Profile.tsx**: 我的（统计面板/Top5）
- **NotFound.tsx**: 404 页面
- **NavDemo.tsx**: 导航演示页（调试用）

#### 功能组件 (src/components/)
- **DrawButton.tsx**: 抽取按钮，支持禁用状态和加载动画
- **SpinWheel.tsx**: 转盘动画，包含固定 12 个扇形，旋转 1.5 秒后完成
- **ResultDisplay.tsx**: 展示抽取结果，支持再抽一次
- **CustomListManager.tsx**: 管理自定义餐厅列表（最多 20 个）
- **ModeSelector.tsx**: 切换系统/自定义模式
- **FeedbackCard.tsx**: 可展开的“必看！！”信息卡，包含问卷与微信群二维码
- **BottomNavBar.tsx**: 底部导航栏，5个页面快捷入口（分享/收藏/抽奖/历史/我的）

### UI 系统
- 使用 **shadcn/ui** 组件库（基于 Radix UI）
- 所有基础 UI 组件位于 `src/components/ui/`
- Tailwind CSS 用于样式，配置文件: `tailwind.config.ts`
- 主题颜色通过 CSS 变量 (HSL) 定义
- 支持深色模式（通过 `next-themes` 包）

### 页面结构
- `/` - 主页（抽奖功能 + 历史记录存储）
- `/share` - 分享页（微信/QQ唤起 + 复制链接 + 二维码生成）
- `/favorites` - 收藏页（列表/删除/清空）
- `/history` - 历史页（展示/删除/清空历史记录，支持收藏）
- `/profile` - 我的（统计面板/Top5）
- `/nav-demo` - 导航演示页（调试用）
- `*` - 404 页面

### TypeScript 配置
- 配置较为宽松: `noImplicitAny: false`, `strictNullChecks: false`
- 使用路径别名: `@/*` 指向 `./src/*`
- 项目引用: `tsconfig.app.json` 和 `tsconfig.node.json`

### 本地存储

**自定义餐厅列表**:
- **Key**: `custom-restaurants`
- **格式**: `JSON.stringify(Restaurant[])`
- **位置**: `Index.tsx` 的 `useEffect` 加载，`handleCustomItemsChange` 保存

**抽取历史记录**:
- **Key**: `draw_history`
- **格式**: `JSON.stringify([{ name: string, timestamp: string, mode: string }])`
- **限制**: 最多 100 条，超出后 FIFO 移除
- **位置**: `Index.tsx` 的 `handleWheelComplete` 保存

**统计数据**:
- **Key**: `total_draws` - 总抽取次数
- **Key**: `last_draw_time` - 最后抽取时间
- **格式**: 纯文本/数字

### 开发工具
- **构建**: Vite 5.4.19 with React SWC plugin
- **代码检查**: ESLint 配置在 `eslint.config.js`
- **开发标记**: `lovable-tagger` 仅在开发模式启用

### 开发注意事项

### Supabase 配置（可选）

**环境变量**（`.env` 文件）：
- `VITE_SUPABASE_URL` - Supabase 项目 URL
- `VITE_SUPABASE_ANON_KEY` - Supabase 匿名密钥

**核心文件**：
- `src/lib/supabase.ts` - Supabase 客户端初始化
- `src/hooks/useRestaurants.ts` - 数据获取 Hook（TanStack Query 缓存）
- `src/types/database.types.ts` - Supabase 数据库类型定义

**数据回退机制**：
- Supabase 请求失败或返回空数据时，自动回退到本地 `src/data/restaurants.ts`
- 注意：当前 `src/lib/supabase.ts` 在未配置 `.env` 时会抛错；请先按 `SUPABASE_SETUP.md` 配置环境变量，或按文档“静默降级方案”改造以实现无配置回退
- 本地模式下应用可离线使用

### 添加新餐厅到系统列表
编辑 `src/data/restaurants.ts`，遵循 `Restaurant` 接口:
```typescript
interface Restaurant {
  id: string;
  name: string;
  address: string;
  category: string;
}
```

### 修改转盘动画
- 固定 12 个扇形（`segmentCount = 12`）
- 旋转时间和完成时间在 `SpinWheel.tsx` 的 `useEffect` 中控制
- 渐变颜色从绿色到橙色: `hsl(110 38% 71%)` → `hsl(30 88% 69%)`

### 添加新路由
在 `App.tsx` 的 `<Routes>` 中添加，必须在 catch-all `*` 路由之前

### Toast 通知
使用 `sonner` 库，通过 `import { toast } from "sonner"` 调用:
- `toast.success()`
- `toast.error()`

### 自定义 UI 组件
不要直接修改 `src/components/ui/` 中的组件，它们由 shadcn/ui 生成。如需自定义，应创建新的包装组件。
