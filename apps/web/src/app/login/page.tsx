import Link from 'next/link';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-canvas px-4 py-8 text-ink">
      <section className="w-full max-w-md rounded-md border border-line bg-white p-6 shadow-soft">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-brand text-white">
            <LogIn size={20} aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-xl font-semibold">Sign in</h1>
            <p className="text-sm text-muted">Demo owner: owner@example.com / Demo@123456</p>
          </div>
        </div>
        <form className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Email</span>
            <input className="focus-ring mt-1 w-full rounded-md border border-line px-3 py-3" defaultValue="owner@example.com" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Password</span>
            <input className="focus-ring mt-1 w-full rounded-md border border-line px-3 py-3" type="password" defaultValue="Demo@123456" />
          </label>
          <Link href="/dashboard" className="focus-ring flex w-full items-center justify-center rounded-md bg-brand px-4 py-3 text-sm font-semibold text-white">
            Continue
          </Link>
        </form>
      </section>
    </main>
  );
}
