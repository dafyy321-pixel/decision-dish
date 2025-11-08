import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { trackEvent } from '@/lib/analytics';

export default function SupabaseTest() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // 测试1：检查Supabase配置
  const testConfig = () => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    setResult(`
配置检查：
- URL: ${url ? '✅ 已配置' : '❌ 未配置'}
- Key: ${key ? '✅ 已配置 (前20字符: ' + key.substring(0, 20) + '...)' : '❌ 未配置'}
    `);
  };

  // 测试2：检查表是否存在
  const testTable = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .limit(1);
      
      if (error) {
        setResult(`❌ 表不存在或无权限：\n${error.message}`);
      } else {
        setResult(`✅ 表存在！当前有 ${data?.length || 0} 条记录（仅查询1条）`);
      }
    } catch (err: any) {
      setResult(`❌ 连接失败：\n${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 测试3：尝试插入测试数据
  const testInsert = async () => {
    setLoading(true);
    try {
      const testData = {
        event_type: 'test_event',
        user_id: 'test_user_' + Date.now(),
        session_id: 'test_session',
        timestamp: new Date().toISOString(),
        utm_source: 'test',
        properties: { test: true },
        user_agent: navigator.userAgent,
        referrer: document.referrer || null,
      };

      const { data, error } = await supabase
        .from('analytics_events')
        .insert([testData])
        .select();
      
      if (error) {
        setResult(`❌ 插入失败：\n${error.message}\n\n详细信息：\n${JSON.stringify(error, null, 2)}`);
      } else {
        setResult(`✅ 插入成功！\n数据：\n${JSON.stringify(data, null, 2)}`);
      }
    } catch (err: any) {
      setResult(`❌ 插入异常：\n${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 测试4：测试analytics.ts的trackEvent
  const testTrackEvent = () => {
    try {
      trackEvent('test_from_page', { source: 'test_page' });
      setResult('✅ trackEvent已调用，请检查浏览器控制台和Supabase表');
    } catch (err: any) {
      setResult(`❌ trackEvent失败：\n${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Supabase连接测试</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={testConfig} disabled={loading}>
                1. 检查配置
              </Button>
              <Button onClick={testTable} disabled={loading}>
                2. 检查表
              </Button>
              <Button onClick={testInsert} disabled={loading}>
                3. 测试插入
              </Button>
              <Button onClick={testTrackEvent} disabled={loading}>
                4. 测试trackEvent
              </Button>
            </div>

            {loading && <p className="text-center text-primary">测试中...</p>}

            {result && (
              <Card className="bg-muted">
                <CardContent className="pt-6">
                  <pre className="text-xs whitespace-pre-wrap">{result}</pre>
                </CardContent>
              </Card>
            )}

            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>使用说明：</strong></p>
              <p>1. 先点击"检查配置"确认环境变量</p>
              <p>2. 点击"检查表"确认表是否创建</p>
              <p>3. 点击"测试插入"尝试写入数据</p>
              <p>4. 点击"测试trackEvent"测试实际的埋点函数</p>
              <p className="text-destructive">完成测试后请删除此页面！</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
