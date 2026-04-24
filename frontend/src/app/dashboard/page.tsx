"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import {
  type Todo,
  type TodoPriority,
  classifyPriority,
  createTodo,
  deleteTodo,
  fetchTodos,
  generateTodos,
  reorderTodos,
  suggestDeadline,
  suggestNextTask,
  updateTodo,
} from "@/lib/api";
import { TodoList } from "@/components/TodoList";

type Filter = "all" | "completed" | "pending";

export default function DashboardPage() {
  const [items, setItems] = useState<Todo[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [aiGoal, setAiGoal] = useState("");
  const [aiBusy, setAiBusy] = useState<string | null>(null);
  const [aiNote, setAiNote] = useState<string | null>(null);

  const selected = items.find((t) => t.id === selectedId) ?? null;

  const refreshFirstPage = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchTodos({
        page: 1,
        limit: 40,
        filter,
        search: search || undefined,
      });
      setItems(data.items);
      setPage(1);
      setTotalPages(data.totalPages);
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => {
    void refreshFirstPage();
  }, [refreshFirstPage]);

  const loadMore = async () => {
    if (page >= totalPages) return;
    const np = page + 1;
    const data = await fetchTodos({
      page: np,
      limit: 40,
      filter,
      search: search || undefined,
    });
    setPage(np);
    setItems((prev) => {
      const seen = new Set(prev.map((t) => t.id));
      const next = [...prev];
      for (const t of data.items) {
        if (!seen.has(t.id)) next.push(t);
      }
      return next;
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    const t = await createTodo({ title });
    setNewTitle("");
    setItems((prev) => [t, ...prev]);
  };

  const onToggle = async (id: string, completed: boolean) => {
    const updated = await updateTodo(id, { completed });
    setItems((prev) => prev.map((x) => (x.id === id ? updated : x)));
  };

  const onDelete = async (id: string) => {
    await deleteTodo(id);
    setItems((prev) => prev.filter((x) => x.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const onReorder = async (orderedIds: string[]) => {
    const idSet = new Set(orderedIds);
    setItems((prev) => {
      const map = new Map(prev.map((t) => [t.id, t]));
      const ordered = orderedIds
        .map((id) => map.get(id))
        .filter(Boolean) as Todo[];
      const rest = prev.filter((t) => !idSet.has(t.id));
      return [...ordered, ...rest];
    });
    await reorderTodos(orderedIds);
  };

  const runGenerate = async () => {
    const g = aiGoal.trim();
    if (!g) return;
    setAiBusy("generate");
    setAiNote(null);
    try {
      const res = await generateTodos(g);
      for (const t of res.todos) {
        const created = await createTodo({
          title: t.title,
          priority: (t.priority as TodoPriority) || "medium",
        });
        setItems((prev) => [created, ...prev]);
      }
      setAiGoal("");
      setAiNote(`Added ${res.todos.length} tasks.`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string | string[] } } })
          ?.response?.data?.message;
      setAiNote(typeof msg === "string" ? msg : "Could not generate todos.");
    } finally {
      setAiBusy(null);
    }
  };

  const getAiErrorMessage = (err: unknown) => {
    const msg = (err as { response?: { data?: { message?: string | string[] } } })
      ?.response?.data?.message;
    if (typeof msg === "string") return msg;
    if (Array.isArray(msg)) return msg.join(", ");
    return null;
  };

  const runSuggest = async () => {
    if (!selected) return;
    setAiBusy("suggest");
    setAiNote(null);
    try {
      const ctx = items
        .filter((t) => !t.completed && t.id !== selected.id)
        .slice(0, 5)
        .map((t) => t.title)
        .join("; ");
      const res = await suggestNextTask(selected.title, ctx);
      setAiNote(res.suggestion + (res.reason ? ` — ${res.reason}` : ""));
    } catch (err: unknown) {
      const msg = getAiErrorMessage(err);
      setAiNote(msg ?? "Suggestion failed.");
    } finally {
      setAiBusy(null);
    }
  };

  const runPriority = async () => {
    if (!selected) return;
    setAiBusy("priority");
    setAiNote(null);
    try {
      const res = await classifyPriority(selected.title);
      const updated = await updateTodo(selected.id, { priority: res.priority });
      setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      setAiNote(`Priority: ${res.priority}. ${res.rationale || ""}`);
    } catch (err: unknown) {
      const msg = getAiErrorMessage(err);
      setAiNote(msg ?? "Priority detection failed.");
    } finally {
      setAiBusy(null);
    }
  };

  const runDeadline = async () => {
    if (!selected) return;
    setAiBusy("deadline");
    setAiNote(null);
    try {
      const res = await suggestDeadline(
        selected.title,
        selected.deadline || undefined,
      );
      const updated = await updateTodo(selected.id, {
        deadline: res.deadline,
      });
      setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      setAiNote(`Suggested due: ${res.deadline} ${res.confidence ? `(${res.confidence})` : ""}`);
    } catch (err: unknown) {
      const msg = getAiErrorMessage(err);
      setAiNote(msg ?? "Deadline suggestion failed.");
    } finally {
      setAiBusy(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-rose-950 dark:text-rose-50">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-rose-700 dark:text-rose-300">
          Todos, filters, drag to reorder, and AI helpers.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <form
            onSubmit={addTodo}
            className="flex flex-col gap-2 sm:flex-row sm:items-center"
          >
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="New todo…"
              className="min-w-0 flex-1 rounded-2xl border border-rose-200/80 bg-white/90 px-4 py-3 text-rose-950 outline-none ring-pink-400/30 focus:ring-2 dark:border-rose-800 dark:bg-[#2a2028] dark:text-rose-50"
            />
            <button
              type="submit"
              className="rounded-2xl bg-gradient-to-r from-pink-400 to-rose-400 px-5 py-3 text-sm font-semibold text-white shadow-md"
            >
              Add
            </button>
          </form>

          <form
            onSubmit={handleSearch}
            className="flex flex-wrap items-center gap-2"
          >
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search…"
              className="min-w-[12rem] flex-1 rounded-2xl border border-rose-200/80 bg-white/90 px-4 py-2 text-sm dark:border-rose-800 dark:bg-[#2a2028] dark:text-rose-50"
            />
            <button
              type="submit"
              className="rounded-2xl border border-rose-200/80 bg-white/80 px-4 py-2 text-sm dark:border-rose-800 dark:bg-[#2a2028]"
            >
              Search
            </button>
          </form>

          <div className="flex flex-wrap gap-2">
            {(
              [
                ["all", "All"],
                ["pending", "Pending"],
                ["completed", "Done"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
                  filter === key
                    ? "bg-pink-200/80 text-rose-950 dark:bg-pink-900/50 dark:text-rose-50"
                    : "bg-white/70 text-rose-800 hover:bg-rose-50 dark:bg-[#2a2028] dark:text-rose-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="text-sm text-rose-600">Loading todos…</p>
          ) : (
            <TodoList
              todos={items}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onToggle={onToggle}
              onDelete={onDelete}
              onReorder={onReorder}
            />
          )}

          {page < totalPages && (
            <button
              type="button"
              onClick={() => void loadMore()}
              className="w-full rounded-2xl border border-rose-200/80 py-2 text-sm text-rose-800 dark:border-rose-800 dark:text-rose-200"
            >
              Load more
            </button>
          )}
        </div>

        <motion.aside
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 rounded-3xl border border-rose-100/90 bg-white/90 p-5 shadow-soft dark:border-rose-900/50 dark:bg-[#231b22]/95"
        >
          <h2 className="text-sm font-semibold uppercase tracking-wide text-rose-400">
            AI tools
          </h2>
          <div>
            <label className="text-xs font-medium text-rose-700 dark:text-rose-300">
              Smart generator
            </label>
            <textarea
              value={aiGoal}
              onChange={(e) => setAiGoal(e.target.value)}
              rows={3}
              placeholder='e.g. "Learn JavaScript in 7 days"'
              className="mt-1 w-full rounded-2xl border border-rose-200/80 bg-[#fff1f2]/50 p-3 text-sm dark:border-rose-800 dark:bg-[#2a2028] dark:text-rose-50"
            />
            <button
              type="button"
              disabled={!!aiBusy}
              onClick={() => void runGenerate()}
              className="mt-2 w-full rounded-2xl bg-gradient-to-r from-pink-400 to-rose-400 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {aiBusy === "generate" ? "Generating…" : "Generate todos"}
            </button>
          </div>

          <div className="border-t border-rose-100/80 pt-4 dark:border-rose-900/50">
            <p className="text-xs text-rose-600 dark:text-rose-400">
              Select a todo for suggestions, priority, or deadline.
            </p>
            <div className="mt-2 flex flex-col gap-2">
              <button
                type="button"
                disabled={!selected || !!aiBusy}
                onClick={() => void runSuggest()}
                className="rounded-2xl border border-rose-200/80 py-2 text-sm font-medium disabled:opacity-40 dark:border-rose-800"
              >
                {aiBusy === "suggest" ? "…" : "Suggest next task"}
              </button>
              <button
                type="button"
                disabled={!selected || !!aiBusy}
                onClick={() => void runPriority()}
                className="rounded-2xl border border-rose-200/80 py-2 text-sm font-medium disabled:opacity-40 dark:border-rose-800"
              >
                {aiBusy === "priority" ? "…" : "Detect priority"}
              </button>
              <button
                type="button"
                disabled={!selected || !!aiBusy}
                onClick={() => void runDeadline()}
                className="rounded-2xl border border-rose-200/80 py-2 text-sm font-medium disabled:opacity-40 dark:border-rose-800"
              >
                {aiBusy === "deadline" ? "…" : "Suggest deadline"}
              </button>
            </div>
          </div>

          {aiNote && (
            <p className="rounded-2xl bg-rose-50/90 p-3 text-sm text-rose-900 dark:bg-[#2a2028] dark:text-rose-100">
              {aiNote}
            </p>
          )}
        </motion.aside>
      </div>
    </div>
  );
}
