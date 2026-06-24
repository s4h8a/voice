import { PhoneCall, ShieldCheck } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { DataTable } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';

const calls = [
  { id: 'call-1', lead: 'Aarav Sharma', phone: '9876543210', status: 'completed', outcome: 'payment_link_sent', duration: '1m 42s', cost: '₹0 first call' },
  { id: 'call-2', lead: 'Priya Nair', phone: '9988776655', status: 'completed', outcome: 'interested_callback', duration: '2m 08s', cost: '₹3' },
  { id: 'call-3', lead: 'Rohan Gupta', phone: '9123456789', status: 'completed', outcome: 'do_not_call', duration: '0m 38s', cost: '₹1' }
];

export default function CallsPage() {
  return (
    <AppShell title="Calls">
      <section className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <form className="rounded-md border border-line bg-white p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-brand text-white">
              <PhoneCall size={19} aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-semibold">Try one phone call</h2>
              <p className="text-sm text-muted">Authenticated test call using the private backend.</p>
            </div>
          </div>
          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="text-sm font-medium">Customer name</span>
              <input className="focus-ring mt-1 w-full rounded-md border border-line px-3 py-3" defaultValue="Test Customer" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Phone number</span>
              <input className="focus-ring mt-1 w-full rounded-md border border-line px-3 py-3" placeholder="10 digit Indian mobile number" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Language</span>
              <select className="focus-ring mt-1 w-full rounded-md border border-line px-3 py-3" defaultValue="hi-IN">
                <option value="hi-IN">Hindi</option>
                <option value="en-IN">English India</option>
                <option value="ta-IN">Tamil</option>
                <option value="te-IN">Telugu</option>
                <option value="bn-IN">Bengali</option>
              </select>
            </label>
            <label className="flex gap-3 text-sm">
              <input type="checkbox" defaultChecked className="mt-1" />
              <span>This number has consented to receive this test call.</span>
            </label>
            <label className="flex gap-3 text-sm">
              <input type="checkbox" defaultChecked className="mt-1" />
              <span>AI assistant disclosure and recording disclosure are enabled.</span>
            </label>
            <button className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand px-4 py-3 text-sm font-semibold text-white">
              <PhoneCall size={17} aria-hidden="true" />
              Start test call
            </button>
          </div>
          <div className="mt-4 flex gap-3 rounded-md border border-line bg-canvas p-3 text-sm text-muted">
            <ShieldCheck size={18} className="shrink-0 text-brand" aria-hidden="true" />
            <p>First completed call is free. Later calls use wallet balance at the configured INR per-minute price.</p>
          </div>
        </form>
        <div>
          <h2 className="mb-3 text-lg font-semibold">Recent call logs</h2>
          <DataTable
            rows={calls}
            columns={[
              { key: 'lead', label: 'Lead' },
              { key: 'phone', label: 'Phone' },
              { key: 'status', label: 'Status', render: (row) => <StatusBadge value={String(row.status)} /> },
              { key: 'outcome', label: 'Outcome', render: (row) => <StatusBadge value={String(row.outcome)} /> },
              { key: 'duration', label: 'Duration' },
              { key: 'cost', label: 'Cost' }
            ]}
          />
        </div>
      </section>
    </AppShell>
  );
}
