import { clsx } from 'clsx';

const styles: Record<string, string> = {
  running: 'border-brand/30 bg-brand/10 text-brand',
  completed: 'border-brand/30 bg-brand/10 text-brand',
  paid: 'border-brand/30 bg-brand/10 text-brand',
  paused: 'border-warn/30 bg-warn/10 text-warn',
  scheduled: 'border-warn/30 bg-warn/10 text-warn',
  failed: 'border-danger/30 bg-danger/10 text-danger',
  do_not_call: 'border-danger/30 bg-danger/10 text-danger',
  draft: 'border-line bg-canvas text-muted',
  new: 'border-line bg-canvas text-muted'
};

export function StatusBadge({ value }: { value: string }) {
  return (
    <span className={clsx('inline-flex rounded-md border px-2 py-1 text-xs font-semibold', styles[value] || styles.new)}>
      {value.replaceAll('_', ' ')}
    </span>
  );
}
