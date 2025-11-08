import { useState } from 'react'
import { DateTimeRangePicker, DateRange } from '@/components/ui/date-time-range-picker'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

/**
 * 日期时间范围选择器使用示例
 * 可以直接在数据统计页面中使用
 */
export default function DateTimeRangePickerExample() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  })

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range)
    console.log('选择的日期范围:', range)
    
    // 在这里可以调用 API 获取指定日期范围的数据
    // 例如: fetchAnalyticsData(range.from, range.to)
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="rounded-3xl border-primary/20 shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">日期时间范围选择器示例</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 基础版本：只选择日期 */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">基础版（仅日期）</h3>
              <DateTimeRangePicker
                value={dateRange}
                onChange={handleDateRangeChange}
              />
            </div>

            {/* 高级版本：可以选择具体小时 */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">高级版（日期+小时）</h3>
              <DateTimeRangePicker
                value={dateRange}
                onChange={handleDateRangeChange}
                showTimeSelect={true}
              />
            </div>

            {/* 显示选择的结果 */}
            {dateRange.from && (
              <div className="p-4 bg-primary/5 rounded-2xl space-y-2">
                <h3 className="text-lg font-semibold">已选择的时间范围：</h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">开始时间：</span>
                    <span className="font-medium">
                      {format(dateRange.from, 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })}
                    </span>
                  </p>
                  {dateRange.to && (
                    <p>
                      <span className="text-muted-foreground">结束时间：</span>
                      <span className="font-medium">
                        {format(dateRange.to, 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 功能说明 */}
        <Card className="rounded-3xl border-primary/20 shadow-sm">
          <CardHeader>
            <CardTitle>功能说明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">快捷选项包括：</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>今天 - 今日 0:00 至现在</li>
                <li>昨天 - 昨日全天</li>
                <li>最近7天 - 过去一周的数据</li>
                <li>最近30天 - 过去一个月的数据</li>
                <li>本周 - 本周一到现在</li>
                <li>上周 - 上周一到上周日</li>
                <li>本月 - 本月1号到现在</li>
                <li>上月 - 上个月全月</li>
                <li>今年 - 今年1月1日到现在</li>
                <li>全部 - 所有历史数据</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">特性：</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>支持点击快捷选项快速选择时间范围</li>
                <li>支持手动选择日期范围（可选择两个月）</li>
                <li>可选：精确到小时的时间选择（24小时制）</li>
                <li>自动适配网站主题风格（rounded-3xl 圆角）</li>
                <li>响应式设计，移动端友好</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
