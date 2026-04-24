'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { GripVertical } from 'lucide-react';
import type { Todo } from '@/lib/api';

type Props = {
  todo: Todo;
  selected: boolean;
  onSelect: (id: string) => void;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
};

const priorityBadge: Record<
  string,
 string
> = {
  high: 'bg-rose-500/15 text-rose-800 dark:text-rose-200',
  medium: 'bg-amber-400/20 text-amber-900 dark:text-amber-100',
  low: 'bg-emerald-500/15 text-emerald-900 dark:text-emerald-100',
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

  return (
    <motion.li
      ref={setNodeRef}
      style={style}
      layout
      className={`group relative rounded-2xl border bg-white/95 shadow-soft transition dark:bg-[#2a2028]/95 ${
        selected
          ? 'border-pink-400 ring-2 ring-pink-300/50 dark:border-pink-500 dark:ring-pink-900/50'
          : 'border-rose-100/90 dark:border-rose-900/50'
      } ${isDragging ? 'z-10 opacity-90 shadow-lg' : ''}`}
    >
      <div className="flex items-stretch gap-1 sm:gap-2">
        <button
          type="button"
          className="flex shrink-0 cursor-grab items-center rounded-l-2xl px-1 text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50"
          aria-label="Reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex min-w-0 flex-1 flex-col gap-2 py-3 pr-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => onToggle(todo.id, !todo.completed)}
            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-xl border-2 ${
              todo.completed
                ? 'border-pink-400 bg-pink-400 text-white'
                : 'border-rose-300 dark:border-rose-700'
            }`}
            aria-label={todo.completed ? 'Mark pending' : 'Mark done'}
          >
            {todo.completed ? '✓' : ''}
          </button>
          <button
            type="button"
            onClick={() => onSelect(todo.id)}
            className="min-w-0 flex-1 text-left"
          >
            <span
              className={`block font-medium text-rose-950 dark:text-rose-50 ${
                todo.completed ? 'text-rose-500 line-through' : ''
              }`}
            >
              {todo.title}
            </span>
            <span className="mt-1 flex flex-wrap gap-2 text-xs text-rose-600 dark:text-rose-300">
              <span
                className={`rounded-lg px-2 py-0.5 capitalize ${priorityBadge[todo.priority] || priorityBadge.medium}`}
              >
                {todo.priority}
              </span>
              {todo.deadline && (
                <span>
                  Due{' '}
                  {new Date(todo.deadline).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              )}
            </span>
          </button>
          <button
            type="button"
            onClick={() => onDelete(todo.id)}
            className="shrink-0 self-start rounded-xl px-2 py-1 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 sm:self-center"
          >
            Delete
          </button>
        </div>
      </div>
    </motion.li>
  );
}
