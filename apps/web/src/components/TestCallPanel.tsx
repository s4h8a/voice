'use client';

import { useState } from 'react';
import { PhoneCall, ShieldCheck } from 'lucide-react';
import { API_BASE } from '@/lib/api';

export function TestCallPanel() {
  const [name, setName] = useState('Test Customer');
  const [phone, setPhone] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('hi-IN');
  const [consentConfirmed, setConsentConfirmed] = useState(true);
  const [disclosureConfirmed, setDisclosureConfirmed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  async function startCall(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult('');
    setError('');
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('Please sign in first.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/calls/test-call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, phone, preferredLanguage, consentConfirmed: consentConfirmed && disclosureConfirmed }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResult(`Call request created: ${data.callId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Call failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="rounded-md border border-line bg-white p-5" onSubmit={startCall}>
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-md bg-brand text-white">
          <PhoneCall size={19} aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-lg font-semibold">Try one phone call</h2>
          <p className="text-sm text-muted">Authenticated test call console.</p>
        </div>
      </div>
      <div className="mt-5 space-y-4">
        <label className="block">
          <span className="text-sm font-medium">Customer name</span>
          <input className="focus-ring mt-1 w-full rounded-md border border-line px-3 py-3" value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Phone number</span>
          <input className="focus-ring mt-1 w-full rounded-md border border-line px-3 py-3" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="10 digit Indian mobile number" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Language</span>
          <select className="focus-ring mt-1 w-full rounded-md border border-line px-3 py-3" value={preferredLanguage} onChange={(event) => setPreferredLanguage(event.target.value)}>
            <option value="hi-IN">Hindi</option>
            <option value="en-IN">English India</option>
            <option value="ta-IN">Tamil</option>
            <option value="te-IN">Telugu</option>
            <option value="bn-IN">Bengali</option>
          </select>
        </label>
        <label className="flex gap-3 text-sm">
          <input type="checkbox" checked={consentConfirmed} onChange={(event) => setConsentConfirmed(event.target.checked)} className="mt-1" />
          <span>This number has consented to receive this test call.</span>
        </label>
        <label className="flex gap-3 text-sm">
          <input type="checkbox" checked={disclosureConfirmed} onChange={(event) => setDisclosureConfirmed(event.target.checked)} className="mt-1" />
          <span>AI assistant disclosure and recording disclosure are enabled.</span>
        </label>
        {error ? <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p> : null}
        {result ? <p className="rounded-md border border-brand/30 bg-brand/10 px-3 py-2 text-sm text-brand">{result}</p> : null}
        <button disabled={loading} className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">
          <PhoneCall size={17} aria-hidden="true" />
          {loading ? 'Starting...' : 'Start test call'}
        </button>
      </div>
      <div className="mt-4 flex gap-3 rounded-md border border-line bg-canvas p-3 text-sm text-muted">
        <ShieldCheck size={18} className="shrink-0 text-brand" aria-hidden="true" />
        <p>First completed call is free. Later calls use wallet balance at the configured INR per-minute price.</p>
      </div>
    </form>
  );
}
