import { Save } from 'lucide-react';
import { AppShell } from '@/components/AppShell';

export default function BusinessProfilesPage() {
  return (
    <AppShell
      title="Business Profile"
      action={
        <button className="focus-ring inline-flex items-center gap-2 rounded-md bg-brand px-4 py-3 text-sm font-semibold text-white">
          <Save size={17} aria-hidden="true" />
          Save profile
        </button>
      }
    >
      <form className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <section className="rounded-md border border-line bg-white p-5">
          <h2 className="text-lg font-semibold">Sales context</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {[
              ['Business name', 'Sofron Academy'],
              ['Industry', 'Education'],
              ['Preferred language', 'Hindi + English'],
              ['Human handoff number', '+91 99999 99999']
            ].map(([label, value]) => (
              <label key={label} className="block">
                <span className="text-sm font-medium">{label}</span>
                <input className="focus-ring mt-1 w-full rounded-md border border-line px-3 py-3" defaultValue={value} />
              </label>
            ))}
          </div>
          <label className="mt-4 block">
            <span className="text-sm font-medium">Business description</span>
            <textarea className="focus-ring mt-1 min-h-28 w-full rounded-md border border-line px-3 py-3" defaultValue="Online courses and admission counselling for Indian students." />
          </label>
          <label className="mt-4 block">
            <span className="text-sm font-medium">Products, pricing, offers</span>
            <textarea className="focus-ring mt-1 min-h-36 w-full rounded-md border border-line px-3 py-3" defaultValue={'Full Stack Course - ₹14,999\nJune offer - 20% off\nEMI and UPI accepted'} />
          </label>
        </section>
        <section className="rounded-md border border-line bg-white p-5">
          <h2 className="text-lg font-semibold">Agent behavior</h2>
          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="text-sm font-medium">Tone</span>
              <select className="focus-ring mt-1 w-full rounded-md border border-line px-3 py-3" defaultValue="friendly">
                <option value="professional">Professional</option>
                <option value="friendly">Friendly</option>
                <option value="polite_follow_up">Polite follow-up</option>
                <option value="assertive">Assertive, not pressuring</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium">Business hours</span>
              <input className="focus-ring mt-1 w-full rounded-md border border-line px-3 py-3" defaultValue="10:00-18:30 Asia/Kolkata" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">FAQs</span>
              <textarea className="focus-ring mt-1 min-h-32 w-full rounded-md border border-line px-3 py-3" defaultValue={'Q: Is EMI available?\nA: Yes, EMI and UPI links are available.'} />
            </label>
          </div>
        </section>
      </form>
    </AppShell>
  );
}
