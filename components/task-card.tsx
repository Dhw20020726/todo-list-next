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
      <article className="card card--editing">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="任务标题"
          autoFocus
          className="field"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="描述（可选）"
          rows={2}
          className="field"
        />
        <div className="card__editor">
          <button onClick={handleSave} className="btn btn--primary btn--sm">
            保存
          </button>
          <button
            onClick={() => setEditing(false)}
            className="btn btn--ghost btn--sm"
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
      className={`card${isDragging ? " card--dragging" : ""}`}
    >
      <div className="card__head">
        <div className="card__body">
          <h3 className="card__title">{task.title}</h3>
          {task.description && (
            <p className="card__desc">{task.description}</p>
          )}
        </div>
        <div className="card__actions">
          <button
            onClick={() => {
              setTitle(task.title); // 进入编辑前，用当前值初始化草稿
              setDescription(task.description);
              setEditing(true);
            }}
            className="card__action"
          >
            编辑
          </button>
          <button
            onClick={() => onDelete(task)}
            className="card__action card__action--danger"
          >
            删除
          </button>
        </div>
      </div>
    </article>
  );
}
