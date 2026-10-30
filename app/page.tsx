import { Suspense } from "react";
import { io } from "next/cache";
import { listActiveTasks } from "@/lib/store";
import { addTask } from "./actions";
import Board from "@/components/board";

export default function Home() {
  return (
    <main className="board-page">
      <header className="page-head">
        <h1 className="page-head__title">任务看板</h1>
        <p className="page-head__sub">拖拽卡片，随时调整进度</p>
      </header>

      <form action={addTask} className="composer">
        <input
          name="title"
          placeholder="任务标题"
          required
          autoComplete="off"
          className="composer__input composer__input--title"
        />
        <input
          name="description"
          placeholder="描述（可选）"
          autoComplete="off"
          className="composer__input composer__input--desc"
        />
        <button
          type="submit"
          className="btn btn--primary composer__submit"
        >
          添加任务
        </button>
      </form>

      <Suspense fallback={<p className="loading">加载中…</p>}>
        <BoardSection />
      </Suspense>
    </main>
  );
}

// 读数据的部分单独抽成异步组件，用 Suspense 包裹：
// 页面其余部分（标题/表单）能预渲染成静态外壳，看板数据再流式进入
async function BoardSection() {
  await io(); // 让文件读取在请求时执行，不固化进静态外壳
  const tasks = await listActiveTasks();
  return <Board tasks={tasks} />;
}
