"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Search, Sparkles } from "lucide-react";
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

const easeOut = [0.16, 1, 0.3, 1] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.26,
      ease: easeOut,
    },
  },
};

const priorityTone: Record<
  TodoPriority,
  {
    background: string;
    border: string;
    text: string;
  }
> = {
  high: {
    background: "rgba(248, 113, 113, 0.14)",
    border: "rgba(248, 113, 113, 0.22)",
    text: "#f4aaaa",
  },
  medium: {
    background: "rgba(245, 184, 75, 0.16)",
    border: "rgba(245, 184, 75, 0.22)",
    text: "#f8d58e",
  },
  low: {
    background: "rgba(52, 211, 153, 0.16)",
    border: "rgba(52, 211, 153, 0.2)",
    text: "#7ce7c0",
  },
};

function MetricCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "primary" | "success";
}) {
  const valueClass =
    accent === "success"
      ? "text-[var(--success)]"
      : accent === "primary"
        ? "text-[var(--foreground)]"
        : "text-[var(--foreground)]";

  return (
    <div className="metric-chip rounded-2xl p-4">
      <p className="text-xs uppercase tracking-[0.12em] text-[var(--foreground-muted)]">
        {label}
      </p>
      <p className={`mt-3 text-2xl font-semibold tracking-[-0.03em] ${valueClass}`}>
        {value}
      </p>
    </div>
  );
}

