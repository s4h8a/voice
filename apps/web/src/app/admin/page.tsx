import { Ban, IndianRupee, Settings2, Users } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { DataTable } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';

const users = [
  { id: 'u1', org: 'Demo Indian Business', owner: 'owner@example.com', status: 'active', wallet: '₹1,000' },
  { id: 'u2', org: 'Trial Retail', owner: 'retail@example.com', status: 'active', wallet: '₹320' },
  { id: 'u3', org: 'Suspended Test', owner: 'blocked@example.com', status: 'failed', wallet: '₹0' }
];

export default function AdminPage() {
  return (
    <AppShell title="Admin Panel">
      <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <section className="rounded-md border border-line bg-white p-5">
          <div className="flex items-center gap-3">
            <Settings2 size={22} className="text-brand" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Pricing controls</h2>
          </div>
          <form className="mt-5 space-y-4">
            {[
              ['Client price per minute', '1.00'],
              ['Telephony cost per minute', '0.40'],
              ['AI cost per minute', '0.30'],
              ['Platform margin per minute', '0.30']
            ].map(([label, value]) => (
              <label key={label} className="block">
                <span className="text-sm font-medium">{label}</span>
                <div className="mt-1 flex rounded-md border border-line">
                  <span className="grid w-12 place-items-center border-r border-line text-muted">
                    <IndianRupee size={16} aria-hidden="true" />
                  </span>
                  <input className="focus-ring w-full rounded-r-md px-3 py-3" defaultValue={value} />
                </div>
              </label>
            ))}
            <button className="focus-ring w-full rounded-md bg-brand px-4 py-3 text-sm font-semibold text-white">Update pricing</button>
          </form>
        </section>
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Clients</h2>
            <div className="flex gap-2 text-brand">
              <Users size={20} aria-hidden="true" />
              <Ban size={20} aria-hidden="true" />
            </div>
          </div>
          <DataTable
            rows={users}
            columns={[
              { key: 'org', label: 'Organization' },
              { key: 'owner', label: 'Owner' },
              { key: 'status', label: 'Status', render: (row) => <StatusBadge value={String(row.status)} /> },
              { key: 'wallet', label: 'Wallet' }
            ]}
          />
        </section>
      </div>
    </AppShell>
  );
}
