'use client';

import { useEffect, useState } from 'react';
import { TaskCard } from '@/components/TaskCard';
import { useRouter } from 'next/navigation';
import { FuzzTask } from '@/types/task';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const PAGE_SIZE = 9; // 每页9个任务 (3x3 grid)

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<FuzzTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      setTasks(data);
      setLoading(false);
    } catch (error) {
      console.error('获取任务列表失败:', error);
      setLoading(false);
    }
  };

  // 计算分页数据
  const totalPages = Math.ceil(tasks.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedTasks = tasks.slice(startIndex, startIndex + PAGE_SIZE);

  // 生成页码数组（最多显示5个页码）
  const getPageNumbers = () => {
    const pages: number[] = [];
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + 4);

    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <div className="text-muted-foreground">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">任务列表</h1>
          <p className="text-muted-foreground mt-1">共 {tasks.length} 个任务</p>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          暂无任务，
          <button
            onClick={() => router.push('/create-task')}
            className="text-primary hover:underline"
          >
            创建第一个任务
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => router.push(`/tasks/${task.id}`)}
              />
            ))}
          </div>

          {/* 分页组件 */}
          {totalPages > 1 && (
            <Pagination className="mt-8">
              <PaginationContent>
                {/* 上一页 */}
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className={
                      currentPage === 1
                        ? 'pointer-events-none opacity-50'
                        : 'cursor-pointer'
                    }
                  />
                </PaginationItem>

                {/* 页码 */}
                {getPageNumbers().map((pageNum) => (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => setCurrentPage(pageNum)}
                      isActive={currentPage === pageNum}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                {/* 下一页 */}
                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    className={
                      currentPage === totalPages
                        ? 'pointer-events-none opacity-50'
                        : 'cursor-pointer'
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
}
