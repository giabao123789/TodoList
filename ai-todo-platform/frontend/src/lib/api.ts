import axios from 'axios';
import { useAuthStore } from '@/store/auth-store';

const baseURL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ||
  'http://localhost:4000';

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export type TodoPriority = 'low' | 'medium' | 'high';

export type Todo = {
  id: string;
  title: string;
  completed: boolean;
  priority: TodoPriority;
  deadline: string | null;
  order: number;
  createdAt?: string;
  updatedAt?: string;
};

export type TodosPage = {
  items: Todo[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export async function registerUser(body: { email: string; password: string }) {
  const { data } = await api.post<{
    access_token: string;
    user: { id: string; email: string };
  }>('/auth/register', body);
  return data;
}

export async function loginUser(body: { email: string; password: string }) {
  const { data } = await api.post<{
    access_token: string;
    user: { id: string; email: string };
  }>('/auth/login', body);
  return data;
}

export async function fetchMe() {
  const { data } = await api.get<{ id: string; email: string }>('/auth/me');
  return data;
}

export async function fetchTodos(params: {
  page?: number;
  limit?: number;
  search?: string;
  filter?: 'all' | 'completed' | 'pending';
}) {
  const { data } = await api.get<TodosPage>('/todos', { params });
  return data;
}

export async function createTodo(body: Partial<Todo> & { title: string }) {
  const { data } = await api.post<Todo>('/todos', body);
  return data;
}

export async function updateTodo(
  id: string,
  body: Partial<Pick<Todo, 'title' | 'completed' | 'priority' | 'deadline' | 'order'>>,
) {
  const { data } = await api.patch<Todo>(`/todos/${id}`, body);
  return data;
}

export async function deleteTodo(id: string) {
  await api.delete(`/todos/${id}`);
}

export async function reorderTodos(orderedIds: string[]) {
  await api.patch('/todos/reorder', { orderedIds });
}

export async function generateTodos(goal: string) {
  const { data } = await api.post<{
    todos: { title: string; day?: number; priority?: TodoPriority }[];
  }>('/ai/generate-todos', { goal });
  return data;
}

export async function suggestNextTask(title: string, context?: string) {
  const { data } = await api.post<{ suggestion: string; reason?: string }>(
    '/ai/suggest',
    { title, context },
  );
  return data;
}

export async function classifyPriority(title: string) {
  const { data } = await api.post<{
    priority: TodoPriority;
    rationale?: string;
  }>('/ai/priority', { title });
  return data;
}

export async function suggestDeadline(title: string, existingDeadline?: string) {
  const { data } = await api.post<{ deadline: string; confidence?: string }>(
    '/ai/deadline',
    { title, existingDeadline },
  );
  return data;
}

export type ChatDoc = {
  id: string;
  title?: string;
  messages: { role: string; content: string; createdAt?: string }[];
  updatedAt?: string;
};

export async function fetchChats() {
  const { data } = await api.get<ChatDoc[]>('/chats');
  return data;
}

export async function postChatMessage(message: string, chatId?: string) {
  const { data } = await api.post<{
    chatId: string;
    reply: string;
    messages: { role: string; content: string; createdAt?: string }[];
  }>('/chats', { message, chatId });
  return data;
}
