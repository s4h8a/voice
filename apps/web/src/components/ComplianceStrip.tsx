import { ShieldCheck } from 'lucide-react';

export function ComplianceStrip() {
  return (
    <div className="rounded-md border border-line bg-white p-4">
      <div className="flex gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-brand/10 text-brand">
          <ShieldCheck size={19} aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-semibold">Compliance controls enabled</p>
          <p className="mt-1 text-sm leading-6 text-muted">
            Consent confirmation, opt-out handling, call recording disclosure, audit logs, DND-safe mode, and admin suspension are designed into the workflow.
          </p>
        </div>
      </div>
    </div>
  );
}
