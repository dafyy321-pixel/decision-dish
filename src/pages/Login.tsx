import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { Mail, Lock, User } from 'lucide-react'
import SocialLogin from '@/components/SocialLogin'

export default function Login() {
  const navigate = useNavigate()
  const { signIn, signUp, signInWithProvider } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  // 登录表单
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // 注册表单
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupUsername, setSignupUsername] = useState('')
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await signIn(loginEmail, loginPassword)

      if (error) {
        let errorMsg = error.message
        // 处理常见错误
        if (error.message.includes('400')) {
          errorMsg = '邮箱或密码错误，或CORS配置问题。请检查邮箱和密码，或查看SUPABASE_CORS_FIX.md'
        } else if (error.message.includes('invalid_grant')) {
          errorMsg = '邮箱或密码错误，请重试'
        }
        toast({
          title: '登录失败',
          description: errorMsg,
          variant: 'destructive',
        })
      } else {
        navigate('/')
      }
    } catch (err: any) {
      toast({
        title: '登录出错',
        description: err.message || '未知错误，请检查网络连接',
        variant: 'destructive',
      })
    }

    setLoading(false)
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (signupPassword !== signupConfirmPassword) {
      toast({
        title: '密码不匹配',
        description: '两次输入的密码不一致',
        variant: 'destructive',
      })
      return
    }

    if (signupPassword.length < 6) {
      toast({
        title: '密码太短',
        description: '密码至少需要6个字符',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const { error } = await signUp(signupEmail, signupPassword, signupUsername)

      if (error) {
        let errorMsg = error.message
        // 处理常见错误
        if (error.message.includes('400')) {
          errorMsg = '注册请求失败，请检查CORS配置。查看SUPABASE_CORS_FIX.md'
        } else if (error.message.includes('already exists')) {
          errorMsg = '该邮箱已被注册'
        }
        toast({
          title: '注册失败',
          description: errorMsg,
          variant: 'destructive',
        })
      } else {
        toast({
          title: '注册成功',
          description: '请检查邮箱完成验证（如果启用了邮箱验证）',
        })
      }
    } catch (err: any) {
      toast({
        title: '注册出错',
        description: err.message || '未知错误，请检查网络连接',
        variant: 'destructive',
      })
    }

    setLoading(false)
  }

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setLoading(true)
    const { error } = await signInWithProvider(provider)

    if (error) {
      toast({
        title: '登录失败',
        description: error.message,
        variant: 'destructive',
      })
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img
              src="/favicon.png"
              alt="等会吃啥"
              className="h-20 w-20"
            />
          </div>
          <CardTitle className="text-2xl font-bold">等会吃啥</CardTitle>
          <CardDescription>登录或注册开始使用</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">登录</TabsTrigger>
              <TabsTrigger value="signup">注册</TabsTrigger>
            </TabsList>

            {/* 登录表单 */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">邮箱</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your@email.com"
                      className="pl-10"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">密码</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••"
                      className="pl-10"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? '登录中...' : '登录'}
                </Button>
              </form>
            </TabsContent>

            {/* 注册表单 */}
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-username">用户名</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-username"
                      type="text"
                      placeholder="您的昵称"
                      className="pl-10"
                      value={signupUsername}
                      onChange={(e) => setSignupUsername(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">邮箱</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      className="pl-10"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">密码</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="至少6个字符"
                      className="pl-10"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password">确认密码</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-confirm-password"
                      type="password"
                      placeholder="再次输入密码"
                      className="pl-10"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? '注册中...' : '注册'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">或使用扫码登录</span>
            </div>
          </div>

          <SocialLogin onSuccess={(userData) => {
            // 登录成功后的处理
            navigate('/')
          }} />
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-sm text-center text-muted-foreground">
          <p>登录即表示您同意我们的服务条款和隐私政策</p>
          <Button
            variant="link"
            onClick={() => navigate('/')}
            className="text-sm"
          >
            暂不登录，继续浏览
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
