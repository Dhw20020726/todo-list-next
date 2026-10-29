"use server";

import { revalidatePath } from "next/cache";
import {
  createTask,
  deleteTask,
  moveTask,
  restoreTask,
  updateTask,
} from "@/lib/store";
import type { Status } from "@/lib/types";

// 所有"改数据"的操作都集中在这个文件里。
// 每个 action 做完事之后调用 revalidatePath，让 Next 在同一次请求里重新渲染页面。

export async function addTask(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!title) return; // 空标题直接忽略
  await createTask(title, description);
  revalidatePath("/");
}

export async function removeTask(id: string) {
  await deleteTask(id);
  revalidatePath("/");
  revalidatePath("/history");
}

export async function changeTaskStatus(id: string, status: Status) {
  await moveTask(id, status);
  revalidatePath("/");
}

export async function editTask(
  id: string,
  patch: { title?: string; description?: string }
) {
  await updateTask(id, patch);
  revalidatePath("/");
}

export async function recoverTask(id: string) {
  await restoreTask(id);
  revalidatePath("/");
  revalidatePath("/history");
}
