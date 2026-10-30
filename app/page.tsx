import { Suspense } from "react";
import { io } from "next/cache";
import { listActiveTasks } from "@/lib/store";
import { addTask } from "./actions";
import Board from "@/components/board";

export default function Home() {
  return (
    <main className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">任务看板</h1>

      <form action={addTask} className="flex flex-wrap gap-2 mb-6">
        <input
          name="title"
          placeholder="任务标题"
          required
          className="border border-gray-300 rounded px-3 py-1"
        />
        <input
          name="description"
          placeholder="描述（可选）"
          className="border border-gray-300 rounded px-3 py-1"
        />
        <button
          type="submit"
          className="rounded bg-foreground px-4 py-1 text-background"
        >
          添加
        </button>
      </form>

      <Suspense fallback={<p className="text-gray-400">加载中…</p>}>
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
