# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## 项目概述

这是一个基于 React + TypeScript + Vite 的餐厅选择应用程序，帮助用户快速决定吃什么。应用支持系统预设餐厅列表和用户自定义餐厅列表两种模式。

## 常用命令

### 开发
```powershell
npm run dev          # 启动开发服务器 (端口: 8080)
npm run build        # 生产环境构建
npm run build:dev    # 开发环境构建
npm run preview      # 预览生产构建
npm run lint         # 运行 ESLint 代码检查
```

### 环境要求
- Node.js >= 16.0.0
- 开发服务器运行在 `http://[::]:8080`

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
   - 系统模式: 优先从 Supabase 表 `restaurants` 获取（`is_active=true`，按名称排序），失败或无数据时回退到 `src/data/restaurants.ts` 的 `presetRestaurants`
   - 自定义模式: 从 `localStorage` 读取并通过 `customItems` 状态管理
3. **抽取流程**: 
   - 点击 DrawButton → 设置 `isDrawing=true` → 随机选择结果 → 显示 SpinWheel 动画 → 显示 ResultDisplay

### 关键组件
- **Index.tsx**: 主页面，协调所有组件和状态（“必看！！”卡片位于“开始抽取”按钮之上）
- **SpinWheel.tsx**: 转盘动画，包含固定 12 个扇形，旋转 1.5 秒后完成
- **CustomListManager.tsx**: 管理自定义餐厅列表（最多 20 个）
- **ModeSelector.tsx**: 切换系统/自定义模式
- **ResultDisplay.tsx**: 展示抽取结果
- **FeedbackCard.tsx**: 可展开的信息卡，包含问卷与微信群二维码
- **BottomNavBar.tsx**: 底部导航栏（分享/收藏/抽奖/历史/我的）
- **SplashScreen.tsx**: 启动闪屏动画

### UI 系统
- 使用 **shadcn/ui** 组件库（基于 Radix UI）
- 所有基础 UI 组件位于 `src/components/ui/`
- Tailwind CSS 用于样式，配置文件: `tailwind.config.ts`
- 主题颜色通过 CSS 变量 (HSL) 定义
- 支持深色模式（通过 `next-themes` 包）

### 页面结构
- `/` 抽奖页（Index）
- `/share` 分享页（系统分享 / 复制链接 / 二维码）
- `/favorites` 收藏页（占位页）
- `/history` 历史页（占位页）
- `/profile` 我的（占位页）

### TypeScript 配置
- 配置较为宽松: `noImplicitAny: false`, `strictNullChecks: false`
- 使用路径别名: `@/*` 指向 `./src/*`
- 项目引用: `tsconfig.app.json` 和 `tsconfig.node.json`

### 本地存储
- **Key**: `custom-restaurants`
- **格式**: `JSON.stringify(string[])`
- 在 `Index.tsx` 的 `useEffect` 中加载，通过 `handleCustomItemsChange` 保存

### 开发工具
- **构建**: Vite 5.4.19 with React SWC plugin
- **代码检查**: ESLint 配置在 `eslint.config.js`
- **开发标记**: `lovable-tagger` 仅在开发模式启用

### 开发注意事项

### Supabase 配置
- 在项目根目录配置环境变量（Vite）：
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- 客户端创建于 `src/lib/supabase.ts`
- 数据获取：`src/hooks/useRestaurants.ts`（TanStack Query）
- 类型定义：`src/types/database.types.ts`

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
