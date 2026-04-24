'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { fetchChats, postChatMessage, type ChatDoc } from '@/lib/api';

type Props = {
  initialChatId?: string | null;
};

export function ChatBox({ initialChatId = null }: Props) {
  const [chats, setChats] = useState<ChatDoc[]>([]);
  const [chatId, setChatId] = useState<string | null>(initialChatId);
  const [messages, setMessages] = useState<
    { role: string; content: string; createdAt?: string }[]
  >([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const refreshChats = async () => {
    const list = await fetchChats();
    setChats(list);
    return list;
  };

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const list = await fetchChats();
        if (!cancelled) setChats(list);
      } catch {
        /* ignore */
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
    const prev = messages;
    setMessages([...messages, { role: 'user', content: text }]);
    try {
      const res = await postChatMessage(text, chatId ?? undefined);
      setChatId(res.chatId);
      setMessages(res.messages);
      await refreshChats();
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message;
      setError(typeof msg === 'string' ? msg : 'Could not reach assistant.');
      setMessages(prev);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] flex-col gap-4 lg:flex-row">
      <aside className="w-full shrink-0 rounded-3xl border border-rose-100/90 bg-white/90 p-4 shadow-soft dark:border-rose-900/50 dark:bg-[#231b22]/95 lg:w-56">
        <p className="text-xs font-semibold uppercase tracking-wide text-rose-400">
          History
        </p>
        <button
          type="button"
          onClick={() => {
            setChatId(null);
            setMessages([]);
          }}
          className="mt-3 w-full rounded-2xl bg-gradient-to-r from-pink-400 to-rose-400 py-2 text-xs font-semibold text-white shadow-md"
        >
          New chat
        </button>
        <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto text-sm lg:max-h-[calc(70vh-8rem)]">
          {chats.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => {
                  void (async () => {
                    try {
                      const list = await refreshChats();
                      const doc = list.find((x) => x.id === c.id);
                      if (doc) loadChat(doc);
                    } catch {
                      /* ignore */
                    }
                  })();
                }}
                className={`w-full truncate rounded-xl px-2 py-2 text-left hover:bg-rose-50 dark:hover:bg-rose-950/50 ${
                  chatId === c.id ? 'bg-pink-100/70 dark:bg-pink-950/40' : ''
                }`}
              >
                {c.title || 'Chat'}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col rounded-3xl border border-rose-100/90 bg-white/90 shadow-soft dark:border-rose-900/50 dark:bg-[#231b22]/95">
        <div className="max-h-[50vh] flex-1 space-y-3 overflow-y-auto p-4 sm:max-h-[60vh]">
          {messages.length === 0 && (
            <p className="text-center text-sm text-rose-600 dark:text-rose-300">
              Ask for focus tips, planning help, or how to chunk your work.
            </p>
          )}
          {messages.map((m, i) => (
            <motion.div
              key={`${m.role}-${i}-${m.content.slice(0, 24)}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'ml-auto bg-gradient-to-br from-pink-200/90 to-rose-200/80 text-rose-950 dark:from-pink-900/50 dark:to-rose-900/40 dark:text-rose-50'
                  : 'mr-8 bg-rose-50/90 text-rose-900 dark:bg-[#2a2028] dark:text-rose-100'
              }`}
            >
              {m.content}
            </motion.div>
          ))}
          <div ref={bottomRef} />
        </div>
        {error && (
          <p className="px-4 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        <div className="flex gap-2 border-t border-rose-100/80 p-3 dark:border-rose-900/50">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            placeholder="Message your productivity assistant…"
            className="min-w-0 flex-1 rounded-2xl border border-rose-200/80 bg-[#fff1f2]/60 px-4 py-3 text-sm text-rose-950 outline-none ring-pink-400/30 focus:ring-2 dark:border-rose-800 dark:bg-[#2a2028] dark:text-rose-50"
          />
          <button
            type="button"
            disabled={loading}
            onClick={() => void send()}
            className="rounded-2xl bg-gradient-to-r from-pink-400 to-rose-400 px-5 py-3 text-sm font-semibold text-white shadow-md disabled:opacity-50"
          >
            {loading ? '…' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
