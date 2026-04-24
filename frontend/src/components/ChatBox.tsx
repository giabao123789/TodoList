'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { MessageSquarePlus, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { fetchChats, postChatMessage, type ChatDoc } from '@/lib/api';

type Props = {
  initialChatId?: string | null;
};

const easeOut = [0.16, 1, 0.3, 1] as const;

function HistorySkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-[color:var(--border)] bg-[rgba(17,17,24,0.7)] px-3 py-3"
        >
          <div className="loading-skeleton h-4 w-[70%] rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function ChatBox({ initialChatId = null }: Props) {
  const [chats, setChats] = useState<ChatDoc[]>([]);
  const [chatId, setChatId] = useState<string | null>(initialChatId);
  const [messages, setMessages] = useState<
    { role: string; content: string; createdAt?: string }[]
  >([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const refreshChats = async () => {
    setHistoryLoading(true);
    try {
      const list = await fetchChats();
      setChats(list);
      return list;
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const list = await fetchChats();
        if (!cancelled) setChats(list);
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChat = (doc: ChatDoc) => {
    setChatId(doc.id);
    setMessages(doc.messages || []);
  };

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setError(null);
    setInput('');
    setLoading(true);
    const previous = messages;
    setMessages([...messages, { role: 'user', content: text }]);

    try {
      const res = await postChatMessage(text, chatId ?? undefined);
      setChatId(res.chatId);
      setMessages(res.messages);
      await refreshChats();
    } catch (event: unknown) {
      const msg =
        (event as { response?: { data?: { message?: string } } })?.response?.data
          ?.message;
      setError(typeof msg === 'string' ? msg : 'Could not reach assistant.');
      setMessages(previous);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="surface-panel rounded-[30px] p-5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--primary)]" />
          <p className="kicker">History</p>
        </div>

        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            setChatId(null);
            setMessages([]);
          }}
          className="btn-primary mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold"
        >
          <MessageSquarePlus className="h-4 w-4" />
          New chat
        </motion.button>

        <div className="mt-5 max-h-72 overflow-y-auto xl:max-h-[calc(78vh-13rem)]">
          {historyLoading ? (
            <HistorySkeleton />
          ) : chats.length ? (
            <ul className="space-y-2">
              {chats.map((chat) => {
                const active = chatId === chat.id;
                return (
                  <li key={chat.id}>
                    <button
                      type="button"
                      onClick={() => {
                        void (async () => {
                          try {
                            const list = await refreshChats();
                            const doc = list.find((entry) => entry.id === chat.id);
                            if (doc) loadChat(doc);
                          } catch {
                            /* ignore */
                          }
                        })();
                      }}
                      className={`w-full rounded-2xl border px-3 py-3 text-left text-sm font-medium ${
                        active
                          ? 'border-[rgba(91,110,245,0.24)] bg-[rgba(91,110,245,0.12)] text-[var(--foreground)]'
                          : 'border-[color:var(--border)] bg-[rgba(17,17,24,0.7)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
                      }`}
                    >
                      <span className="block truncate">{chat.title || 'New conversation'}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="rounded-2xl border border-dashed border-[color:var(--border)] bg-[rgba(17,17,24,0.58)] px-4 py-5 text-sm leading-6 text-[var(--foreground-muted)]">
              No saved chats yet. Start one when you want planning help or a fast second opinion.
            </p>
          )}
        </div>
      </aside>

      <div className="surface-panel flex min-h-[72vh] min-w-0 flex-col rounded-[30px]">
        <div className="border-b border-[color:var(--border)] px-5 py-4">
          <p className="kicker">Assistant</p>
          <h2 className="mt-2 text-[clamp(1.35rem,1.25rem+0.35vw,1.7rem)]">
            Task guidance on demand
          </h2>
        </div>

        <div className="max-h-[56vh] flex-1 space-y-3 overflow-y-auto px-5 py-5 xl:max-h-[calc(78vh-12rem)]">
          {messages.length === 0 && (
            <div className="flex min-h-full items-center justify-center">
              <div className="max-w-md text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl border border-[rgba(91,110,245,0.22)] bg-[rgba(91,110,245,0.1)]">
                  <Sparkles className="h-5 w-5 text-[var(--primary)]" />
                </div>
                <p className="mt-5 text-[1.1rem] font-semibold text-[var(--foreground)]">
                  Ask for focus, planning, or sequencing help.
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">
                  The assistant is best when you give it real constraints: deadlines,
                  blockers, and what is already in motion.
                </p>
              </div>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <motion.div
                key={`${message.role}-${index}-${message.content.slice(0, 24)}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: easeOut }}
                className={`max-w-[92%] rounded-[24px] px-4 py-3 text-sm leading-7 ${
                  message.role === 'user'
                    ? 'ml-auto border border-[rgba(91,110,245,0.18)] bg-[rgba(91,110,245,0.16)] text-[var(--foreground)]'
                    : 'mr-8 border border-[color:var(--border)] bg-[rgba(24,24,38,0.74)] text-[var(--foreground)]'
                }`}
              >
                {message.content}
              </motion.div>
            ))}
          </AnimatePresence>

          <div ref={bottomRef} />
        </div>

        {error && (
          <p className="px-5 text-sm text-[#f4aaaa]">{error}</p>
        )}

        <div className="border-t border-[color:var(--border)] px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  void send();
                }
              }}
              placeholder="Message the assistant with context..."
              className="field-shell min-w-0 flex-1 rounded-2xl px-4 py-3.5 text-sm"
            />
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              disabled={loading}
              onClick={() => void send()}
              className="btn-primary rounded-2xl px-5 py-3.5 text-sm font-semibold disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send'}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
