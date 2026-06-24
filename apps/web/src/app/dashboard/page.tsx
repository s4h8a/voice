import { CreditCard, IndianRupee, Percent, PhoneCall, Wallet } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { ComplianceStrip } from '@/components/ComplianceStrip';
import { DataTable } from '@/components/DataTable';
import { RevenueChart } from '@/components/RevenueChart';
import { StatCard } from '@/components/StatCard';
import { StatusBadge } from '@/components/StatusBadge';

const campaigns = [
  { id: 'c1', name: 'Admissions June follow-up', status: 'running', leads: 240, conversion: '14.8%', collected: '₹68,400' },
  { id: 'c2', name: 'Real estate site visit', status: 'scheduled', leads: 180, conversion: '0%', collected: '₹0' },
  { id: 'c3', name: 'Boutique repeat buyers', status: 'completed', leads: 96, conversion: '21.3%', collected: '₹42,100' }
];

export default function DashboardPage() {
  return (
    <AppShell title="Dashboard">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Wallet} label="Billing mode" value="Free beta" hint="No wallet deduction while BILLING_MODE=free." />
        <StatCard icon={PhoneCall} label="Call minutes" value="318" hint="Usage includes live provider-reported durations." />
        <StatCard icon={Percent} label="Conversion rate" value="16.2%" hint="Calculated from converted and payment-completed outcomes." />
        <StatCard icon={IndianRupee} label="Call price" value="Rs 0/min" hint="Payment collection is off until launch." />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_360px]">
        <RevenueChart />
        <ComplianceStrip />
      </div>
      <section className="mt-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Active campaigns</h2>
          <CreditCard size={20} className="text-brand" aria-hidden="true" />
        </div>
        <DataTable
          rows={campaigns}
          columns={[
            { key: 'name', label: 'Campaign' },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge value={String(row.status)} /> },
            { key: 'leads', label: 'Leads' },
            { key: 'conversion', label: 'Conversion' },
            { key: 'collected', label: 'Collected' }
          ]}
        />
      </section>
    </AppShell>
  );
}
