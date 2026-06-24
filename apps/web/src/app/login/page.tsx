import { LogIn } from 'lucide-react';
import { LoginForm } from '@/components/LoginForm';

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
            <p className="text-sm text-muted">Starter owner: owner@example.com / Start@123456</p>
          </div>
        </div>
        <LoginForm />
      </section>
    </main>
  );
}
