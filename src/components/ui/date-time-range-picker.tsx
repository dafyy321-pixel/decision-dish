"use client"
import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Calendar as CalendarIcon, Clock } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, subWeeks, subMonths, addDays, addWeeks } from "date-fns"
import { zhCN } from "date-fns/locale"

export interface DateRange {
  from: Date | undefined
  to: Date | undefined
}

interface DateTimeRangePickerProps {
  value?: DateRange
  onChange?: (range: DateRange) => void
  className?: string
  showTimeSelect?: boolean
}

export type PresetRange = 
  | "today"
  | "yesterday"
  | "thisWeek"
  | "lastWeek"
  | "thisMonth"
  | "lastMonth"
  | "thisYear"
  | "last7Days"
  | "last30Days"
  | "all"

const presetRanges: {
  label: string
  value: PresetRange
  getRange: () => DateRange
}[] = [
  {
    label: "今天",
    value: "today",
    getRange: () => ({
      from: startOfDay(new Date()),
      to: endOfDay(new Date()),
    }),
  },
  {
    label: "昨天",
    value: "yesterday",
    getRange: () => ({
      from: startOfDay(subDays(new Date(), 1)),
      to: endOfDay(subDays(new Date(), 1)),
    }),
  },
  {
    label: "最近7天",
    value: "last7Days",
    getRange: () => ({
      from: startOfDay(subDays(new Date(), 6)),
      to: endOfDay(new Date()),
    }),
  },
  {
    label: "最近30天",
    value: "last30Days",
    getRange: () => ({
      from: startOfDay(subDays(new Date(), 29)),
      to: endOfDay(new Date()),
    }),
  },
  {
    label: "本周",
    value: "thisWeek",
    getRange: () => ({
      from: startOfWeek(new Date(), { weekStartsOn: 1 }),
      to: endOfWeek(new Date(), { weekStartsOn: 1 }),
    }),
  },
  {
    label: "上周",
    value: "lastWeek",
    getRange: () => {
      const now = new Date()
      const lastWeekStart = subWeeks(startOfWeek(now, { weekStartsOn: 1 }), 1)
      return {
        from: lastWeekStart,
        to: endOfWeek(lastWeekStart, { weekStartsOn: 1 }),
      }
    },
  },
  {
    label: "本月",
    value: "thisMonth",
    getRange: () => ({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    }),
  },
  {
    label: "上月",
    value: "lastMonth",
    getRange: () => {
      const lastMonth = subMonths(new Date(), 1)
      return {
        from: startOfMonth(lastMonth),
        to: endOfMonth(lastMonth),
      }
    },
  },
  {
    label: "今年",
    value: "thisYear",
    getRange: () => ({
      from: startOfYear(new Date()),
      to: endOfYear(new Date()),
    }),
  },
  {
    label: "全部",
    value: "all",
    getRange: () => ({
      from: undefined,
      to: undefined,
    }),
  },
]

// 小时选择组件
const HourSelector = ({ 
  selectedHour, 
  onSelect,
  label 
}: { 
  selectedHour: number
  onSelect: (hour: number) => void
  label: string
}) => {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-muted-foreground">{label}</div>
      <div className="grid grid-cols-6 gap-1 max-h-48 overflow-y-auto p-1">
        {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
          <Button
            key={hour}
            variant={selectedHour === hour ? "default" : "ghost"}
            size="sm"
            className="h-8 text-xs"
            onClick={() => onSelect(hour)}
          >
            {hour.toString().padStart(2, '0')}:00
          </Button>
        ))}
      </div>
    </div>
  )
}

