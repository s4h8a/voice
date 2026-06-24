import Link from 'next/link';
import { ArrowRight, Headphones, ShieldCheck, Wallet } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-canvas px-4 py-6 text-ink">
      <section className="mx-auto grid min-h-[calc(100vh-48px)] max-w-6xl content-center gap-8 lg:grid-cols-[1fr_420px] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold text-brand">
            <Headphones size={17} aria-hidden="true" />
            AI Sales Calling Agent
          </div>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight md:text-5xl">Consent-based AI sales calling for Indian businesses</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted">
            Run free-beta campaigns with uploaded leads, business-specific scripts, live telephony providers, call records, transcripts, and Excel exports.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/login" className="focus-ring inline-flex items-center gap-2 rounded-md bg-brand px-4 py-3 text-sm font-semibold text-white">
              Open workspace
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link href="/dashboard" className="focus-ring inline-flex items-center gap-2 rounded-md border border-line bg-white px-4 py-3 text-sm font-semibold">
              View dashboard
            </Link>
          </div>
        </div>
        <div className="rounded-md border border-line bg-white p-5 shadow-soft">
          <div className="grid gap-3">
            {[
              { icon: Wallet, title: 'Free beta', body: 'Calls are billed at Rs 0/min until wallet billing is enabled for launch.' },
              { icon: ShieldCheck, title: 'Consent controls', body: 'Consent, disclosure, opt-out handling, and audit controls are part of the workflow.' },
              { icon: Headphones, title: 'Real telephony ready', body: 'Set Exotel, Twilio, or Plivo credentials to place live phone calls.' }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-md border border-line p-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-md bg-canvas text-brand">
                      <Icon size={18} aria-hidden="true" />
                    </span>
                    <p className="font-semibold">{item.title}</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted">{item.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
