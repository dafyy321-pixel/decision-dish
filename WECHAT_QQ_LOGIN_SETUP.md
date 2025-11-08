# 微信 & QQ 扫码登录配置指南

## 🎯 功能说明

项目已实现**微信扫码登录**和**QQ扫码登录**功能：
- ✅ 微信扫码登录（弹窗显示二维码）
- ✅ QQ扫码登录（新窗口打开）
- ✅ 自动关联到Supabase用户系统
- ✅ 完整的回调处理和错误提示

---

## 一、前置准备

### 1.1 微信开放平台申请

#### 申请条件
- **个人开发者**：可申请，需完成实名认证
- **企业开发者**：需企业认证（300元/年）
- **网站应用审核**：需要已备案的域名

#### 申请步骤

**Step 1: 注册账号**
1. 访问 [微信开放平台](https://open.weixin.qq.com/)
2. 点击"注册" → 选择"开发者账号"
3. 完成邮箱验证和实名认证

**Step 2: 创建网站应用**
1. 登录后台 → "管理中心" → "网站应用"
2. 点击"创建网站应用"
3. 填写应用信息：
   - **应用名称**：等会吃啥
   - **应用简介**：帮助用户快速决定吃什么的应用
   - **应用官网**：你的域名（必须已备案）
   - **授权回调域**：`yourdomain.com`（不要加http://）
4. 上传应用图标（108×108像素）
5. 提交审核（通常1-3个工作日）

**Step 3: 获取配置**
审核通过后：
- **AppID**：应用详情页可见
- **AppSecret**：应用详情页可见（请妥善保管）

### 1.2 QQ互联申请

#### 申请条件
- **个人开发者**：可申请，审核较宽松
- **企业开发者**：需营业执照
- **网站应用**：需要域名（无需备案）

#### 申请步骤

**Step 1: 注册账号**
1. 访问 [QQ互联](https://connect.qq.com/)
2. 使用QQ号登录 → 完成开发者认证
3. 填写个人/企业信息

**Step 2: 创建应用**
1. 进入"应用管理" → "创建应用"
2. 选择"网站应用"
3. 填写信息：
   - **应用名称**：等会吃啥
   - **应用简介**：美食决策助手
   - **应用网站**：`http://localhost:8080`（开发环境可用）
   - **回调地址**：`http://localhost:8080/auth/qq/callback`
4. 提交审核（通常1-2天）

**Step 3: 获取配置**
审核通过后：
- **APP ID**：应用详情可见
- **APP Key**：应用详情可见

---

## 二、项目配置

### 2.1 环境变量配置

在项目根目录的 `.env` 文件中添加：

```env
# Supabase配置（已有）
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# 微信登录配置
VITE_WECHAT_APPID=your_wechat_appid

# QQ登录配置
VITE_QQ_APPID=your_qq_appid
```

**注意**：
- 只需要AppID，AppSecret在后端使用
- 重启开发服务器使配置生效

### 2.2 后端API服务（必需）

由于涉及AppSecret，需要搭建后端服务处理OAuth回调。

#### 方案一：使用Supabase Edge Functions（推荐）

创建文件 `supabase/functions/auth-callback/index.ts`：

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const WECHAT_APPID = Deno.env.get('WECHAT_APPID')!
const WECHAT_SECRET = Deno.env.get('WECHAT_SECRET')!
const QQ_APPID = Deno.env.get('QQ_APPID')!
const QQ_APPKEY = Deno.env.get('QQ_APPKEY')!

serve(async (req) => {
  const { provider, code } = await req.json()

  try {
    let userInfo

    if (provider === 'wechat') {
      // 1. 用code换取access_token
      const tokenRes = await fetch(
        `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${WECHAT_APPID}&secret=${WECHAT_SECRET}&code=${code}&grant_type=authorization_code`
      )
      const tokenData = await tokenRes.json()

      // 2. 获取用户信息
      const userRes = await fetch(
        `https://api.weixin.qq.com/sns/userinfo?access_token=${tokenData.access_token}&openid=${tokenData.openid}`
      )
      userInfo = await userRes.json()
    } else if (provider === 'qq') {
      // QQ登录类似流程
      // 1. 换取access_token
      const tokenRes = await fetch(
        `https://graph.qq.com/oauth2.0/token?grant_type=authorization_code&client_id=${QQ_APPID}&client_secret=${QQ_APPKEY}&code=${code}&redirect_uri=${encodeURIComponent('http://localhost:8080/auth/qq/callback')}`
      )
      const tokenText = await tokenRes.text()
      const accessToken = new URLSearchParams(tokenText).get('access_token')

      // 2. 获取openid
      const openidRes = await fetch(
        `https://graph.qq.com/oauth2.0/me?access_token=${accessToken}`
      )
      let openidText = await openidRes.text()
      openidText = openidText.match(/\{.*\}/)[0]
      const { openid } = JSON.parse(openidText)

      // 3. 获取用户信息
      const userRes = await fetch(
        `https://graph.qq.com/user/get_user_info?access_token=${accessToken}&oauth_consumer_key=${QQ_APPID}&openid=${openid}`
      )
      userInfo = await userRes.json()
      userInfo.openid = openid
    }

    return new Response(JSON.stringify(userInfo), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
```

**部署Edge Function**：
```bash
# 设置环境变量
supabase secrets set WECHAT_APPID=your_appid
supabase secrets set WECHAT_SECRET=your_secret
supabase secrets set QQ_APPID=your_appid
supabase secrets set QQ_APPKEY=your_appkey

# 部署函数
supabase functions deploy auth-callback
```

**更新回调URL**：
修改 `src/pages/AuthCallback.tsx` 中的API地址：
```typescript
const response = await fetch(`https://your-project.supabase.co/functions/v1/auth-callback`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ provider, code }),
})
```

#### 方案二：使用Node.js后端

创建 `server/auth.js`：

```javascript
const express = require('express')
const axios = require('axios')
const app = express()

app.use(express.json())

// 微信回调处理
app.post('/api/auth/wechat/callback', async (req, res) => {
  const { code } = req.body

  try {
    // 1. 换取access_token
    const tokenRes = await axios.get(
      `https://api.weixin.qq.com/sns/oauth2/access_token`,
      {
        params: {
          appid: process.env.WECHAT_APPID,
          secret: process.env.WECHAT_SECRET,
          code,
          grant_type: 'authorization_code',
        },
      }
    )

    // 2. 获取用户信息
    const userRes = await axios.get(
      `https://api.weixin.qq.com/sns/userinfo`,
      {
        params: {
          access_token: tokenRes.data.access_token,
          openid: tokenRes.data.openid,
        },
      }
    )

    res.json(userRes.data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// QQ回调处理
app.post('/api/auth/qq/callback', async (req, res) => {
  // 类似实现
})

app.listen(3000, () => {
  console.log('Auth server running on port 3000')
})
```

---

## 三、本地开发配置

### 3.1 内网穿透（用于本地测试）

由于微信/QQ需要公网可访问的回调地址，本地开发需要使用内网穿透：

**推荐工具**：

1. **ngrok**（免费）
```bash
# 安装ngrok
npm install -g ngrok

# 启动穿透
ngrok http 8080

# 会得到类似: https://abc123.ngrok.io
```

2. **花生壳**（国内）
- 访问 https://hsk.oray.com/
- 下载客户端并注册
- 映射本地8080端口

### 3.2 更新回调地址

将内网穿透得到的地址配置到：
- **微信开放平台**：授权回调域改为 `abc123.ngrok.io`
- **QQ互联**：回调地址改为 `https://abc123.ngrok.io/auth/qq/callback`
- **项目代码**：`SocialLogin.tsx` 中的 `redirectUri` 改为穿透地址

---

## 四、测试流程

### 4.1 测试微信登录

1. 启动开发服务器：
```bash
npm run dev
```

2. 访问 `http://localhost:8081/login`

3. 点击"微信登录"按钮

4. 弹窗显示二维码

5. 使用微信扫描二维码

6. 确认授权后自动登录

### 4.2 测试QQ登录

1. 点击"QQ登录"按钮

2. 打开新窗口显示QQ登录页

3. 使用手机QQ扫描或账号登录

4. 授权后自动跳转并登录

---

## 五、生产环境部署

### 5.1 域名配置

1. 准备已备案域名（微信必需）

2. 在微信/QQ后台更新回调地址：
   - 微信：`yourdomain.com`
   - QQ：`https://yourdomain.com/auth/qq/callback`

3. 更新 `.env` 中的地址

### 5.2 HTTPS配置

微信和QQ都要求使用HTTPS：

```bash
# 使用Let's Encrypt免费证书
sudo certbot --nginx -d yourdomain.com
```

### 5.3 安全建议

1. **AppSecret保护**
   - 绝不在前端暴露
   - 使用环境变量存储
   - 定期更换

2. **State参数验证**
   - 每次登录生成随机state
   - 回调时验证state防止CSRF

3. **Token安全**
   - Access token不要长期存储
   - 使用HttpOnly Cookie

---

## 六、常见问题

### Q1: 微信扫码后提示"redirect_uri参数错误"

**原因**：回调域未配置或格式错误

**解决方案**：
1. 确认微信开放平台的"授权回调域"已配置
2. 不要包含 `http://` 或 `/path`
3. 只填写域名，例如：`abc.com`

### Q2: QQ登录打开空白页

**原因**：AppID未配置或回调地址错误

**解决方案**：
1. 检查 `.env` 中的 `VITE_QQ_APPID`
2. 确认QQ互联后台的回调地址完全匹配
3. 清除浏览器缓存重试

### Q3: 本地开发无法测试

**原因**：微信/QQ不支持localhost

**解决方案**：
1. 使用ngrok等内网穿透工具
2. 或者直接部署到测试服务器

### Q4: 用户信息获取失败

**原因**：后端API未正确处理

**解决方案**：
1. 检查Edge Function或后端服务日志
2. 确认AppSecret配置正确
3. 验证OAuth流程各步骤返回值

---

## 七、文件清单

### 前端文件
- ✅ `src/components/SocialLogin.tsx` - 微信QQ登录组件
- ✅ `src/pages/Login.tsx` - 登录页面（已集成）
- ✅ `src/pages/AuthCallback.tsx` - OAuth回调处理
- ✅ `src/App.tsx` - 添加回调路由

### 后端文件（需创建）
- ⏳ `supabase/functions/auth-callback/index.ts` - Edge Function
- ⏳ 或 `server/auth.js` - Node.js后端

### 配置文件
- ✅ `.env` - 环境变量
- ✅ `WECHAT_QQ_LOGIN_SETUP.md` - 本配置文档

---

## 八、下一步

1. ✅ 前端UI已完成
2. ⏳ 申请微信/QQ开发者账号
3. ⏳ 创建应用并获取AppID
4. ⏳ 配置环境变量
5. ⏳ 搭建后端OAuth处理服务
6. ⏳ 配置内网穿透（本地测试）
7. ⏳ 测试登录流程
8. ⏳ 部署到生产环境

---

## 九、参考文档

- [微信开放平台文档](https://developers.weixin.qq.com/doc/oplatform/Website_App/WeChat_Login/Wechat_Login.html)
- [QQ互联文档](https://wiki.connect.qq.com/网站开发接入流程)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

如有问题，请查看官方文档或提Issue。
