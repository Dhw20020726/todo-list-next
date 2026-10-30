import { Suspense } from "react";
import { io } from "next/cache";
import { listDeletedTasks } from "@/lib/store";
import { deleteTaskForever, recoverTask } from "../actions";

export default function TrashPage() {
  return (
    <main className="trash-page">
      <header className="page-head">
        <h1 className="page-head__title">回收站</h1>
        <p className="page-head__sub">被删除的任务会先放在这里，随时可以找回</p>
      </header>

      <Suspense fallback={<p className="loading">加载中…</p>}>
        <TrashContent />
      </Suspense>
    </main>
  );
}

// 读数据部分拆成异步组件，用 Suspense 包裹，避免阻塞路由
async function TrashContent() {
  await io(); // 每次请求都重新读文件
  const deletedTasks = await listDeletedTasks();

  return (
    <section className="panel">
      <h2 className="panel__title">已删除的任务</h2>
      {deletedTasks.length === 0 ? (
        <p className="empty">回收站是空的。</p>
      ) : (
        <ul className="list">
          {deletedTasks.map((t) => (
            <li key={t.id} className="list-item">
              <div className="list-item__meta">
                <p className="list-item__title">{t.title}</p>
                {t.description && (
                  <p className="list-item__desc">{t.description}</p>
                )}
                <p className="list-item__hint">
                  创建于 {new Date(t.createdAt).toLocaleString()}
                </p>
                {t.deletedAt && (
                  <p className="list-item__hint">
                    删除于 {new Date(t.deletedAt).toLocaleString()}
                  </p>
                )}
              </div>
              <div className="list-item__actions">
                <form action={recoverTask.bind(null, t.id)}>
                  <button className="btn btn--primary btn--sm">恢复</button>
                </form>
                <form action={deleteTaskForever.bind(null, t.id)}>
                  <button className="btn btn--danger-ghost btn--sm">
                    彻底删除
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
