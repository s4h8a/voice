import { IndianRupee, QrCode, Wallet } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { DataTable } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';

const payments = [
  { id: 'pay-1', customer: 'Aarav Sharma', amount: '₹999', status: 'link_sent', provider: 'Mock UPI', purpose: 'Course payment' },
  { id: 'pay-2', customer: 'Priya Nair', amount: '₹500', status: 'paid', provider: 'Razorpay', purpose: 'Wallet recharge' },
  { id: 'pay-3', customer: 'Demo Business', amount: '₹1,000', status: 'paid', provider: 'PhonePe', purpose: 'Wallet recharge' }
];

export default function PaymentsPage() {
  return (
    <AppShell title="Payments">
      <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <section className="rounded-md border border-line bg-white p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-brand text-white">
              <Wallet size={19} aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-semibold">Wallet recharge</h2>
              <p className="text-sm text-muted">INR balance through UPI-capable gateways.</p>
            </div>
          </div>
          <div className="mt-5 rounded-md border border-line bg-canvas p-4">
            <p className="text-sm text-muted">Current billing rule</p>
            <p className="mt-1 text-3xl font-semibold">₹1/min</p>
            <p className="mt-2 text-sm text-muted">Admin can change this per organization later.</p>
          </div>
          <form className="mt-5 space-y-4">
            <label className="block">
              <span className="text-sm font-medium">Recharge amount</span>
              <div className="mt-1 flex rounded-md border border-line bg-white">
                <span className="grid w-12 place-items-center border-r border-line text-muted">
                  <IndianRupee size={17} aria-hidden="true" />
                </span>
                <input className="focus-ring w-full rounded-r-md px-3 py-3" defaultValue="1000" />
              </div>
            </label>
            <button className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand px-4 py-3 text-sm font-semibold text-white">
              <QrCode size={17} aria-hidden="true" />
              Create UPI payment link
            </button>
          </form>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold">Payment logs</h2>
          <DataTable
            rows={payments}
            columns={[
              { key: 'customer', label: 'Customer' },
              { key: 'amount', label: 'Amount' },
              { key: 'status', label: 'Status', render: (row) => <StatusBadge value={String(row.status)} /> },
              { key: 'provider', label: 'Provider' },
              { key: 'purpose', label: 'Purpose' }
            ]}
          />
        </section>
      </div>
    </AppShell>
  );
}
