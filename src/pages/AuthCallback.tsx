import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    handleCallback()
  }, [])

  const handleCallback = async () => {
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const provider = window.location.pathname.includes('wechat') ? 'wechat' : 'qq'

    if (!code) {
      toast({
        title: '登录失败',
        description: '未获取到授权码',
        variant: 'destructive',
      })
      navigate('/login')
      return
    }

    // 验证state防止CSRF攻击
    const savedState = sessionStorage.getItem(`${provider}_state`)
    if (state !== savedState) {
      toast({
        title: '登录失败',
        description: '状态验证失败',
        variant: 'destructive',
      })
      navigate('/login')
      return
    }

    try {
      // 这里需要后端服务来处理code换取access_token
      // 因为涉及到AppSecret，不能在前端暴露
      const response = await fetch(`/api/auth/${provider}/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })

      if (!response.ok) {
        throw new Error('登录失败')
      }

      const data = await response.json()

      // 使用获取到的用户信息创建或登录Supabase账户
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email || `${provider}_${data.openid}@social.local`,
        password: data.openid, // 使用openid作为密码
      })

      if (error) {
        // 如果账户不存在，自动注册
        const { error: signUpError } = await supabase.auth.signUp({
          email: data.email || `${provider}_${data.openid}@social.local`,
          password: data.openid,
          options: {
            data: {
              username: data.nickname,
              avatar_url: data.headimgurl || data.figureurl_qq_2,
              provider: provider,
              openid: data.openid,
            },
          },
        })

        if (signUpError) throw signUpError
      }

      toast({
        title: '登录成功',
        description: `欢迎，${data.nickname}！`,
      })

      navigate('/')
    } catch (error: any) {
      toast({
        title: '登录失败',
        description: error.message || '请稍后重试',
        variant: 'destructive',
      })
      navigate('/login')
    } finally {
      // 清除state
      sessionStorage.removeItem(`${provider}_state`)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-pink-50">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground">正在登录...</p>
      </div>
    </div>
  )
}
