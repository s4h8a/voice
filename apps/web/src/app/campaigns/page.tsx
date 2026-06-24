import Link from 'next/link';
import { Pause, Play, Plus } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { DataTable } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';

const campaigns = [
  { id: 'campaign-1', name: 'Admissions June follow-up', profile: 'Sofron Academy', status: 'running', attempts: '2 max', language: 'hi-IN', payment: 'Free beta' },
  { id: 'campaign-2', name: 'Consultation callback list', profile: 'Retail starter', status: 'draft', attempts: '1 max', language: 'en-IN', payment: 'Free beta' }
];

export default function CampaignsPage() {
  return (
    <AppShell
      title="Campaign Manager"
      action={
        <button className="focus-ring inline-flex items-center gap-2 rounded-md bg-brand px-4 py-3 text-sm font-semibold text-white">
          <Plus size={17} aria-hidden="true" />
          New campaign
        </button>
      }
    >
      <section className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <form className="rounded-md border border-line bg-white p-5">
          <h2 className="text-lg font-semibold">Builder</h2>
          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="text-sm font-medium">Campaign name</span>
              <input className="focus-ring mt-1 w-full rounded-md border border-line px-3 py-3" defaultValue="Admissions June follow-up" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Objective</span>
              <textarea className="focus-ring mt-1 min-h-24 w-full rounded-md border border-line px-3 py-3" defaultValue="Call consented leads, explain the offer, answer objections, detect interest, and schedule callback or human handoff." />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm font-medium">Max attempts</span>
                <input className="focus-ring mt-1 w-full rounded-md border border-line px-3 py-3" defaultValue="2" />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Retry delay</span>
                <input className="focus-ring mt-1 w-full rounded-md border border-line px-3 py-3" defaultValue="120 min" />
              </label>
            </div>
            <label className="flex gap-3 text-sm">
              <input type="checkbox" defaultChecked className="mt-1" />
              <span>I confirm these campaign leads have consented to be contacted.</span>
            </label>
            <label className="flex gap-3 text-sm">
              <input type="checkbox" defaultChecked className="mt-1" />
              <span>Respect customer opt-out immediately.</span>
            </label>
          </div>
        </form>
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Campaigns</h2>
            <div className="flex gap-2">
              <button className="focus-ring rounded-md border border-line bg-white p-2" title="Start">
                <Play size={17} aria-hidden="true" />
              </button>
              <button className="focus-ring rounded-md border border-line bg-white p-2" title="Pause">
                <Pause size={17} aria-hidden="true" />
              </button>
            </div>
          </div>
          <DataTable
            rows={campaigns}
            columns={[
              { key: 'name', label: 'Campaign', render: (row) => <Link className="font-semibold text-brand" href={`/campaigns/${row.id}`}>{String(row.name)}</Link> },
              { key: 'profile', label: 'Profile' },
              { key: 'status', label: 'Status', render: (row) => <StatusBadge value={String(row.status)} /> },
              { key: 'attempts', label: 'Attempts' },
              { key: 'language', label: 'Language' },
              { key: 'payment', label: 'Payment' }
            ]}
          />
        </div>
      </section>
    </AppShell>
  );
}
