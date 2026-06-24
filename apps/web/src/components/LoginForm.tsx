'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn } from 'lucide-react';
import { API_BASE } from '@/lib/api';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('owner@example.com');
  const [password, setPassword] = useState('Demo@123456');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="mt-6 space-y-4" onSubmit={submit}>
      <label className="block">
        <span className="text-sm font-medium">Email</span>
        <input className="focus-ring mt-1 w-full rounded-md border border-line px-3 py-3" value={email} onChange={(event) => setEmail(event.target.value)} />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Password</span>
        <input className="focus-ring mt-1 w-full rounded-md border border-line px-3 py-3" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
      </label>
      {error ? <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p> : null}
      <button disabled={loading} className="focus-ring flex w-full items-center justify-center gap-2 rounded-md bg-brand px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">
        <LogIn size={17} aria-hidden="true" />
        {loading ? 'Signing in...' : 'Continue'}
      </button>
    </form>
  );
}
