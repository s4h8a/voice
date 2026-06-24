import { UploadCloud } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { DataTable } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';

const rows = [
  { id: '1', name: 'Aarav Sharma', phone: '9876543210', city: 'Delhi', consent: 'consented', interest: 'Full Stack Course' },
  { id: '2', name: 'Priya Nair', phone: '9988776655', city: 'Bengaluru', consent: 'consented', interest: 'Admissions counselling' },
  { id: '3', name: 'Invalid row', phone: '12345', city: 'Mumbai', consent: 'missing_consent', interest: 'Course consultation' }
];

export default function LeadsPage() {
  return (
    <AppShell title="Lead Upload">
      <section className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <div className="rounded-md border border-line bg-white p-5">
          <div className="grid place-items-center rounded-md border border-dashed border-line bg-canvas px-4 py-10 text-center">
            <UploadCloud size={36} className="text-brand" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-semibold">Upload Excel or CSV</h2>
            <p className="mt-2 text-sm leading-6 text-muted">Required columns: name, phone, email, city, product_interest, budget, notes, consent_status, preferred_language.</p>
            <button className="focus-ring mt-5 rounded-md bg-brand px-4 py-3 text-sm font-semibold text-white">Select file</button>
          </div>
          <div className="mt-4 space-y-3 text-sm">
            <label className="flex gap-3">
              <input type="checkbox" defaultChecked className="mt-1" />
              <span>I confirm these leads have consented to be contacted.</span>
            </label>
            <label className="flex gap-3">
              <input type="checkbox" defaultChecked className="mt-1" />
              <span>Do not call numbers marked DND or opt-out.</span>
            </label>
          </div>
        </div>
        <div>
          <h2 className="mb-3 text-lg font-semibold">Preview and validation</h2>
          <DataTable
            rows={rows}
            columns={[
              { key: 'name', label: 'Name' },
              { key: 'phone', label: 'Phone' },
              { key: 'city', label: 'City' },
              { key: 'consent', label: 'Consent', render: (row) => <StatusBadge value={row.consent === 'consented' ? 'completed' : 'failed'} /> },
              { key: 'interest', label: 'Interest' }
            ]}
          />
        </div>
      </section>
    </AppShell>
  );
}
