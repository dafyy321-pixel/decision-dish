import { Share2, Copy, QrCode, Link as LinkIcon, MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useState } from 'react';
import BottomNavBar from '@/components/BottomNavBar';
import { QRCodeCanvas } from 'qrcode.react';

export default function Share() {
  const [showQR, setShowQR] = useState(false);
  // 动态获取当前域名 - 本地开发自动是 localhost，部署后自动是线上域名
  const currentUrl = window.location.origin;

  // 检测是否在微信浏览器内
  const isInWeChat = () => {
    return /micromessenger/i.test(navigator.userAgent);
  };

  // 微信分享 - 直接唤起微信
  const handleWeChatShare = () => {
    const shareText = encodeURIComponent('快来试试这个帮你决定吃什么的神器！🍱 ' + currentUrl);
    
    if (isInWeChat()) {
      // 在微信内，提示用户点击右上角分享
      toast.info('请点击右上角 ••• 菜单分享给好友');
      return;
    }
    
    // 尝试直接唤起微信分享
    const wechatUrl = `weixin://dl/scan?${shareText}`;
    const wechatShareUrl = `weixin://dl/moments?text=${shareText}`;
    
    // 创建隐藏链接尝试唤起微信
    const link = document.createElement('a');
    link.href = wechatUrl;
    link.style.display = 'none';
    document.body.appendChild(link);
    
    try {
      link.click();
      toast.success('正在打开微信...');
      
      // 3秒后如果没有成功跳转，提示用户手动分享
      setTimeout(() => {
        toast.info('如果微信没有打开，请复制链接手动分享');
      }, 3000);
    } catch {
      // 如果无法唤起微信，复制链接并提示
      handleCopyLink();
      toast.info('请手动粘贴到微信分享给好友');
    } finally {
      document.body.removeChild(link);
    }
  };

  // QQ分享 - 直接唤起QQ
  const handleQQShare = () => {
    const shareUrl = encodeURIComponent(currentUrl);
    const shareTitle = encodeURIComponent('等会吃啥 - Decision Dish');
    const shareDesc = encodeURIComponent('快来试试这个帮你决定吃什么的神器！🍱');
    
    // QQ分享URL scheme
    const qqUrl = `mqqapi://share/to_fri?file_type=news&src_type=web&version=1&generalpastboard=1&url=${shareUrl}&title=${shareTitle}&description=${shareDesc}`;
    
    const link = document.createElement('a');
    link.href = qqUrl;
    link.style.display = 'none';
    document.body.appendChild(link);
    
    try {
      link.click();
      toast.success('正在打开QQ...');
    } catch {
      handleCopyLink();
      toast.info('请手动粘贴到QQ分享给好友');
    } finally {
      document.body.removeChild(link);
    }
  };

  // Web Share API - 移动端系统分享（作为备选方案）
  const handleSystemShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '等会吃啥 - Decision Dish',
          text: '快来试试这个帮你决定吃什么的神器！🍱',
          url: currentUrl
        });
        toast.success('分享成功！');
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          // 分享失败，降级到复制链接
          handleCopyLink();
        }
      }
    } else {
      // 不支持 Web Share API，直接复制链接
      handleCopyLink();
    }
  };

  // 复制链接到剪贴板
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      toast.success('链接已复制到剪贴板！');
    } catch (err) {
      // 降级方案（兼容旧浏览器）
      const input = document.createElement('input');
      input.value = currentUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      toast.success('链接已复制到剪贴板！');
    }
  };

  return (
    <>
      <div className="min-h-screen bg-background pb-32 pt-8 px-4">
        <div className="max-w-md w-full mx-auto px-6 py-8 space-y-6">
        {/* 标题图片 */}
        <div className="text-center space-y-1">
          <div className="relative inline-block">
            <img
              src="/imeng-2025-11-02-8389-变成黑色文字，白色背景.png"
              alt="等会吃啥"
              className="w-80 max-w-full mx-auto"
            />
          </div>
        </div>

        {/* 标题 */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            分享给朋友
          </h1>
          <p className="text-muted-foreground">
            让更多人告别选择困难症！
          </p>
        </div>

        {/* 微信分享卡片 */}
        <Card className="border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              一键分享
            </CardTitle>
            <CardDescription>
              直接分享到微信、QQ等应用
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={handleWeChatShare} 
              className="w-full bg-primary hover:bg-primary/90 rounded-2xl h-11"
              size="lg"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              分享到微信
            </Button>
            <Button 
              onClick={handleQQShare} 
              className="w-full bg-primary hover:bg-primary/90 rounded-2xl h-11"
              size="lg"
            >
              <Send className="mr-2 h-5 w-5" />
              分享到QQ
            </Button>
          </CardContent>
        </Card>


        {/* 复制链接卡片 */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-primary" />
              复制链接
            </CardTitle>
            <CardDescription>
              复制链接手动发送给好友
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground break-all">
              {currentUrl}
            </div>
            <Button 
              onClick={handleCopyLink} 
              className="w-full bg-primary hover:bg-primary/90 rounded-2xl h-11"
              size="lg"
            >
              <Copy className="mr-2 h-4 w-4" />
              复制链接
            </Button>
          </CardContent>
        </Card>

        {/* 二维码卡片 */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              扫码分享
            </CardTitle>
            <CardDescription>
              生成二维码，扫码直接访问
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!showQR ? (
              <Button 
                onClick={() => setShowQR(true)} 
                className="w-full bg-primary hover:bg-primary/90 rounded-2xl h-11"
                size="lg"
              >
                <QrCode className="mr-2 h-4 w-4" />
                生成二维码
              </Button>
            ) : (
              <div className="flex flex-col items-center space-y-3">
                <div className="p-4 bg-white rounded-xl shadow-inner">
                  {/* 使用 qrcode.react 动态生成二维码 */}
                  <QRCodeCanvas 
                    value={currentUrl}
                    size={256}
                    level="H"
                    includeMargin={false}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  使用微信或浏览器扫描二维码
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 分享功能说明 */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Share2 className="h-4 w-4 text-primary" />
              分享功能说明
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="text-primary font-semibold">•</span>
                <span>点击"分享到微信"可直接唤起微信应用</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary font-semibold">•</span>
                <span>如果无法唤起，链接会自动复制到剪贴板</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary font-semibold">•</span>
                <span>在微信内请点击右上角菜单分享</span>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>

      <BottomNavBar />
    </>
  );
}
