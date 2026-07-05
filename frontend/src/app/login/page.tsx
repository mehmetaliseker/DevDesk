'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LifeBuoy } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ApiError, authApi } from '@/lib/api';
import { setSession } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@devdesk.local');
  const [password, setPassword] = useState('Admin12345');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const auth = await authApi.login({ email, password });
      setSession(auth);
      router.replace('/dashboard');
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Login failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-md bg-indigo-600 text-white">
            <LifeBuoy className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold text-slate-950">DevDesk</h1>
            <p className="text-sm text-slate-500">Support ticket workspace</p>
          </div>
        </div>

        <Card>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <Input
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
            />
            {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
          <p className="mt-5 text-center text-sm text-slate-500">
            Need an account?{' '}
            <Link href="/register" className="font-medium text-indigo-700 hover:text-indigo-900">
              Register
            </Link>
          </p>
        </Card>
      </div>
    </main>
  );
}
