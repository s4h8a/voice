import { CreditCard, ShieldCheck, Wallet } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { DataTable } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';

const rows = [
  { id: 'free-1', item: 'Test call', amount: 'Rs 0', status: 'completed', note: 'Free beta usage' },
  { id: 'free-2', item: 'Campaign call', amount: 'Rs 0', status: 'completed', note: 'No wallet deduction while BILLING_MODE=free' },
];

export default function PaymentsPage() {
  return (
    <AppShell title="Billing">
      <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <section className="rounded-md border border-line bg-white p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-brand text-white">
              <Wallet size={19} aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-semibold">Free beta mode</h2>
              <p className="text-sm text-muted">No payment is required until the product is ready for launch.</p>
            </div>
          </div>
          <div className="mt-5 rounded-md border border-line bg-canvas p-4">
            <p className="text-sm text-muted">Current billing rule</p>
            <p className="mt-1 text-3xl font-semibold">Rs 0/min</p>
            <p className="mt-2 text-sm text-muted">Calls are free while `BILLING_MODE=free`. Wallet billing can be enabled later.</p>
          </div>
          <div className="mt-5 flex gap-3 rounded-md border border-line p-3 text-sm text-muted">
            <ShieldCheck size={18} className="shrink-0 text-brand" aria-hidden="true" />
            <p>Payment links, recharge, and wallet deductions are disabled in beta. Real call provider costs are still charged by Exotel, Twilio, or Plivo directly.</p>
          </div>
        </section>
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Billing events</h2>
            <CreditCard size={20} className="text-brand" aria-hidden="true" />
          </div>
          <DataTable
            rows={rows}
            columns={[
              { key: 'item', label: 'Item' },
              { key: 'amount', label: 'Amount' },
              { key: 'status', label: 'Status', render: (row) => <StatusBadge value={String(row.status)} /> },
              { key: 'note', label: 'Note' },
            ]}
          />
        </section>
      </div>
    </AppShell>
  );
}
