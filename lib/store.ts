import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { LogEntry, Status, StoreData, Task } from "./types";

// 数据存在项目根目录下的 data/db.json 里（已加入 .gitignore）
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "db.json");

// ---------- 底层读写 ----------

export async function readStore(): Promise<StoreData> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw) as StoreData;
  } catch {
    // 文件不存在（首次运行）时，返回一个空库
    return { tasks: [], logs: [] };
  }
}

async function writeStore(data: StoreData): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// ---------- 查询 ----------

// 看板只展示"未删除"的任务，按创建时间升序排列
export async function listActiveTasks(): Promise<Task[]> {
  const store = await readStore();
  return store.tasks
    .filter((t) => t.deletedAt === null)
    .sort((a, b) => a.createdAt - b.createdAt);
}

// 返回某个时间点之后的操作记录，新的在前
export async function listLogs(since: number): Promise<LogEntry[]> {
  const store = await readStore();
  return store.logs
    .filter((l) => l.timestamp >= since)
    .sort((a, b) => b.timestamp - a.timestamp);
}

// 返回所有已删除的任务（回收站用），最近删除的在前
export async function listDeletedTasks(): Promise<Task[]> {
  const store = await readStore();
  return store.tasks
    .filter((t) => t.deletedAt !== null)
    .sort((a, b) => (b.deletedAt ?? 0) - (a.deletedAt ?? 0));
}

// ---------- 变更（每次操作都会追加一条日志） ----------

function appendLog(
  store: StoreData,
  entry: Omit<LogEntry, "id">
): void {
  store.logs.push({ ...entry, id: randomUUID() });
}

export async function createTask(
  title: string,
  description: string
): Promise<Task> {
  const store = await readStore();
  const now = Date.now();
  const task: Task = {
    id: randomUUID(),
    title,
    description,
    status: "todo", // 新任务默认进入"还没做"列
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
  store.tasks.push(task);
  appendLog(store, {
    taskId: task.id,
    taskTitle: task.title,
    type: "create",
    fromStatus: null,
    toStatus: "todo",
    timestamp: now,
  });
  await writeStore(store);
  return task;
}

export async function updateTask(
  id: string,
  patch: { title?: string; description?: string }
): Promise<Task> {
  const store = await readStore();
  const task = store.tasks.find((t) => t.id === id && t.deletedAt === null);
  if (!task) throw new Error("任务不存在");
  if (patch.title !== undefined) task.title = patch.title;
  if (patch.description !== undefined) task.description = patch.description;
  task.updatedAt = Date.now();
  appendLog(store, {
    taskId: task.id,
    taskTitle: task.title,
    type: "update",
    fromStatus: task.status,
    toStatus: task.status,
    timestamp: Date.now(),
  });
  await writeStore(store);
  return task;
}

export async function moveTask(id: string, toStatus: Status): Promise<Task> {
  const store = await readStore();
  const task = store.tasks.find((t) => t.id === id && t.deletedAt === null);
  if (!task) throw new Error("任务不存在");
  const fromStatus = task.status;
  task.status = toStatus;
  task.updatedAt = Date.now();
  appendLog(store, {
    taskId: task.id,
    taskTitle: task.title,
    type: "move",
    fromStatus,
    toStatus,
    timestamp: Date.now(),
  });
  await writeStore(store);
  return task;
}

export async function deleteTask(id: string): Promise<void> {
  const store = await readStore();
  const task = store.tasks.find((t) => t.id === id && t.deletedAt === null);
  if (!task) throw new Error("任务不存在");
  // 软删除：不真删，只打标记
  task.deletedAt = Date.now();
  task.updatedAt = Date.now();
  appendLog(store, {
    taskId: task.id,
    taskTitle: task.title,
    type: "delete",
    fromStatus: task.status,
    toStatus: null,
    timestamp: Date.now(),
  });
  await writeStore(store);
}

export async function restoreTask(id: string): Promise<Task> {
  const store = await readStore();
  const task = store.tasks.find((t) => t.id === id && t.deletedAt !== null);
  if (!task) throw new Error("任务不存在或未被删除");
  task.deletedAt = null; // 清空标记 = 找回
  task.updatedAt = Date.now();
  appendLog(store, {
    taskId: task.id,
    taskTitle: task.title,
    type: "restore",
    fromStatus: null,
    toStatus: task.status,
    timestamp: Date.now(),
  });
  await writeStore(store);
  return task;
}

// 彻底删除：从数组里真正移除，无法再找回（只能对已在回收站里的任务调用）
export async function permanentlyDeleteTask(id: string): Promise<void> {
  const store = await readStore();
  const task = store.tasks.find((t) => t.id === id);
  if (!task || task.deletedAt === null) {
    throw new Error("只能彻底删除回收站里的任务");
  }
  store.tasks = store.tasks.filter((t) => t.id !== id);
  await writeStore(store);
}
