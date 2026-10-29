import { connection } from "next/server";
import { listActiveTasks } from "@/lib/store";
import { addTask } from "./actions";
import Board from "@/components/board";

export default async function Home() {
  await connection(); // 关键：让页面在每次请求时都重新读数据文件，而不是构建时固化
  const tasks = await listActiveTasks();

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

      <Board tasks={tasks} />
    </main>
  );
}
