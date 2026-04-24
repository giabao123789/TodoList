'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { loginUser, registerUser } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';

const loginSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(8, 'At least 8 characters'),
});

type LoginValues = z.infer<typeof loginSchema>;

type Props = {
  mode: 'login' | 'register';
};

const easeOut = [0.16, 1, 0.3, 1] as const;

export function AuthForm({ mode }: Props) {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginValues) => {
    setApiError(null);
    try {
      const data =
        mode === 'login'
          ? await loginUser(values)
          : await registerUser(values);
      setAuth(data.access_token, data.user);
      router.replace('/dashboard');
    } catch (event: unknown) {
      const msg =
        (event as { response?: { data?: { message?: string | string[] } } })
          ?.response?.data?.message;
      if (Array.isArray(msg)) setApiError(msg.join(', '));
      else if (typeof msg === 'string') setApiError(msg);
      else setApiError('Something went wrong. Try again.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.26, ease: easeOut }}
      className="surface-panel mx-auto w-full max-w-md rounded-[32px] p-8"
    >
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-[var(--primary)]" />
        <p className="kicker">{mode === 'login' ? 'Sign in' : 'Create account'}</p>
      </div>

      <h1 className="mt-4 text-[clamp(1.85rem,1.7rem+0.6vw,2.3rem)] leading-[1.04]">
        {mode === 'login' ? 'Welcome back.' : 'Start with a cleaner workspace.'}
      </h1>
      <p className="mt-3 text-sm leading-6 text-[var(--foreground-muted)]">
        {mode === 'login'
          ? 'Sign in to pick up where you left off.'
          : 'Create an account to save tasks, AI suggestions, and chat history.'}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <div>
          <label className="text-sm font-medium text-[var(--foreground)]">
            Email
          </label>
          <input
            type="email"
            autoComplete="email"
            placeholder="name@company.com"
            className="field-shell mt-2 w-full rounded-2xl px-4 py-3.5 text-[0.95rem]"
            {...register('email')}
          />
          {errors.email && (
            <p className="mt-2 text-sm text-[#f4aaaa]">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-[var(--foreground)]">
            Password
          </label>
          <input
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            placeholder="Minimum 8 characters"
            className="field-shell mt-2 w-full rounded-2xl px-4 py-3.5 text-[0.95rem]"
            {...register('password')}
          />
          {errors.password && (
            <p className="mt-2 text-sm text-[#f4aaaa]">{errors.password.message}</p>
          )}
        </div>

        {apiError && (
          <p className="rounded-2xl border border-[rgba(248,113,113,0.2)] bg-[rgba(248,113,113,0.1)] px-4 py-3 text-sm text-[#f4aaaa]">
            {apiError}
          </p>
        )}

        <motion.button
          type="submit"
          whileTap={{ scale: 0.97 }}
          disabled={isSubmitting}
          className="btn-primary inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-semibold disabled:opacity-60"
        >
          {isSubmitting ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Create account'}
          {!isSubmitting && <ArrowRight className="h-4 w-4" />}
        </motion.button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--foreground-muted)]">
        {mode === 'login' ? (
          <>
            No account yet?{' '}
            <Link href="/register" className="font-semibold text-[var(--primary)]">
              Register
            </Link>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-[var(--primary)]">
              Log in
            </Link>
          </>
        )}
      </p>
    </motion.div>
  );
}
