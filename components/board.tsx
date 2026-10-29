"use client";

import type { Status, Task } from "@/lib/types";
import TaskCard from "./task-card";

// 三列的定义：id 对应任务的状态值，label 是列标题
const COLUMNS: { id: Status; label: string }[] = [
  { id: "todo", label: "还没做" },
  { id: "doing", label: "正在做" },
  { id: "done", label: "做完" },
];

export default function Board({ tasks }: { tasks: Task[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);
        return (
          <section
            key={col.id}
            className="rounded-lg bg-gray-100 p-4 min-h-[300px]"
          >
            <h2 className="font-semibold mb-3">
              {col.label}
              <span className="ml-2 text-sm text-gray-500">
                {colTasks.length}
              </span>
            </h2>
            <div className="space-y-2">
              {colTasks.map((t) => (
                <TaskCard key={t.id} task={t} />
              ))}
              {colTasks.length === 0 && (
                <p className="text-sm text-gray-400">暂无任务</p>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
