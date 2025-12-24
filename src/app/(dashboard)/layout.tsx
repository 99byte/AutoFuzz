import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, PlusCircle, Activity } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 h-16 bg-background border-b px-6 z-50">
        <div className="h-full flex items-center justify-between max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-2xl font-bold text-primary">
              AutoFuzz
            </Link>
            <div className="flex gap-2">
              <Link href="/dashboard">
                <Button variant="ghost">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  仪表板
                </Button>
              </Link>
              <Link href="/tasks">
                <Button variant="ghost">
                  <Activity className="h-4 w-4 mr-2" />
                  任务列表
                </Button>
              </Link>
            </div>
          </div>
          <Link href="/create-task">
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              创建任务
            </Button>
          </Link>
        </div>
      </nav>

      <main className="px-6 pt-20 pb-6 max-w-screen-2xl mx-auto">
        {children}
      </main>
    </div>
  );
}
