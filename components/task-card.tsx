"use client";

import type { Task } from "@/lib/types";

// 单个任务卡片。现在只是展示，第 5 步会在这里加"编辑/删除"按钮。
export default function TaskCard({ task }: { task: Task }) {
  return (
    <article className="bg-white rounded border border-gray-200 p-3 shadow-sm">
      <h3 className="font-medium">{task.title}</h3>
      {task.description && (
        <p className="text-sm text-gray-500 mt-1 whitespace-pre-wrap">
          {task.description}
        </p>
      )}
    </article>
  );
}
