'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
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

type ConfettiPiece = {
  id: string;
  color: string;
  left: string;
  shape: string;
  size: string;
  style: CSSProperties;
};

const easeOvershoot = [0.34, 1.8, 0.64, 1] as const;

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
    text: '#efb3b3',
  },
  medium: {
    background: 'rgba(245, 184, 75, 0.16)',
    border: 'rgba(245, 184, 75, 0.22)',
    text: '#f5d48f',
  },
  low: {
    background: 'rgba(16, 185, 129, 0.14)',
    border: 'rgba(16, 185, 129, 0.2)',
    text: '#72ebc3',
  },
};

const priorityGradient: Record<string, string> = {
  high: 'linear-gradient(180deg, #EF4444, #F97316)',
  medium: 'linear-gradient(180deg, #F59E0B, #FCD34D)',
  low: 'linear-gradient(180deg, #10B981, #6EE7B7)',
};

function createConfetti() {
  const colors = ['#F97316', '#EF4444', '#F59E0B', '#10B981', '#6EE7B7'];
  const shapes = ['◆', '●', '▲', '★', '✦'];
  return Array.from({ length: 100 }).map((_, index) => {
    const angle = Math.random() * Math.PI * 0.9 - Math.PI * 0.3;
    const speed = Math.random() * 160 + 160;
    const x = Math.cos(angle) * speed;
    const y = Math.sin(angle) * speed + 120;
    const size = Math.round(Math.random() * 10 + 10);
    return {
      id: `confetti-${Date.now()}-${index}`,
      left: `${Math.random() * 70 + 12}%`,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      size: `${size}px`,
      color: colors[index % colors.length],
      style: {
        '--confetti-x': `${x}px`,
        '--confetti-y': `${y}px`,
        '--confetti-rot': `${Math.random() * 360}deg`,
        animationDelay: `${Math.random() * 140}ms`,
        fontSize: `${size}px`,
        lineHeight: 1,
      } as CSSProperties,
    };
  });
}

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

  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [ripple, setRipple] = useState(false);
  const prevCompleted = useRef(todo.completed);

  useEffect(() => {
    const didComplete = !prevCompleted.current && todo.completed;
    prevCompleted.current = todo.completed;
    if (!didComplete) return;

    setRipple(true);
    setConfetti(createConfetti());

    const rippleTimer = window.setTimeout(() => setRipple(false), 420);
    const confettiTimer = window.setTimeout(() => setConfetti([]), 1200);
    return () => {
      window.clearTimeout(rippleTimer);
      window.clearTimeout(confettiTimer);
    };
  }, [todo.completed]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priority = priorityBadge[todo.priority] || priorityBadge.medium;
  const gradient = priorityGradient[todo.priority] || priorityGradient.medium;

  return (
    <motion.li
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, x: -60, scale: 0.85, rotate: -4 }}
      animate={{
        opacity: 1,
        x: [-60, 10, 0],
        scale: [0.85, 1.02, 1],
        rotate: [-4, 0.3, 0],
      }}
      exit={{
        opacity: [1, 0.9, 0],
        x: [0, -15, 80],
        scale: [1, 0.96, 0.92],
        transition: { duration: 0.45, ease: easeOvershoot },
      }}
      whileHover={{ x: 10, scale: 1.02, rotate: 0.3 }}
      transition={{ duration: 0.55, ease: easeOvershoot }}
      className={`group relative overflow-hidden rounded-[28px] border border-[#E7E5E4] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)] transition-all duration-200 ${
        selected
          ? 'bg-[#FFFBF5] shadow-[0_22px_60px_rgba(249,115,22,0.12)]'
          : 'hover:shadow-[0_26px_80px_rgba(15,23,42,0.08)]'
      } ${isDragging ? 'z-10' : ''}`}
    >
      <span
        className="pointer-events-none absolute left-0 top-0 h-full w-[5px] rounded-r-full transition-all duration-300 group-hover:w-[8px]"
        style={{ background: gradient }}
      />

      <div className="relative flex items-center gap-3 px-5 py-4 sm:gap-4">
        <button
          type="button"
          className="btn-secondary flex h-10 w-10 shrink-0 cursor-grab items-center justify-center rounded-2xl border border-[#E7E5E4] bg-[#fff7f1] text-[var(--foreground-muted)] transition-colors duration-200"
          aria-label="Reorder task"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <motion.button
          type="button"
          whileTap={{ scale: 0.82 }}
          onClick={() => onToggle(todo.id, !todo.completed)}
          className={`relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl border text-transparent transition-all duration-200 ${
            todo.completed
              ? 'border-[rgba(16,185,129,0.2)] bg-[rgba(16,185,129,0.12)] text-[var(--success)]'
              : 'border-[#E7E5E4] bg-[#fff7f1]'
          }`}
          aria-label={todo.completed ? 'Mark as pending' : 'Mark as done'}
        >
          {ripple && <span className="checkbox-ripple" />}
          <motion.span
            initial={false}
            animate={
              todo.completed
                ? { opacity: 1, scale: [0, 1.5, 0.9, 1], rotate: [-200, 0] }
                : { opacity: 0, scale: 0, rotate: -200 }
            }
            transition={{ duration: 0.45, ease: easeOvershoot }}
          >
            <Check className="h-4 w-4" strokeWidth={3} />
          </motion.span>
        </motion.button>

        <button type="button" onClick={() => onSelect(todo.id)} className="min-w-0 flex-1 text-left">
          <span className="relative inline-flex max-w-full">
            <span
              className={`truncate text-[0.98rem] font-semibold tracking-[-0.02em] ${
                todo.completed ? 'text-[#6B7280]' : 'text-[var(--foreground)]'
              }`}
            >
              {todo.title}
            </span>
            <motion.span
              initial={false}
              animate={{ width: todo.completed ? '100%' : '0%', opacity: todo.completed ? 1 : 0 }}
              transition={{ duration: 0.32, ease: easeOvershoot }}
              className="absolute left-0 top-1/2 h-px origin-left bg-[rgba(232,232,240,0.7)]"
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
              <span className="inline-flex items-center gap-1 rounded-full border border-[#E7E5E4] bg-[#FEF6EE] px-2.5 py-1 font-medium text-[var(--foreground-muted)]">
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
          whileTap={{ scale: 0.94 }}
          onClick={() => onDelete(todo.id)}
          className="btn-secondary inline-flex shrink-0 items-center gap-2 self-start rounded-2xl border border-[#E7E5E4] bg-[#fff7f1] px-3 py-2 text-sm font-semibold text-[var(--foreground)] transition duration-200 sm:self-center"
        >
          <Trash2 className="h-4 w-4" />
          <span className="hidden sm:inline">Delete</span>
        </motion.button>
      </div>

      {confetti.map((piece) => (
        <span
          key={piece.id}
          className="confetti-piece"
          style={{
            ...piece.style,
            left: piece.left,
            width: piece.size,
            height: piece.size,
            color: piece.color,
          }}
        >
          {piece.shape}
        </span>
      ))}
    </motion.li>
  );
}
