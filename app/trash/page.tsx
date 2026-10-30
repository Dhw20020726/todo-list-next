import { Suspense } from "react";
import { io } from "next/cache";
import { listDeletedTasks, listLogs } from "@/lib/store";
import { deleteTaskForever, recoverTask } from "../actions";

const STATUS_LABEL: Record<string, string> = {
  todo: "还没做",
  doing: "正在做",
  done: "做完",
};

const LOG_LABEL: Record<string, string> = {
  create: "新建",
  update: "编辑",
  move: "移动",
  delete: "删除",
  restore: "恢复",
};

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export default function TrashPage() {
  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">回收站</h1>

      <Suspense fallback={<p className="text-gray-400">加载中…</p>}>
        <TrashContent />
      </Suspense>
    </main>
  );
}

// 读数据部分拆成异步组件，用 Suspense 包裹，避免阻塞路由
async function TrashContent() {
  await io(); // 每次请求都重新读文件
  const deletedTasks = await listDeletedTasks();
  const recentLogs = await listLogs(Date.now() - WEEK_MS);

  return (
    <>
      <section className="mb-10">
        <h2 className="font-semibold mb-3">已删除的任务</h2>
        {deletedTasks.length === 0 ? (
          <p className="text-gray-400">回收站是空的。</p>
        ) : (
          <ul className="space-y-2">
            {deletedTasks.map((t) => (
              <li
                key={t.id}
                className="border border-gray-200 rounded p-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="font-medium">{t.title}</p>
                  {t.deletedAt && (
                    <p className="text-sm text-gray-400">
                      删除于 {new Date(t.deletedAt).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <form action={recoverTask.bind(null, t.id)}>
                    <button className="rounded bg-foreground px-3 py-1 text-sm text-background">
                      恢复
                    </button>
                  </form>
                  <form action={deleteTaskForever.bind(null, t.id)}>
                    <button className="rounded border border-gray-300 px-3 py-1 text-sm text-red-600">
                      彻底删除
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-semibold mb-3">最近动态（近 7 天）</h2>
        {recentLogs.length === 0 ? (
          <p className="text-gray-400">还没有操作记录。</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {recentLogs.slice(0, 30).map((log) => (
              <li key={log.id} className="text-gray-600">
                <span className="text-gray-400">
                  {new Date(log.timestamp).toLocaleString()}
                </span>{" "}
                {LOG_LABEL[log.type]}「{log.taskTitle}」
                {log.type === "move" && log.fromStatus && log.toStatus && (
                  <span className="text-gray-400">
                    （{STATUS_LABEL[log.fromStatus]} →{" "}
                    {STATUS_LABEL[log.toStatus]}）
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
