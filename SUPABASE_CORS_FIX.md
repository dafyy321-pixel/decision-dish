# Supabase CORS配置修复

## 问题描述

登录时报错：
```
Failed to load resource: the server responded with a status of 400
ewhurzxnmxbqwceahgfu.supabase.co/auth/v1/signup
ewhurzxnmxbqwceahgfu.supabase.co/auth/v1/signin
```

## 根本原因

Supabase CORS（跨源资源共享）配置未包含你的应用域名。

---

## 修复步骤

### Step 1: 进入Supabase Dashboard

1. 访问 https://app.supabase.com
2. 选择你的项目
3. 进入 **Settings** (设置) → **API**

### Step 2: 添加CORS允许域名

在 **CORS Configuration** 部分：

**本地开发**：
```
http://localhost:8081
http://localhost:8080
```

**生产环境**：
```
https://yourdomain.com
```

**保存配置**

### Step 3: 配置邮件验证（可选但推荐）

1. 进入 **Authentication** → **Email Templates**
2. 确保 **Confirm signup link** 配置正确
3. 编辑邮件模板中的URL为你的应用地址

### Step 4: 启用Auth Providers

1. 进入 **Authentication** → **Providers**
2. 启用 **Email**：打开Email开关
3. 配置邮件设置：
   - Enable email confirmations: **ON**（要求用户验证邮箱）
   - Secure email change: **ON**
   - Double confirm changes: **OFF**

---

## 本地快速修复

如果急于测试，可以暂时关闭邮箱验证：

1. **Authentication** → **Providers** → **Email**
2. **Enable email confirmations**: 关闭（OFF）
3. **Save**

> ⚠️ 注意：生产环境应启用邮箱验证

---

## 代码修复

已更新 `src/lib/supabase.ts`，添加了以下配置：

```typescript
auth: {
  autoRefreshToken: true,      // 自动刷新Token
  persistSession: true,         // 持久化会话
  detectSessionInUrl: true,    // 检测URL中的会话
}
```

---

## 测试CORS配置

打开浏览器开发者工具 (F12)，查看Network标签：

**正常请求**：
- Status: 200 或 201
- 无CORS错误

**CORS错误**：
- 红色标记
- 错误消息：`Access-Control-Allow-Origin`

---

## 完整检查清单

- [ ] Supabase Dashboard中添加localhost:8081到CORS白名单
- [ ] 启用Email Provider
- [ ] 重启开发服务器 (`npm run dev`)
- [ ] 清除浏览器缓存 (Ctrl+Shift+Delete)
- [ ] 再次尝试注册/登录

---

## 常见问题

### Q1: 仍然收到400错误

**解决方案**：
1. 确认CORS配置已保存（需要5-10秒才能生效）
2. 完全刷新浏览器 (Ctrl+F5)
3. 打开浏览器开发者工具查看详细错误

### Q2: 邮箱验证收不到邮件

**解决方案**：
1. 检查垃圾邮件文件夹
2. 确认邮箱地址拼写正确
3. 在Supabase Dashboard的logs中查看错误

### Q3: 收到"Invalid API key"错误

**解决方案**：
1. 检查.env文件中的`VITE_SUPABASE_ANON_KEY`
2. 确认key没有被意外修改
3. 从Dashboard重新复制正确的key

---

## 生产环境部署

部署到生产环境前：

1. ✅ 在Supabase中添加生产域名到CORS白名单
2. ✅ 启用邮箱验证
3. ✅ 测试完整的注册流程
4. ✅ 配置邮件模板中的验证链接
5. ✅ 启用Google/GitHub OAuth（可选）

---

## 相关文档

- [Supabase Auth配置](AUTH_SETUP.md)
- [Supabase官方CORS指南](https://supabase.com/docs/guides/api/cors)
- [Supabase Email认证](https://supabase.com/docs/guides/auth/auth-email)
