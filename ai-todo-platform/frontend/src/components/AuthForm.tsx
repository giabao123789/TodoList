'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import Link from 'next/link';
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

export function AuthForm({ mode }: Props) {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
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
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string | string[] } } })?.response
          ?.data?.message;
      if (Array.isArray(msg)) setApiError(msg.join(', '));
      else if (typeof msg === 'string') setApiError(msg);
      else setApiError('Something went wrong. Try again.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-md rounded-3xl border border-rose-100/90 bg-white/90 p-8 shadow-soft dark:border-rose-900/50 dark:bg-[#231b22]/95"
    >
      <h1 className="text-2xl font-semibold text-rose-950 dark:text-rose-50">
        {mode === 'login' ? 'Welcome back' : 'Create account'}
      </h1>
      <p className="mt-1 text-sm text-rose-600/90 dark:text-rose-300/90">
        {mode === 'login'
          ? 'Sign in to sync your blush-pink todos.'
          : 'Start organizing with AI in minutes.'}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <div>
          <label className="text-sm font-medium text-rose-800 dark:text-rose-200">
            Email
          </label>
          <input
            type="email"
            autoComplete="email"
            className="mt-1 w-full rounded-2xl border border-rose-200/80 bg-[#fff1f2]/50 px-4 py-3 text-rose-950 outline-none ring-pink-400/40 transition focus:ring-2 dark:border-rose-800 dark:bg-[#2a2028] dark:text-rose-50"
            {...register('email')}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium text-rose-800 dark:text-rose-200">
            Password
          </label>
          <input
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            className="mt-1 w-full rounded-2xl border border-rose-200/80 bg-[#fff1f2]/50 px-4 py-3 text-rose-950 outline-none ring-pink-400/40 transition focus:ring-2 dark:border-rose-800 dark:bg-[#2a2028] dark:text-rose-50"
            {...register('password')}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>
        {apiError && (
          <p className="rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200">
            {apiError}
          </p>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-gradient-to-r from-pink-400 to-rose-400 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-pink-300/35 transition hover:brightness-105 disabled:opacity-60 dark:shadow-none"
        >
          {isSubmitting ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Sign up'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-rose-700 dark:text-rose-300">
        {mode === 'login' ? (
          <>
            No account?{' '}
            <Link href="/register" className="font-semibold text-pink-600 underline">
              Register
            </Link>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-pink-600 underline">
              Log in
            </Link>
          </>
        )}
      </p>
    </motion.div>
  );
}
