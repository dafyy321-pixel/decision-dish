# 日期时间范围选择器使用文档

## 组件位置
`src/components/ui/date-time-range-picker.tsx`

## 功能特点

✨ **快捷选项** - 10种预设时间范围快速选择
📅 **双月日历** - 可同时查看两个月份
⏰ **精确到小时** - 可选择具体小时（0-23时）
🎨 **适配主题** - 使用网站统一的圆角风格（rounded-3xl）
📱 **响应式** - 移动端友好设计

## 快捷选项列表

| 选项 | 说明 | 时间范围 |
|------|------|----------|
| 今天 | 今日数据 | 今日 0:00 - 当前时间 |
| 昨天 | 昨日数据 | 昨日 0:00 - 昨日 23:59 |
| 最近7天 | 过去一周 | 7天前 0:00 - 当前时间 |
| 最近30天 | 过去一个月 | 30天前 0:00 - 当前时间 |
| 本周 | 本周数据 | 本周一 0:00 - 当前时间 |
| 上周 | 上周数据 | 上周一 0:00 - 上周日 23:59 |
| 本月 | 本月数据 | 本月1号 0:00 - 当前时间 |
| 上月 | 上月数据 | 上月1号 0:00 - 上月最后一天 23:59 |
| 今年 | 今年数据 | 今年1月1日 0:00 - 当前时间 |
| 全部 | 所有历史数据 | 不限制时间范围 |

## 基础使用

### 1. 仅选择日期（推荐用于统计页面）

```tsx
import { useState } from 'react'
import { DateTimeRangePicker, DateRange } from '@/components/ui/date-time-range-picker'

function MyComponent() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  })

  const handleChange = (range: DateRange) => {
    setDateRange(range)
    // 获取数据
    fetchData(range.from, range.to)
  }

  return (
    <DateTimeRangePicker
      value={dateRange}
      onChange={handleChange}
    />
  )
}
```

### 2. 选择日期+小时（精确查询）

```tsx
<DateTimeRangePicker
  value={dateRange}
  onChange={handleChange}
  showTimeSelect={true}  // 启用小时选择
/>
```

## 集成到 Analytics 页面

### 替换现有的时间范围选择器

在 `src/pages/Analytics.tsx` 中替换现有的时间范围选择：

```tsx
import { DateTimeRangePicker, DateRange } from '@/components/ui/date-time-range-picker'

// 在组件中添加状态
const [customDateRange, setCustomDateRange] = useState<DateRange>({
  from: undefined,
  to: undefined,
})

// 添加到界面中（替换现有的时间范围选择卡片）
<Card className="rounded-3xl border-primary/20 shadow-sm">
  <CardContent className="pt-6 pb-6">
    <div className="flex items-center gap-2 mb-3">
      <CalendarDays className="w-4 h-4 text-primary" />
      <span className="text-sm font-medium">选择时间范围</span>
    </div>
    <DateTimeRangePicker
      value={customDateRange}
      onChange={(range) => {
        setCustomDateRange(range)
        // 根据选择的日期范围获取数据
        if (range.from && range.to) {
          loadDataByDateRange(range.from, range.to)
        }
      }}
      showTimeSelect={true} // 可选：是否显示小时选择
    />
  </CardContent>
</Card>
```

## Props API

### DateTimeRangePickerProps

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| value | DateRange | undefined | 当前选择的日期范围 |
| onChange | (range: DateRange) => void | undefined | 日期范围变化时的回调 |
| className | string | undefined | 自定义样式类名 |
| showTimeSelect | boolean | false | 是否显示小时选择器 |

### DateRange 接口

```typescript
interface DateRange {
  from: Date | undefined  // 开始日期
  to: Date | undefined    // 结束日期
}
```

## 样式定制

组件已经使用了项目统一的样式：
- 圆角：`rounded-3xl`
- 边框：`border-primary/20`
- 按钮：`rounded-2xl`

如需进一步定制，可以通过 `className` prop 传入：

```tsx
<DateTimeRangePicker
  value={dateRange}
  onChange={handleChange}
  className="max-w-md"  // 限制最大宽度
/>
```

## 与 Supabase 集成示例

```tsx
import { getAnalyticsSummaryByDateRange } from '@/lib/analytics-supabase'

const handleDateRangeChange = async (range: DateRange) => {
  setCustomDateRange(range)
  
  if (!range.from || !range.to) {
    // 如果选择"全部"，加载所有数据
    await loadData()
    return
  }
  
  setLoading(true)
  try {
    // 根据自定义日期范围查询
    const data = await getAnalyticsSummaryByDateRange(range.from, range.to)
    setSupabaseData(data)
    toast.success('数据加载成功！')
  } catch (err) {
    console.error('加载数据失败:', err)
    toast.error('加载数据失败')
  } finally {
    setLoading(false)
  }
}
```

## 注意事项

1. **时区处理**：组件使用本地时区，所有时间都基于用户的本地时间
2. **日期格式**：显示格式使用 `date-fns` 的 `zhCN` 语言包
3. **性能优化**：选择预设选项时会自动关闭弹窗（除了"全部"选项）
4. **依赖项**：需要安装 `date-fns` 库

## 示例页面

查看完整示例：`src/components/DateTimeRangePickerExample.tsx`

运行示例（假设有对应路由）：
```
访问: http://localhost:5173/date-picker-demo
```

## 常见问题

**Q: 如何获取时间戳？**
```typescript
const startTimestamp = dateRange.from?.getTime()
const endTimestamp = dateRange.to?.getTime()
```

**Q: 如何格式化日期？**
```typescript
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

const formattedDate = format(dateRange.from, 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })
```

**Q: 如何限制可选日期范围？**

目前组件不支持限制，如需添加可以修改 `Calendar` 组件的 `disabled` prop。

## 更新日志

- v1.0.0 (2025-11-08)
  - ✅ 初始版本
  - ✅ 10种预设时间范围
  - ✅ 双月日历视图
  - ✅ 可选的小时选择器
  - ✅ 适配网站主题风格
