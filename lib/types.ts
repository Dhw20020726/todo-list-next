// 任务的三种状态，正好对应看板的三列
export type Status = "todo" | "doing" | "done";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  createdAt: number; // 时间戳（毫秒）
  updatedAt: number;
  deletedAt: number | null; // 非 null 表示已被"软删除"（用于找回）
}

// 操作记录的类型
export type LogType = "create" | "update" | "move" | "delete" | "restore";

export interface LogEntry {
  id: string;
  taskId: string;
  taskTitle: string; // 保存标题快照，任务删除后也能看到
  type: LogType;
  fromStatus: Status | null;
  toStatus: Status | null;
  timestamp: number;
}

// 整个 JSON "数据库" 文件的结构
export interface StoreData {
  tasks: Task[];
  logs: LogEntry[];
}
