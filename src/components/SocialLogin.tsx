import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'

interface SocialLoginProps {
  onSuccess?: (userData: any) => void
}

export default function SocialLogin({ onSuccess }: SocialLoginProps) {
  const { toast } = useToast()
  const [showWechatQR, setShowWechatQR] = useState(false)
  const [showQQQR, setShowQQQR] = useState(false)

  // 微信扫码登录
  const handleWechatLogin = () => {
    // 检查是否配置了微信AppID
    const wechatAppId = import.meta.env.VITE_WECHAT_APPID
    
    if (!wechatAppId) {
      toast({
        title: '微信登录未配置',
        description: '请在.env文件中配置VITE_WECHAT_APPID',
        variant: 'destructive',
      })
      return
    }

    setShowWechatQR(true)

    // 微信扫码登录URL
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/wechat/callback`)
    const state = Math.random().toString(36).substring(7) // 防CSRF攻击
    
    // 保存state到sessionStorage用于验证
    sessionStorage.setItem('wechat_state', state)

    // 构建微信扫码登录iframe
    const wechatLoginUrl = `https://open.weixin.qq.com/connect/qrconnect?appid=${wechatAppId}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_login&state=${state}#wechat_redirect`
    
    // 创建iframe显示二维码
    const iframe = document.getElementById('wechat-login-iframe') as HTMLIFrameElement
    if (iframe) {
      iframe.src = wechatLoginUrl
    }
  }

  // QQ扫码登录
  const handleQQLogin = () => {
    // 检查是否配置了QQ AppID
    const qqAppId = import.meta.env.VITE_QQ_APPID
    
    if (!qqAppId) {
      toast({
        title: 'QQ登录未配置',
        description: '请在.env文件中配置VITE_QQ_APPID',
        variant: 'destructive',
      })
      return
    }

    setShowQQQR(true)

    // QQ扫码登录URL
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/qq/callback`)
    const state = Math.random().toString(36).substring(7)
    
    // 保存state到sessionStorage
    sessionStorage.setItem('qq_state', state)

    // 构建QQ扫码登录URL
    const qqLoginUrl = `https://graph.qq.com/oauth2.0/authorize?response_type=code&client_id=${qqAppId}&redirect_uri=${redirectUri}&state=${state}&display=pc`
    
    // 打开新窗口或iframe显示二维码
    window.open(qqLoginUrl, 'qqLogin', 'width=450,height=550')
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {/* 微信登录按钮 */}
        <Button
          type="button"
          variant="outline"
          onClick={handleWechatLogin}
          className="relative"
        >
          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1 .178-.555c1.529-1.119 2.498-2.805 2.498-4.637 0-3.598-3.419-6.497-7.655-6.497l-.403.008zm-.865 3.281c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm4.05 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18z" />
          </svg>
          <span className="text-sm">微信登录</span>
        </Button>

        {/* QQ登录按钮 */}
        <Button
          type="button"
          variant="outline"
          onClick={handleQQLogin}
          className="relative"
        >
          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.395 15.035a39.548 39.548 0 0 0-.803-2.264l-1.079-2.695c.001-.032.014-.562.014-.836C19.526 4.632 17.351 0 12 0S4.474 4.632 4.474 9.241c0 .274.013.804.014.836l-1.08 2.695a38.97 38.97 0 0 0-.802 2.264c-1.021 3.283-.69 4.643-.438 4.673.54.065 2.103-2.472 2.103-2.472 0 1.469.756 3.387 2.394 4.771-.612.188-1.363.479-1.845.835-.434.32-.379.646-.301.778.343.578 5.883.369 7.482.189 1.6.18 7.14.389 7.483-.189.078-.132.132-.458-.301-.778-.483-.356-1.233-.646-1.846-.836 1.637-1.384 2.393-3.302 2.393-4.771 0 0 1.563 2.537 2.103 2.472.251-.03.581-1.39-.438-4.673z" />
          </svg>
          <span className="text-sm">QQ登录</span>
        </Button>
      </div>

      {/* 微信扫码弹窗 */}
      <Dialog open={showWechatQR} onOpenChange={setShowWechatQR}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">微信扫码登录</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 py-4">
            <div className="w-full h-[300px] border rounded-lg overflow-hidden bg-white">
              <iframe
                id="wechat-login-iframe"
                className="w-full h-full"
                frameBorder="0"
                scrolling="no"
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              请使用微信扫描二维码完成登录
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* QQ扫码提示（QQ会打开新窗口） */}
      <Dialog open={showQQQR} onOpenChange={setShowQQQR}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">QQ扫码登录</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 py-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <svg className="w-10 h-10 text-primary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.395 15.035a39.548 39.548 0 0 0-.803-2.264l-1.079-2.695c.001-.032.014-.562.014-.836C19.526 4.632 17.351 0 12 0S4.474 4.632 4.474 9.241c0 .274.013.804.014.836l-1.08 2.695a38.97 38.97 0 0 0-.802 2.264c-1.021 3.283-.69 4.643-.438 4.673.54.065 2.103-2.472 2.103-2.472 0 1.469.756 3.387 2.394 4.771-.612.188-1.363.479-1.845.835-.434.32-.379.646-.301.778.343.578 5.883.369 7.482.189 1.6.18 7.14.389 7.483-.189.078-.132.132-.458-.301-.778-.483-.356-1.233-.646-1.846-.836 1.637-1.384 2.393-3.302 2.393-4.771 0 0 1.563 2.537 2.103 2.472.251-.03.581-1.39-.438-4.673z" />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              已在新窗口打开QQ登录页面<br />
              请在新窗口中完成登录
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQQQR(false)}
            >
              关闭
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
