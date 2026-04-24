'use client';

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { AnimatePresence, motion } from 'framer-motion';
import type { Todo } from '@/lib/api';
import { TodoItem } from './TodoItem';

type Props = {
  todos: Todo[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onReorder: (orderedIds: string[]) => void;
};

const easeOut = [0.16, 1, 0.3, 1] as const;

function EmptyStateIllustration() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: easeOut }}
      className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-[color:var(--border)] bg-[rgba(17,17,24,0.56)] px-6 py-14 text-center"
    >
      <motion.svg
        viewBox="0 0 240 180"
        aria-hidden
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
        className="h-40 w-full max-w-[260px]"
      >
        <ellipse cx="120" cy="138" rx="72" ry="20" fill="rgba(91,110,245,0.18)" />
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path
            d="M72 34h86c9 0 16 7 16 16v60c0 9-7 16-16 16H84l-18 14 6-18V50c0-9 7-16 16-16Z"
            fill="rgba(17,17,24,0.94)"
            stroke="rgba(91,110,245,0.35)"
            strokeWidth="2"
          />
          <path d="M96 64h50" stroke="rgba(232,232,240,0.88)" strokeWidth="5" />
          <path d="M96 88h42" stroke="rgba(107,107,128,0.86)" strokeWidth="5" />
          <path d="M96 112h54" stroke="rgba(107,107,128,0.72)" strokeWidth="5" />
          <circle cx="84" cy="64" r="7" fill="rgba(91,110,245,0.24)" stroke="rgba(91,110,245,0.62)" strokeWidth="2" />
          <circle cx="84" cy="88" r="7" fill="rgba(52,211,153,0.12)" stroke="rgba(52,211,153,0.82)" strokeWidth="2" />
          <path d="m80 88 3 3 6-7" stroke="rgba(52,211,153,0.92)" strokeWidth="2.5" />
          <circle cx="84" cy="112" r="7" fill="rgba(91,110,245,0.24)" stroke="rgba(91,110,245,0.42)" strokeWidth="2" />
        </g>
      </motion.svg>

      <p className="mt-6 text-[clamp(1.1rem,1rem+0.35vw,1.35rem)] font-semibold text-[var(--foreground)]">
        Your workspace is clear.
      </p>
      <p className="mt-2 max-w-md text-sm leading-6 text-[var(--foreground-muted)]">
        Start with a new task or ask AI to draft the first set for you.
      </p>
    </motion.div>
  );
}

export function TodoList({
  todos,
  selectedId,
  onSelect,
  onToggle,
  onDelete,
  onReorder,
}: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = todos.findIndex((t) => t.id === active.id);
    const newIndex = todos.findIndex((t) => t.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(todos, oldIndex, newIndex);
    onReorder(next.map((t) => t.id));
  };

  if (!todos.length) {
    return <EmptyStateIllustration />;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <SortableContext
        items={todos.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul className="space-y-2">
          <AnimatePresence initial={false} mode="popLayout">
            {todos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                selected={selectedId === todo.id}
                onSelect={onSelect}
                onToggle={onToggle}
                onDelete={onDelete}
              />
            ))}
          </AnimatePresence>
        </ul>
      </SortableContext>
    </DndContext>
  );
}
