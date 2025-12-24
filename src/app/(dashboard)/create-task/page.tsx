'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';

// 表单验证 Schema
const createTaskSchema = z.object({
  name: z
    .string()
    .min(1, '任务名称不能为空')
    .max(50, '任务名称最多50个字符'),
  targetApp: z
    .string()
    .min(1, '应用包名不能为空')
    .regex(/^[a-zA-Z][a-zA-Z0-9_.]*$/, '请输入有效的应用包名格式'),
  appDescription: z
    .string()
    .max(500, '应用描述最多500个字符')
    .optional(),
  testDepth: z
    .number()
    .min(1, '测试深度最小为1')
    .max(50, '测试深度最大为50'),
  focusAreas: z
    .string()
    .optional(),
});

type CreateTaskFormData = z.infer<typeof createTaskSchema>;

export default function CreateTaskPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      name: '',
      targetApp: '',
      appDescription: '',
      testDepth: 10,
      focusAreas: '登录, 浏览, 支付',
    },
  });

  const onSubmit = async (data: CreateTaskFormData) => {
    setLoading(true);
    setSubmitError(null);

    try {
      // 处理 focusAreas 字符串转数组
      const focusAreasArray = data.focusAreas
        ? data.focusAreas.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          targetApp: data.targetApp,
          appDescription: data.appDescription,
          testConfig: {
            testDepth: data.testDepth,
            focusAreas: focusAreasArray,
          },
        }),
      });

      if (response.ok) {
        const task = await response.json();
        router.push(`/tasks/${task.id}`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setSubmitError(errorData.message || '创建任务失败，请稍后重试');
      }
    } catch (error) {
      console.error('创建任务失败:', error);
      setSubmitError('网络错误，请检查连接后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" size="icon" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4" />
      </Button>

      <div>
        <h1 className="text-3xl font-bold">创建Fuzz任务</h1>
        <p className="text-muted-foreground mt-1">
          AI将自动生成UI交互测试用例
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>任务配置</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 提交错误提示 */}
            {submitError && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                {submitError}
              </div>
            )}

            {/* 任务名称 */}
            <div className="space-y-2">
              <Label htmlFor="name">任务名称</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="例如：微信压力测试"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* 应用包名 */}
            <div className="space-y-2">
              <Label htmlFor="targetApp">应用包名</Label>
              <Input
                id="targetApp"
                {...register('targetApp')}
                placeholder="例如：com.tencent.mm"
                className={errors.targetApp ? 'border-destructive' : ''}
              />
              {errors.targetApp ? (
                <p className="text-sm text-destructive">{errors.targetApp.message}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  请确保应用已安装在测试设备上
                </p>
              )}
            </div>

            {/* 应用描述 */}
            <div className="space-y-2">
              <Label htmlFor="appDescription">应用描述</Label>
              <Textarea
                id="appDescription"
                {...register('appDescription')}
                placeholder="描述应用的主要功能和特点..."
                rows={4}
                className={errors.appDescription ? 'border-destructive' : ''}
              />
              {errors.appDescription ? (
                <p className="text-sm text-destructive">{errors.appDescription.message}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  描述越详细，AI生成的测试用例质量越高
                </p>
              )}
            </div>

            {/* 测试深度 */}
            <div className="space-y-2">
              <Label htmlFor="testDepth">测试深度（生成测试用例数量）</Label>
              <Input
                id="testDepth"
                type="number"
                {...register('testDepth', { valueAsNumber: true })}
                min="1"
                max="50"
                className={errors.testDepth ? 'border-destructive' : ''}
              />
              {errors.testDepth ? (
                <p className="text-sm text-destructive">{errors.testDepth.message}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  建议范围：5-20个测试用例
                </p>
              )}
            </div>

            {/* 重点关注区域 */}
            <div className="space-y-2">
              <Label htmlFor="focusAreas">重点关注区域（用逗号分隔）</Label>
              <Input
                id="focusAreas"
                {...register('focusAreas')}
                placeholder="登录, 浏览, 支付"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? '创建中...' : '创建任务'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>使用提示</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>1. 确保手机已连接并通过USB调试</p>
          <p>2. 确保目标应用已安装在测试设备上</p>
          <p>3. 填写详细的应用描述有助于生成更好的测试用例</p>
          <p>4. 建议首次使用时设置较小的测试深度</p>
        </CardContent>
      </Card>
    </div>
  );
}
