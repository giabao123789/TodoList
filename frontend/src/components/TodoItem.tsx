'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { CalendarDays, Check, GripVertical, Trash2 } from 'lucide-react';
import type { Todo } from '@/lib/api';

type Props = {
  todo: Todo;
  selected: boolean;
  onSelect: (id: string) => void;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
};

const easeOut = [0.16, 1, 0.3, 1] as const;

const priorityBadge: Record<
  string,
  {
    background: string;
    border: string;
    text: string;
  }
> = {
  high: {
    background: 'rgba(248, 113, 113, 0.14)',
    border: 'rgba(248, 113, 113, 0.22)',
    text: '#f4aaaa',
  },
  medium: {
    background: 'rgba(245, 184, 75, 0.16)',
    border: 'rgba(245, 184, 75, 0.22)',
    text: '#f8d58e',
  },
  low: {
    background: 'rgba(52, 211, 153, 0.16)',
    border: 'rgba(52, 211, 153, 0.2)',
    text: '#7ce7c0',
  },
};

export function TodoItem({
  todo,
  selected,
  onSelect,
  onToggle,
  onDelete,
}: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priority = priorityBadge[todo.priority] || priorityBadge.medium;

  return (
    <motion.li
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -24, transition: { duration: 0.15, ease: easeOut } }}
      transition={{ duration: 0.2, ease: easeOut }}
      className={`group relative overflow-hidden rounded-[24px] border ${
        selected
          ? 'border-[rgba(91,110,245,0.26)] bg-[rgba(91,110,245,0.08)]'
          : 'border-[color:var(--border)] bg-[rgba(17,17,24,0.72)] hover:bg-[rgba(24,24,38,0.8)]'
      } ${isDragging ? 'z-10 shadow-soft' : ''}`}
    >
      <div className="flex items-center gap-3 px-4 py-4 sm:gap-4">
        <button
          type="button"
          className="btn-ghost flex h-10 w-10 shrink-0 cursor-grab items-center justify-center rounded-2xl"
          aria-label="Reorder task"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={() => onToggle(todo.id, !todo.completed)}
          className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${
            todo.completed
              ? 'border-[rgba(52,211,153,0.26)] bg-[rgba(52,211,153,0.14)] text-[var(--success)]'
              : 'border-[color:var(--border)] bg-[rgba(17,17,24,0.92)] text-transparent'
          }`}
          aria-label={todo.completed ? 'Mark as pending' : 'Mark as done'}
        >
          <motion.span
            initial={false}
            animate={
              todo.completed
                ? { opacity: 1, scale: 1, rotate: 0 }
                : { opacity: 0, scale: 0.5, rotate: -18 }
            }
            transition={{ duration: 0.22, ease: easeOut }}
          >
            <Check className="h-4 w-4" strokeWidth={3} />
          </motion.span>
        </motion.button>

        <button
          type="button"
          onClick={() => onSelect(todo.id)}
          className="min-w-0 flex-1 text-left"
        >
          <span className="relative inline-flex max-w-full">
            <span
              className={`truncate text-[0.98rem] font-semibold tracking-[-0.02em] ${
                todo.completed
                  ? 'text-[var(--foreground-muted)]'
                  : 'text-[var(--foreground)]'
              }`}
            >
              {todo.title}
            </span>
            <motion.span
              initial={false}
              animate={{
                opacity: todo.completed ? 1 : 0,
                scaleX: todo.completed ? 1 : 0,
              }}
              transition={{ duration: 0.26, ease: easeOut }}
              className="absolute inset-x-0 top-1/2 h-px origin-left bg-[rgba(232,232,240,0.46)]"
            />
          </span>

          <span className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span
              className="inline-flex items-center rounded-full border px-2.5 py-1 font-semibold capitalize"
              style={{
                backgroundColor: priority.background,
                borderColor: priority.border,
                color: priority.text,
              }}
            >
              {todo.priority}
            </span>

            {todo.deadline && (
              <span className="inline-flex items-center gap-1 rounded-full border border-[color:var(--border)] bg-[rgba(24,24,38,0.82)] px-2.5 py-1 font-medium text-[var(--foreground-muted)]">
                <CalendarDays className="h-3.5 w-3.5" />
                {new Date(todo.deadline).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            )}
          </span>
        </button>

        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={() => onDelete(todo.id)}
          className="btn-ghost inline-flex shrink-0 items-center gap-2 self-start rounded-2xl px-3 py-2 text-sm sm:self-center"
        >
          <Trash2 className="h-4 w-4" />
          <span className="hidden sm:inline">Delete</span>
        </motion.button>
      </div>
    </motion.li>
  );
}