export function DateTimeRangePicker({
  value,
  onChange,
  className,
  showTimeSelect = false,
}: DateTimeRangePickerProps) {
  const [dateRange, setDateRange] = React.useState<DateRange>(value || { from: undefined, to: undefined })
  const [isOpen, setIsOpen] = React.useState(false)
  const [activePreset, setActivePreset] = React.useState<PresetRange | null>(null)
  const [startHour, setStartHour] = React.useState(0)
  const [endHour, setEndHour] = React.useState(23)

  // 处理预设范围选择
  const handlePresetSelect = (preset: PresetRange) => {
    const range = presetRanges.find((p) => p.value === preset)
    if (range) {
      const newRange = range.getRange()
      setDateRange(newRange)
      setActivePreset(preset)
      onChange?.(newRange)
      if (preset !== "all") {
        setIsOpen(false)
      }
    }
  }

  // 处理日期选择
  const handleDateSelect = (range: DateRange | undefined) => {
    if (range) {
      let newRange = { ...range }
      
      // 如果开启了时间选择，应用选定的小时
      if (showTimeSelect && range.from) {
        const from = new Date(range.from)
        from.setHours(startHour, 0, 0, 0)
        newRange.from = from
        
        if (range.to) {
          const to = new Date(range.to)
          to.setHours(endHour, 59, 59, 999)
          newRange.to = to
        }
      }
      
      setDateRange(newRange)
      setActivePreset(null)
      onChange?.(newRange)
    }
  }

  // 更新时间
  const handleTimeUpdate = () => {
    if (dateRange.from) {
      const from = new Date(dateRange.from)
      from.setHours(startHour, 0, 0, 0)
      
      let to = dateRange.to ? new Date(dateRange.to) : new Date(dateRange.from)
      to.setHours(endHour, 59, 59, 999)
      
      const newRange = { from, to }
      setDateRange(newRange)
      onChange?.(newRange)
    }
  }

  // 格式化显示文本
  const formatDisplayText = () => {
    if (!dateRange.from) {
      return "选择日期范围"
    }
    
    const fromStr = format(dateRange.from, "yyyy-MM-dd HH:mm", { locale: zhCN })
    const toStr = dateRange.to 
      ? format(dateRange.to, "yyyy-MM-dd HH:mm", { locale: zhCN })
      : fromStr
    
    return showTimeSelect 
      ? `${fromStr} - ${toStr}`
      : `${format(dateRange.from, "yyyy-MM-dd", { locale: zhCN })} - ${format(dateRange.to || dateRange.from, "yyyy-MM-dd", { locale: zhCN })}`
  }

  // 检测当前选择是否匹配某个预设
  React.useEffect(() => {
    if (dateRange.from && dateRange.to) {
      const matchedPreset = presetRanges.find((preset) => {
        const range = preset.getRange()
        return (
          range.from?.getTime() === dateRange.from?.getTime() &&
          range.to?.getTime() === dateRange.to?.getTime()
        )
      })
      setActivePreset(matchedPreset?.value || null)
    }
  }, [dateRange])

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal rounded-3xl border-primary/20",
            !dateRange.from && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDisplayText()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 rounded-3xl" align="start">
        <div className="flex">
          {/* 左侧：快捷选项 */}
          <div className="border-r p-4 space-y-1 min-w-[140px]">
            <div className="text-sm font-semibold mb-3 text-foreground">快捷选项</div>
            {presetRanges.map((preset) => (
              <Button
                key={preset.value}
                variant={activePreset === preset.value ? "default" : "ghost"}
                size="sm"
                className="w-full justify-start rounded-2xl"
                onClick={() => handlePresetSelect(preset.value)}
              >
                {preset.label}
              </Button>
            ))}
          </div>

          {/* 右侧：日历 */}
          <div className="p-4 space-y-4">
            <Calendar
              mode="range"
              selected={{ from: dateRange.from, to: dateRange.to }}
              onSelect={handleDateSelect}
              numberOfMonths={2}
              className="rounded-lg [--cell-size:2.5rem]"
            />

            {/* 时间选择器 */}
            {showTimeSelect && dateRange.from && (
              <div className="border-t pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <HourSelector
                    selectedHour={startHour}
                    onSelect={(hour) => {
                      setStartHour(hour)
                      if (hour > endHour) setEndHour(hour)
                    }}
                    label="开始时间"
                  />
                  <HourSelector
                    selectedHour={endHour}
                    onSelect={(hour) => {
                      setEndHour(hour)
                      if (hour < startHour) setStartHour(hour)
                    }}
                    label="结束时间"
                  />
                </div>
                <Button
                  size="sm"
                  className="w-full rounded-2xl"
                  onClick={handleTimeUpdate}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  应用时间
                </Button>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
