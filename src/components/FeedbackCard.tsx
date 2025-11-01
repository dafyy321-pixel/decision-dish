import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const FeedbackCard = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="w-full">
      {/* Collapsed Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-gradient-to-r from-primary to-primary/80 rounded-3xl p-4 cursor-pointer 
                   hover:from-primary/90 hover:to-primary/70 transition-all duration-300 
                   shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
      >
        <div className="flex items-center justify-between">
          {/* Left Arrow */}
          {isExpanded ? (
            <ChevronUp className="w-6 h-6 text-black transition-transform duration-300" />
          ) : (
            <ChevronDown className="w-6 h-6 text-black transition-transform duration-300" />
          )}
          
          {/* Center Text */}
          <div className="flex items-center gap-2">
            <span className="text-xl animate-pulse">💡</span>
            <span className="text-black font-bold text-lg">必看！！</span>
          </div>
          
          {/* Right Arrow */}
          {isExpanded ? (
            <ChevronUp className="w-6 h-6 text-black transition-transform duration-300" />
          ) : (
            <ChevronDown className="w-6 h-6 text-black transition-transform duration-300" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isExpanded ? "max-h-[2000px] opacity-100 mt-4" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-card rounded-3xl p-6 shadow-[var(--shadow-card)] border border-primary/10 space-y-6">
          {/* Text Content */}
          <div className="space-y-4 text-sm">
            <div className="text-center space-y-2">
              <p className="text-lg font-bold text-primary">
                🎉 我们的美食地图正在"空腹"等你填满！ 🍜
              </p>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              目前项目还在"襁褓期"👶，页面上的餐厅信息大多是模拟占位（说白了就是"画饼充饥"😅）。为了让内容更真实、更实用、更让你流口水🤤，我们诚挚邀请你——
              <span className="text-primary font-semibold">亲测推荐你心中的宝藏餐厅！</span>
            </p>

            <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20">
              <p className="text-center font-semibold text-primary mb-3">
                👉 请推荐你亲测过、真心觉得"最好吃"的那家店！
              </p>
              <p className="text-xs text-muted-foreground text-center">
                只需提供以下信息，就能帮我们点亮一张真实又诱人的美食地图✨
              </p>
            </div>

            {/* Info List */}
            <div className="space-y-2 text-muted-foreground">
              <div className="flex gap-2">
                <span className="flex-shrink-0">📍</span>
                <div>
                  <span className="font-semibold text-foreground">店名：</span>
                  比如"老王家的神仙小笼包"
                </div>
              </div>
              <div className="flex gap-2">
                <span className="flex-shrink-0">🗺️</span>
                <div>
                  <span className="font-semibold text-foreground">准确位置：</span>
                  详细地址 or 高德/大众点评链接都行（别让我们在巷子口转三圈找不到门🙏）
                </div>
              </div>
              <div className="flex gap-2">
                <span className="flex-shrink-0">🌟</span>
                <div>
                  <span className="font-semibold text-foreground">推荐理由 / 必点菜：</span>
                  是老板会变魔术？还是那道红烧肉能治愈失恋？快告诉我们！
                </div>
              </div>
              <div className="flex gap-2">
                <span className="flex-shrink-0">💰</span>
                <div>
                  <span className="font-semibold text-foreground">人均/价位区间：</span>
                  学生党友好？还是"吃一顿肉疼三天"？坦白从宽～
                </div>
              </div>
              <div className="flex gap-2">
                <span className="flex-shrink-0">🕒</span>
                <div>
                  <span className="font-semibold text-foreground">营业时间：</span>
                  别让我们半夜激情打卡却发现人家打烊了（别问我是怎么知道的😭）
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-primary/20 my-4"></div>

            {/* QR Code Section */}
            <div className="flex flex-col items-center space-y-3">
              <p className="text-center text-muted-foreground text-xs">
                💌 你的每一条推荐，都会被认真收录进我们的数据库，
                <span className="text-primary font-semibold">直接用于产品内容升级</span>！
              </p>

              {/* QR Code */}
              <div className="w-48 h-48 rounded-2xl overflow-hidden border-2 border-primary/30
                            hover:border-primary/50 transition-all duration-300 hover:scale-105 shadow-md">
                <img 
                  src="/二维码.jpg" 
                  alt="扫码填写问卷" 
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xs text-muted-foreground">👆 扫码填写问卷</p>

              <div className="text-center space-y-1">
                <p className="text-sm text-muted-foreground">
                  快来投喂我们吧～<br />
                  你的胃，值得被世界看见！👀🍽️
                </p>
                <p className="text-sm font-semibold text-primary">
                  你的好味道，不该被藏起来！ 🥢❤️
                </p>
                <p className="text-xs text-muted-foreground">
                  (๑•̀ㅂ•́)و✧ 等你来安利！也别忘了@你的饭搭子一起参与！ 🍜👯‍♀️
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackCard;