function TodoSkeletonList() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="rounded-[24px] border border-[color:var(--border)] bg-[rgba(17,17,24,0.72)] px-4 py-4"
        >
          <div className="flex items-center gap-3">
            <div className="loading-skeleton h-11 w-11 rounded-2xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="loading-skeleton h-4 w-[40%] rounded-full" />
              <div className="loading-skeleton h-3 w-[22%] rounded-full" />
            </div>
            <div className="loading-skeleton hidden h-9 w-24 rounded-2xl sm:block" />
          </div>
        </div>
      ))}
    </div>
  );
}

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
  const openCount = items.filter((todo) => !todo.completed).length;
  const completedCount = items.filter((todo) => todo.completed).length;
  const highPriorityCount = items.filter((todo) => todo.priority === "high").length;

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
    const nextPage = page + 1;
    const data = await fetchTodos({
      page: nextPage,
      limit: 40,
      filter,
      search: search || undefined,
    });
    setPage(nextPage);
    setItems((prev) => {
      const seen = new Set(prev.map((todo) => todo.id));
      const next = [...prev];
      for (const todo of data.items) {
        if (!seen.has(todo.id)) next.push(todo);
      }
      return next;
    });
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setSearch(searchInput.trim());
  };

  const addTodo = async (event: React.FormEvent) => {
    event.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    const todo = await createTodo({ title });
    setNewTitle("");
    setItems((prev) => [todo, ...prev]);
  };

  const onToggle = async (id: string, completed: boolean) => {
    const updated = await updateTodo(id, { completed });
    setItems((prev) => prev.map((todo) => (todo.id === id ? updated : todo)));
  };

  const onDelete = async (id: string) => {
    await deleteTodo(id);
    setItems((prev) => prev.filter((todo) => todo.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const onReorder = async (orderedIds: string[]) => {
    const idSet = new Set(orderedIds);
    setItems((prev) => {
      const map = new Map(prev.map((todo) => [todo.id, todo]));
      const ordered = orderedIds
        .map((id) => map.get(id))
        .filter(Boolean) as Todo[];
      const rest = prev.filter((todo) => !idSet.has(todo.id));
      return [...ordered, ...rest];
    });
    await reorderTodos(orderedIds);
  };

  const runGenerate = async () => {
    const goal = aiGoal.trim();
    if (!goal) return;
    setAiBusy("generate");
    setAiNote(null);
    try {
      const res = await generateTodos(goal);
      for (const todo of res.todos) {
        const created = await createTodo({
          title: todo.title,
          priority: (todo.priority as TodoPriority) || "medium",
        });
        setItems((prev) => [created, ...prev]);
      }
      setAiGoal("");
      setAiNote(`Added ${res.todos.length} tasks.`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string | string[] } } })
          ?.response?.data?.message;
      setAiNote(typeof msg === "string" ? msg : "Could not generate tasks.");
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
      const context = items
        .filter((todo) => !todo.completed && todo.id !== selected.id)
        .slice(0, 5)
        .map((todo) => todo.title)
        .join("; ");
      const res = await suggestNextTask(selected.title, context);
      setAiNote(res.suggestion + (res.reason ? ` - ${res.reason}` : ""));
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
      setItems((prev) => prev.map((todo) => (todo.id === updated.id ? updated : todo)));
      setAiNote(`Priority: ${res.priority}. ${res.rationale || ""}`.trim());
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
      setItems((prev) => prev.map((todo) => (todo.id === updated.id ? updated : todo)));
      setAiNote(
        `Suggested due: ${res.deadline}${res.confidence ? ` (${res.confidence})` : ""}`,
      );
    } catch (err: unknown) {
      const msg = getAiErrorMessage(err);
      setAiNote(msg ?? "Deadline suggestion failed.");
    } finally {
      setAiBusy(null);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.section
        variants={sectionVariants}
        className="surface-panel relative overflow-hidden rounded-[32px] px-6 py-7 sm:px-8 sm:py-8"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(91,110,245,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(91,110,245,0.08),transparent_34%)]"
        />

        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="kicker">Command Center</p>
            <h1 className="mt-3 max-w-2xl text-[clamp(2.2rem,2rem+1vw,3rem)] leading-[1.02]">
              Clear the queue, keep momentum.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--foreground-muted)] sm:text-base">
              A fast workspace for capture, prioritization, and quiet AI support
              when the next move is not obvious.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <MetricCard label="Open" value={openCount} accent="primary" />
            <MetricCard label="Done" value={completedCount} accent="success" />
            <MetricCard label="High Priority" value={highPriorityCount} />
          </div>
        </div>
      </motion.section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <motion.div variants={sectionVariants} className="space-y-6">
          <section className="surface-panel rounded-[30px] p-6 sm:p-7">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
              <form onSubmit={addTodo} className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="kicker">Capture</p>
                    <h2 className="mt-2 text-[clamp(1.3rem,1.2rem+0.45vw,1.7rem)]">
                      Add the next task
                    </h2>
                  </div>
                  <span className="rounded-full border border-[color:var(--border)] bg-[rgba(24,24,38,0.8)] px-3 py-1 text-xs text-[var(--foreground-muted)]">
                    Quick entry
                  </span>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    value={newTitle}
                    onChange={(event) => setNewTitle(event.target.value)}
                    placeholder="Add a task you do not want to drop..."
                    className="field-shell min-w-0 flex-1 rounded-2xl px-4 py-3.5 text-sm sm:text-base"
                  />
                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.97 }}
                    className="btn-primary rounded-2xl px-5 py-3.5 text-sm font-semibold"
                  >
                    Add task
                  </motion.button>
                </div>
              </form>

              <form onSubmit={handleSearch} className="space-y-3">
                <div>
                  <p className="kicker">Find</p>
                  <h2 className="mt-2 text-[clamp(1.3rem,1.2rem+0.45vw,1.7rem)]">
                    Search the queue
                  </h2>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative min-w-0 flex-1">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-muted)]" />
                    <input
                      value={searchInput}
                      onChange={(event) => setSearchInput(event.target.value)}
                      placeholder="Titles, deadlines, priorities..."
                      className="field-shell w-full rounded-2xl py-3.5 pl-11 pr-4 text-sm"
                    />
                  </div>

                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.97 }}
                    className="btn-secondary rounded-2xl px-4 py-3.5 text-sm font-semibold"
                  >
                    Search
                  </motion.button>
                </div>
              </form>
            </div>

            <div className="mt-5 border-t border-[color:var(--border)] pt-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="kicker">Filter</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                    Crossfade between every task, active work, and completed items.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      ["all", "All"],
                      ["pending", "Pending"],
                      ["completed", "Done"],
                    ] as const
                  ).map(([key, label]) => {
                    const active = filter === key;
                    return (
                      <motion.button
                        key={key}
                        type="button"
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setFilter(key)}
                        className="relative overflow-hidden rounded-2xl border border-[color:var(--border)] px-4 py-2.5 text-sm font-semibold"
                      >
                        {active && (
                          <motion.span
                            layoutId="filter-pill"
                            transition={{ duration: 0.2, ease: easeOut }}
                            className="absolute inset-0 bg-[var(--primary)]"
                          />
                        )}
                        <span
                          className={`relative ${
                            active
                              ? "text-[var(--foreground)]"
                              : "text-[var(--foreground-muted)]"
                          }`}
                        >
                          {label}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <motion.section
            variants={sectionVariants}
            className="surface-panel rounded-[30px] p-4 sm:p-5"
          >
            <div className="flex flex-col gap-3 px-2 pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="kicker">Queue</p>
                <h2 className="mt-2 text-[clamp(1.4rem,1.3rem+0.4vw,1.8rem)]">
                  Task flow
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                  Drag to reorder. Select a task to route AI actions through the
                  side panel.
                </p>
              </div>
              <span className="rounded-full border border-[color:var(--border)] bg-[rgba(24,24,38,0.76)] px-3 py-1 text-xs text-[var(--foreground-muted)]">
                {items.length} loaded
              </span>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={loading ? `loading-${filter}` : `ready-${filter}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: easeOut }}
              >
                {loading ? (
                  <TodoSkeletonList />
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
              </motion.div>
            </AnimatePresence>

            {page < totalPages && !loading && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => void loadMore()}
                className="btn-secondary mt-4 w-full rounded-[20px] px-4 py-3 text-sm font-semibold"
              >
                Load more tasks
              </motion.button>
            )}
          </motion.section>
        </motion.div>

        <motion.aside
          variants={sectionVariants}
          className="surface-panel space-y-6 rounded-[30px] p-6"
        >
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--primary)]" />
              <p className="kicker">AI Tools</p>
            </div>
            <p className="mt-4 text-[clamp(1.3rem,1.2rem+0.4vw,1.65rem)] font-semibold text-[var(--foreground)]">
              Let the assistant take the heavy lift.
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
              Draft tasks from a goal, then refine the currently selected item with
              suggestions, priority, or a due date.
            </p>
          </div>

          <div className="rounded-[24px] border border-[color:var(--border)] bg-[rgba(24,24,38,0.78)] p-4">
            <p className="kicker">Selected Task</p>
            {selected ? (
              <div className="mt-3 space-y-3">
                <p className="text-sm font-semibold leading-6 text-[var(--foreground)]">
                  {selected.title}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span
                    className="rounded-full border px-2.5 py-1 text-xs font-semibold capitalize"
                    style={{
                      backgroundColor: priorityTone[selected.priority].background,
                      borderColor: priorityTone[selected.priority].border,
                      color: priorityTone[selected.priority].text,
                    }}
                  >
                    {selected.priority}
                  </span>
                  {selected.deadline && (
                    <span className="rounded-full border border-[color:var(--border)] bg-[rgba(17,17,24,0.82)] px-2.5 py-1 text-xs font-medium text-[var(--foreground-muted)]">
                      Due{" "}
                      {new Date(selected.deadline).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm leading-6 text-[var(--foreground-muted)]">
                Select a task from the queue to unlock contextual AI actions.
              </p>
            )}
          </div>

          <div className="space-y-3">
            <label htmlFor="ai-goal" className="kicker">
              Generate from a goal
            </label>
            <textarea
              id="ai-goal"
              value={aiGoal}
              onChange={(event) => setAiGoal(event.target.value)}
              rows={4}
              placeholder='Example: "Prepare a product launch in 5 days"'
              className="field-shell w-full rounded-[24px] p-4 text-sm leading-6"
            />
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              disabled={!!aiBusy}
              onClick={() => void runGenerate()}
              className="btn-primary w-full rounded-2xl px-4 py-3 text-sm font-semibold disabled:opacity-50"
            >
              {aiBusy === "generate" ? "Generating..." : "Generate tasks"}
            </motion.button>
          </div>

          <div className="space-y-3 border-t border-[color:var(--border)] pt-5">
            <p className="kicker">Selected task actions</p>
            <div className="grid gap-2">
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                disabled={!selected || !!aiBusy}
                onClick={() => void runSuggest()}
                className="btn-secondary rounded-2xl px-4 py-3 text-left text-sm font-semibold disabled:opacity-40"
              >
                {aiBusy === "suggest" ? "Working..." : "Suggest next task"}
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                disabled={!selected || !!aiBusy}
                onClick={() => void runPriority()}
                className="btn-secondary rounded-2xl px-4 py-3 text-left text-sm font-semibold disabled:opacity-40"
              >
                {aiBusy === "priority" ? "Working..." : "Detect priority"}
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                disabled={!selected || !!aiBusy}
                onClick={() => void runDeadline()}
                className="btn-secondary rounded-2xl px-4 py-3 text-left text-sm font-semibold disabled:opacity-40"
              >
                {aiBusy === "deadline" ? "Working..." : "Suggest deadline"}
              </motion.button>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {aiNote && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: easeOut }}
                className="rounded-[22px] border border-[rgba(91,110,245,0.2)] bg-[rgba(91,110,245,0.1)] p-4 text-sm leading-6 text-[var(--foreground)]"
              >
                {aiNote}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.aside>
      </div>
    </motion.div>
  );
}
