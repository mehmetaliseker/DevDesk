'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ApiError, authApi } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authApi.register({ name, email, password });
      router.replace('/login');
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-950">Create your DevDesk account</h1>
          <p className="mt-1 text-sm text-slate-500">New accounts start with the Customer role.</p>
        </div>

        <Card>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Name"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              minLength={2}
            />
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
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
            />
            {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
          <p className="mt-5 text-center text-sm text-slate-500">
            Already registered?{' '}
            <Link href="/login" className="font-medium text-indigo-700 hover:text-indigo-900">
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </main>
  );
}
