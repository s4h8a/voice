import { AppShell } from '@/components/AppShell';
import { DataTable } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';
import { TestCallPanel } from '@/components/TestCallPanel';

const calls = [
  { id: 'call-1', lead: 'Aarav Sharma', phone: '9876543210', status: 'completed', outcome: 'payment_link_sent', duration: '1m 42s', cost: '₹0 first call' },
  { id: 'call-2', lead: 'Priya Nair', phone: '9988776655', status: 'completed', outcome: 'interested_callback', duration: '2m 08s', cost: '₹3' },
  { id: 'call-3', lead: 'Rohan Gupta', phone: '9123456789', status: 'completed', outcome: 'do_not_call', duration: '0m 38s', cost: '₹1' }
];

export default function CallsPage() {
  return (
    <AppShell title="Calls">
      <section className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <TestCallPanel />
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
