"use client";

import { useRef, useState, useTransition } from "react";
import type { DragEvent } from "react";
import type { Status, Task } from "@/lib/types";
import { changeTaskStatus, recoverTask, removeTask } from "@/app/actions";
import TaskCard from "./task-card";

// 三列的定义：id 对应任务的状态值，label 是列标题
const COLUMNS: { id: Status; label: string }[] = [
  { id: "todo", label: "还没做" },
  { id: "doing", label: "正在做" },
  { id: "done", label: "做完" },
];

export default function Board({ tasks }: { tasks: Task[] }) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<Status | null>(null);
  // 撤销提示：记录"最近删除的那个任务"
  const [undoTask, setUndoTask] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleDrop(col: Status, e: DragEvent<HTMLElement>) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    setDraggingId(null);
    setDragOverCol(null);
    if (!id) return;
    startTransition(async () => {
      await changeTaskStatus(id, col);
    });
  }

  function handleDelete(task: Task) {
    // 先乐观地弹出撤销提示，再真正删除（软删，随时能恢复）
    if (timerRef.current) clearTimeout(timerRef.current);
    setUndoTask({ id: task.id, title: task.title });
    timerRef.current = setTimeout(() => setUndoTask(null), 5000);

    startTransition(async () => {
      await removeTask(task.id);
    });
  }

  function handleUndo() {
    if (!undoTask) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    setUndoTask(null);
    startTransition(async () => {
      await recoverTask(undoTask.id);
    });
  }

  return (
    <div>
      {isPending && <p className="text-sm text-gray-400 mb-2">保存中…</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);
          const isOver = dragOverCol === col.id;
          return (
            <section
              key={col.id}
              onDragOver={(e) => {
                e.preventDefault(); // 必须调用，否则浏览器不允许 drop
                e.dataTransfer.dropEffect = "move";
                setDragOverCol(col.id);
              }}
              onDrop={(e) => handleDrop(col.id, e)}
              className={`rounded-lg p-4 min-h-[300px] transition-colors ${
                isOver ? "bg-gray-200 ring-2 ring-blue-400" : "bg-gray-100"
              }`}
            >
              <h2 className="font-semibold mb-3">
                {col.label}
                <span className="ml-2 text-sm text-gray-500">
                  {colTasks.length}
                </span>
              </h2>
              <div className="space-y-2">
                {colTasks.map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    isDragging={draggingId === t.id}
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", t.id);
                      e.dataTransfer.effectAllowed = "move";
                      setDraggingId(t.id);
                    }}
                    onDragEnd={() => {
                      setDraggingId(null);
                      setDragOverCol(null);
                    }}
                    onDelete={handleDelete}
                  />
                ))}
                {colTasks.length === 0 && (
                  <p className="text-sm text-gray-400">暂无任务</p>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {undoTask && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-black text-white rounded-full px-4 py-2 shadow-lg flex items-center gap-3">
          <span className="text-sm">已删除「{undoTask.title}」</span>
          <button
            onClick={handleUndo}
            className="text-sm font-medium text-blue-300 hover:text-blue-200"
          >
            撤销
          </button>
        </div>
      )}
    </div>
  );
}
