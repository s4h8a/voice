import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  BarChart3,
  Building2,
  CreditCard,
  Headphones,
  LayoutDashboard,
  ListChecks,
  PhoneCall,
  Settings,
  ShieldCheck,
  Upload,
  Wallet
} from 'lucide-react';

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/business-profiles', label: 'Business', icon: Building2 },
  { href: '/leads', label: 'Leads', icon: Upload },
  { href: '/campaigns', label: 'Campaigns', icon: ListChecks },
  { href: '/calls', label: 'Calls', icon: PhoneCall },
  { href: '/payments', label: 'Payments', icon: CreditCard },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/admin', label: 'Admin', icon: ShieldCheck }
];

export function AppShell({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-line bg-white px-4 py-5 lg:block">
        <Link href="/dashboard" className="flex items-center gap-3 rounded-md px-2 py-2">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-brand text-white">
            <Headphones size={22} aria-hidden="true" />
          </span>
          <span>
            <span className="block text-sm font-semibold">AI Sales Calling Agent</span>
            <span className="block text-xs text-muted">India free beta workspace</span>
          </span>
        </Link>
        <nav className="mt-7 space-y-1">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted hover:bg-canvas hover:text-ink"
              >
                <Icon size={18} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-5 left-4 right-4 rounded-md border border-line bg-canvas p-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Wallet size={17} aria-hidden="true" />
            Wallet guard
          </div>
          <p className="mt-1 text-xs leading-5 text-muted">Campaigns pause automatically when balance drops below the configured threshold.</p>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-line bg-canvas/95 px-4 py-4 backdrop-blur lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand">Consent-based calling</p>
              <h1 className="mt-1 text-2xl font-semibold">{title}</h1>
            </div>
            {action}
          </div>
          <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className="flex shrink-0 items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm">
                  <Icon size={16} aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>
        <main className="px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
