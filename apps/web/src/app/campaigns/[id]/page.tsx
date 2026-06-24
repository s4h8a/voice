import { Download, Pause, Play } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { DataTable } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';

const rows = [
  { id: '1', name: 'Aarav Sharma', phone: '9876543210', attempts: 1, outcome: 'payment_link_sent', notes: 'Asked for UPI link and course details.' },
  { id: '2', name: 'Priya Nair', phone: '9988776655', attempts: 1, outcome: 'interested_callback', notes: 'Callback tomorrow after 5 PM.' },
  { id: '3', name: 'Rohan Gupta', phone: '9123456789', attempts: 1, outcome: 'do_not_call', notes: 'Opted out. Added to suppression list.' }
];

export default function CampaignDetailPage() {
  return (
    <AppShell
      title="Campaign Detail"
      action={
        <div className="flex gap-2">
          <button className="focus-ring rounded-md border border-line bg-white p-3" title="Start">
            <Play size={17} aria-hidden="true" />
          </button>
          <button className="focus-ring rounded-md border border-line bg-white p-3" title="Pause">
            <Pause size={17} aria-hidden="true" />
          </button>
          <button className="focus-ring inline-flex items-center gap-2 rounded-md bg-brand px-4 py-3 text-sm font-semibold text-white">
            <Download size={17} aria-hidden="true" />
            Export Excel
          </button>
        </div>
      }
    >
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ['Status', 'running'],
          ['Leads', '240'],
          ['Answered', '118'],
          ['Collected', '₹68,400']
        ].map(([label, value]) => (
          <div key={label} className="rounded-md border border-line bg-white p-4">
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </div>
      <section className="mt-5">
        <h2 className="mb-3 text-lg font-semibold">Lead outcomes</h2>
        <DataTable
          rows={rows}
          columns={[
            { key: 'name', label: 'Lead' },
            { key: 'phone', label: 'Phone' },
            { key: 'attempts', label: 'Attempts' },
            { key: 'outcome', label: 'Outcome', render: (row) => <StatusBadge value={String(row.outcome)} /> },
            { key: 'notes', label: 'AI notes' }
          ]}
        />
      </section>
    </AppShell>
  );
}
