"use client";

import { useState, useTransition } from "react";
import type { DragEvent } from "react";
import type { Task } from "@/lib/types";
import { editTask } from "@/app/actions";

interface TaskCardProps {
  task: Task;
  isDragging: boolean;
  onDragStart: (e: DragEvent<HTMLElement>) => void;
  onDragEnd: () => void;
  onDelete: (task: Task) => void;
}

// 单个任务卡片：可拖拽、可编辑、可删除（删除交给父组件，为了能弹"撤销"提示）
export default function TaskCard({
  task,
  isDragging,
  onDragStart,
  onDragEnd,
  onDelete,
}: TaskCardProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [, startTransition] = useTransition();

  function handleSave() {
    const trimmed = title.trim();
    if (!trimmed) return; // 空标题不保存
    startTransition(async () => {
      await editTask(task.id, {
        title: trimmed,
        description: description.trim(),
      });
      setEditing(false); // 保存成功后再退出编辑模式
    });
  }

  // 编辑态：显示输入框 + 保存/取消
  if (editing) {
    return (
      <article className="bg-white rounded border border-gray-300 p-3 shadow-sm">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="任务标题"
          autoFocus
          className="w-full border border-gray-300 rounded px-2 py-1 mb-2"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="描述（可选）"
          rows={2}
          className="w-full border border-gray-300 rounded px-2 py-1 mb-2"
        />
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="rounded bg-foreground px-3 py-1 text-sm text-background"
          >
            保存
          </button>
          <button
            onClick={() => setEditing(false)}
            className="rounded border border-gray-300 px-3 py-1 text-sm"
          >
            取消
          </button>
        </div>
      </article>
    );
  }

  // 展示态：标题/描述 + 编辑/删除按钮，整卡可拖拽
  return (
    <article
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`bg-white rounded border border-gray-200 p-3 shadow-sm ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-medium break-words">{task.title}</h3>
          {task.description && (
            <p className="text-sm text-gray-500 mt-1 whitespace-pre-wrap">
              {task.description}
            </p>
          )}
        </div>
        <div className="flex gap-1 shrink-0">
          <button
            onClick={() => {
              setTitle(task.title); // 进入编辑前，用当前值初始化草稿
              setDescription(task.description);
              setEditing(true);
            }}
            className="text-sm text-gray-500 hover:text-black px-1"
          >
            编辑
          </button>
          <button
            onClick={() => onDelete(task)}
            className="text-sm text-gray-500 hover:text-red-600 px-1"
          >
            删除
          </button>
        </div>
      </div>
    </article>
  );
}
