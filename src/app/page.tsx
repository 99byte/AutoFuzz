import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AutoFuzz
          </h1>
          <p className="text-2xl text-gray-600">
            AI驱动的手机应用Fuzz测试平台
          </p>
          <p className="text-gray-500 max-w-2xl mx-auto">
            基于智谱AI和AutoGLM，自动生成UI交互测试用例，实时监控执行过程，智能分析测试结果
          </p>

          <div className="flex gap-4 justify-center pt-8">
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-8">
                开始使用
              </Button>
            </Link>
            <Link href="/create-task">
              <Button size="lg" variant="outline" className="text-lg px-8">
                创建任务
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6 pt-16">
            <Card>
              <CardHeader>
                <CardTitle>智能生成</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  使用智谱AI GLM-4模型，根据应用描述自动生成多样化测试用例
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>实时监控</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  通过SSE实时推送测试进度，实时查看执行日志和崩溃检测
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>智能分析</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  AI分析测试结果，识别缺陷模式，提供改进建议
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
