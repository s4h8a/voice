import { KeyRound, Save, ShieldCheck } from 'lucide-react';
import { AppShell } from '@/components/AppShell';

export default function SettingsPage() {
  return (
    <AppShell
      title="Settings"
      action={
        <button className="focus-ring inline-flex items-center gap-2 rounded-md bg-brand px-4 py-3 text-sm font-semibold text-white">
          <Save size={17} aria-hidden="true" />
          Save settings
        </button>
      }
    >
      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-md border border-line bg-white p-5">
          <div className="flex items-center gap-3">
            <KeyRound size={22} className="text-brand" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Private provider config</h2>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {['Telephony provider', 'LLM provider', 'Payment provider', 'Messaging provider'].map((label) => (
              <label key={label} className="block">
                <span className="text-sm font-medium">{label}</span>
                <select className="focus-ring mt-1 w-full rounded-md border border-line px-3 py-3">
                  <option>Live provider</option>
                  <option>Production credential</option>
                </select>
              </label>
            ))}
          </div>
          <p className="mt-4 text-sm leading-6 text-muted">Credentials are stored encrypted on the backend and are never exposed to customer browsers.</p>
        </section>
        <section className="rounded-md border border-line bg-white p-5">
          <div className="flex items-center gap-3">
            <ShieldCheck size={22} className="text-brand" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Compliance defaults</h2>
          </div>
          <div className="mt-5 space-y-3 text-sm">
            {[
              'Require lead consent before import',
              'Block opt-out and DND-safe numbers',
              'Play AI assistant disclosure',
              'Enable recording disclosure',
              'Write audit logs for admin and billing actions'
            ].map((item) => (
              <label key={item} className="flex gap-3">
                <input type="checkbox" defaultChecked className="mt-1" />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
