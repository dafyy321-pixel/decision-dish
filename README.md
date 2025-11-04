# 等会吃啥 - Decision Dish 🍱

<div align="center">

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.3.1-61dafb.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.19-646cff.svg)](https://vitejs.dev/)

**一个帮你快速决定吃什么的随机抽取应用**

在线预览: http://localhost:8080 | [功能特性](#功能特性) | [快速开始](#快速开始) | [使用说明](#使用说明)

</div>

---

## 📖 项目简介

**等会吃啥 (Decision Dish)** 是一款专为有选择困难症的朋友打造的轻量级 Web 应用。通过有趣的转盘动画和随机抽取功能，帮助你快速决定今天该吃什么，告别纠结，享受美食！

### 适用人群
- 🎓 **大学生群体** - 食堂、外卖、周边餐厅选择困难
- 👨‍💼 **上班族** - 午餐晚餐不知道吃什么
- 👥 **朋友聚餐** - 多人决策时快速达成共识
- 🏠 **居家生活** - 日常三餐选择参考

---

## ✨ 功能特性

### 🎯 核心功能

- **🎰 随机抽取** - 通过精美的转盘动画随机选择餐厅
- **📋 双模式切换**
  - **系统模式**: 从预设的精选餐厅列表中随机抽取
  - **自定义模式**: 创建并管理自己的餐厅收藏列表
- **☁️ 云端数据** - 支持 Supabase 云端餐厅数据（需配置 .env），失败自动回退到本地预设（20 家）
- **📊 历史记录** - 自动记录最近 100 次，并在历史页查看/删除/清空，支持一键收藏
- **❤️ 收藏功能** - 结果页一键收藏；收藏页查看/删除/清空；自定义列表可从收藏添加
- **👤 个人中心** - 使用统计（总次数/收藏数/历史数/最近抽取）与最常选择 Top5
- **💾 本地存储** - 自动保存你的自定义餐厅列表与统计数据
- **🔗 分享功能** - 支持微信/QQ唤起、复制链接、二维码生成
- **📱 底部导航** - 分享/收藏/抽奖/历史/我的，快速访问核心功能
- **💬 反馈渠道** - 可展开式反馈卡片，含问卷二维码与微信讨论群
- **🎨 精美界面** - 基于 shadcn/ui 组件库，提供现代化的用户体验
- **📱 响应式设计** - 完美适配手机、平板、电脑等各种设备
- **🌈 转盘动画** - 流畅的旋转动画效果，增加趣味性

### 🛠️ 技术亮点

- ⚡ **Vite 构建工具** - 极速的开发体验和构建性能
- 🎭 **React 18** - 使用最新的 React 特性
- 📘 **TypeScript** - 完整的类型支持，提高代码质量
- 🎨 **Tailwind CSS** - 原子化 CSS 框架，快速样式开发
- 🧩 **shadcn/ui** - 高质量的可复用 UI 组件
- 🔄 **React Router** - 单页应用路由管理
- 🎯 **React Hook Form** - 表单状态管理
- 📊 **TanStack Query** - 强大的数据获取和缓存方案

---

## 🏗️ 实现进度

- 已实现
  - 随机抽取、系统/自定义模式、转盘动画、结果展示
  - 历史记录：存储 + 页面（查看/删除/清空/收藏）
  - 收藏：结果页收藏、收藏页（列表/删除/清空），自定义列表可从收藏添加
  - 分享：微信/QQ 唤起、复制链接、二维码
  - 底部导航、反馈卡片、个人中心（统计 + Top5）
  - Supabase 数据获取（需 .env），失败自动回退本地预设

- 待开发
  - 数据导入/导出（JSON）
  - 埋点接入（GA4）
  - 分享海报生成
  - 权重抽取/分类筛选/多人投票（探索）
  - PWA 与离线能力

---

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm / yarn / pnpm / bun
- 开发服务器端口：8080（见 vite.config.ts）
- （可选）Supabase 账号和项目

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/yourusername/decision-dish.git
cd decision-dish
```

2. **安装依赖**
```bash
npm install
# 或
yarn install
# 或
pnpm install
# 或
bun install
```

3. **启动开发服务器**
```bash
npm run dev
```

4. **配置环境变量（可选）**
```bash
# 复制环境变量模板
cp .env.example .env
# 编辑 .env 文件，填入你的 Supabase 配置
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_ANON_KEY=your_anon_key
```
> 注意：当前实现如未配置 Supabase 环境变量会报错，请先按 SUPABASE_SETUP.md 配置 .env；或调整 `src/lib/supabase.ts` 为静默降级后再使用本地预设数据

5. **打开浏览器访问**
```
http://localhost:8080
```

### 构建生产版本

```bash
# 生产构建
npm run build

# 开发模式构建
npm run build:dev

# 预览生产构建
npm run preview
```

### 可用脚本

- dev：启动开发服务器（端口 8080）
- build：生产环境构建
- build:dev：开发模式构建
- preview：预览生产构建
- lint：运行 ESLint 代码检查
- ui:add：添加 shadcn/ui 组件
- ui:list：列出 shadcn/ui 组件

---

## 📱 使用说明

### 1. 选择模式

**系统模式（默认）**
- 从预设的精选餐厅列表中随机抽取
- 适合快速决策，无需配置

**自定义模式**
- 创建属于你自己的餐厅收藏列表
- 添加、编辑、删除餐厅项目
- 数据自动保存在浏览器本地

### 2. 开始抽取

1. 点击"开始抽取"按钮
2. 观看精美的转盘动画
3. 等待转盘停止，查看抽取结果
4. 可选择"再来一次"重新抽取

### 3. 管理自定义列表

1. 切换到"自定义模式"
2. 在输入框中输入餐厅名称
3. 点击"添加"按钮
4. 可随时删除不需要的项目

---

## 🗂️ 项目结构

```
decision-dish/
├── public/                      # 静态资源
│   ├── favicon.ico
│   └── apple-touch-icon.png
├── src/
│   ├── assets/                   # 图片资源
│   │   ├── title-logo.png        # 标题Logo
│   ├── components/               # React 组件
│   │   ├── ui/                   # shadcn/ui 基础组件
│   │   ├── ModeSelector.tsx      # 模式选择器（系统/自定义）
│   │   ├── CustomListManager.tsx # 自定义列表管理（最多20个）
│   │   ├── DrawButton.tsx        # 抽取按钮
│   │   ├── SpinWheel.tsx         # 转盘动画（1.5s旋转）
│   │   ├── ResultDisplay.tsx     # 结果展示（餐厅名称/地址/分类）
│   │   ├── FeedbackCard.tsx      # 可展开反馈卡（问卷二维码/微信群）
│   │   ├── BottomNavBar.tsx      # 底部导航栏（5个页面入口）
│   ├── data/                     # 数据配置
│   │   └── restaurants.ts        # 本地预设餐厅数据（20条）
│   ├── hooks/                    # 数据 hooks
│   │   ├── useRestaurants.ts     # Supabase 数据获取（TanStack Query）
│   │   ├── useFavorites.ts       # 收藏功能（预留）
│   │   ├── use-toast.ts          # Toast 通知 Hook
│   │   └── use-mobile.tsx        # 移动端检测 Hook
│   ├── lib/
│   │   ├── supabase.ts           # Supabase 客户端配置
│   │   └── utils.ts              # 工具函数（cn等）
│   ├── pages/                    # 页面组件
│   │   ├── Index.tsx             # 主页（抽取功能 + 历史记录存储）
│   │   ├── Share.tsx             # 分享页（微信/QQ/复制链接/二维码生成）
│   │   ├── Favorites.tsx         # 收藏页（列表/删除/清空）
│   │   ├── History.tsx           # 历史页（展示/删除/清空历史记录，支持收藏）
│   │   ├── Profile.tsx           # 我的（统计面板/Top5）
│   │   ├── NavDemo.tsx           # 导航演示页（调试用）
│   │   └── NotFound.tsx          # 404 页面
│   ├── types/
│   │   └── database.types.ts     # Supabase 数据库类型定义
│   ├── App.tsx                   # 应用根组件（路由配置）
│   └── main.tsx                  # 入口文件
├── index.html                    # HTML 模板
├── package.json                  # 项目配置
├── eslint.config.js              # ESLint 配置
├── tsconfig.json                 # TypeScript 配置
├── tailwind.config.ts            # Tailwind CSS 配置
└── vite.config.ts                # Vite 配置
```

---

## 🔧 技术栈

### 核心框架
- **React 18.3.1** - UI 框架
- **TypeScript 5.8.3** - 类型系统
- **Vite 5.4.19** - 构建工具

### UI 组件库
- **shadcn/ui** - 组件系统
- **Radix UI** - 无头组件
- **Tailwind CSS 3.4.17** - 样式框架
- **Lucide React** - 图标库
- **qrcode.react** - 二维码生成

### 数据层
- **Supabase 2.78.0** - 云端数据库（自动回退到本地）
- **TanStack Query 5.83.0** - 数据缓存与状态管理
- **localStorage** - 本地数据持久化

### 状态管理 & 路由
- **React Router DOM 6.30.1** - 路由管理
- **React Hook Form 7.61.1** - 表单管理

### 动画 & 交互
- **Embla Carousel** - 轮播组件
- **tailwindcss-animate** - CSS 动画
- **Sonner** - Toast 通知

### 开发工具
- **ESLint** - 代码检查
- **PostCSS** - CSS 处理
- **Autoprefixer** - CSS 自动前缀

---

## 🎨 自定义配置

### 配置 Supabase（可选）

详细配置请参考 [SUPABASE_SETUP.md](SUPABASE_SETUP.md)

1. 创建 Supabase 项目
2. 配置环境变量（`.env` 文件）
3. 执行数据库迁移脚本
4. 导入预设餐厅数据

> 注：未配置 Supabase 时，应用会自动使用 `src/data/restaurants.ts` 中的本地数据

### 添加预设餐厅

编辑 `src/data/restaurants.ts` 文件：

```typescript
export interface Restaurant {
  name: string;
  emoji?: string;
  description?: string;
}

export const presetRestaurants: Restaurant[] = [
  { name: "麦当劳", emoji: "🍔", description: "快餐首选" },
  { name: "肯德基", emoji: "🍗", description: "炸鸡专家" },
  // 添加更多餐厅...
];
```

### 修改主题颜色

编辑 `tailwind.config.ts` 文件，调整颜色配置。

### 自定义转盘样式

修改 `src/components/SpinWheel.tsx` 组件中的动画参数和样式。

---

## 📊 浏览器支持

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

---

## 📄 开源协议

本项目采用 MIT 协议开源 - 参见 [MIT License](https://opensource.org/licenses/MIT)

---

## 🙏 致谢

- [Vite](https://vitejs.dev/) - 构建工具
- [React](https://reactjs.org/) - UI 框架
- [shadcn/ui](https://ui.shadcn.com/) - 组件库
- [Tailwind CSS](https://tailwindcss.com/) - 样式框架
- [Radix UI](https://www.radix-ui.com/) - 无头组件

---

## 📞 联系方式

如有问题或建议，欢迎联系：

- 提交 [Issue](https://github.com/yourusername/decision-dish/issues)
- 发送邮件到：your.email@example.com

---

## 🌟 Star History

如果这个项目对你有帮助，请给个 ⭐ Star 支持一下！

---

<div align="center">

**吃饭愉快！🍱**

Made with ❤️ by Decision Dish Team

</div>
