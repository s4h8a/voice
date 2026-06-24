'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const data = [
  { day: 'Mon', calls: 42, payments: 9 },
  { day: 'Tue', calls: 58, payments: 12 },
  { day: 'Wed', calls: 76, payments: 18 },
  { day: 'Thu', calls: 64, payments: 13 },
  { day: 'Fri', calls: 88, payments: 24 },
  { day: 'Sat', calls: 51, payments: 11 }
];

export function RevenueChart() {
  return (
    <div className="h-72 rounded-md border border-line bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">Calling and payment trend</p>
          <p className="text-xs text-muted">Demo campaign activity</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="82%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d9e2dc" />
          <XAxis dataKey="day" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip />
          <Bar dataKey="calls" fill="#176f55" radius={[4, 4, 0, 0]} />
          <Bar dataKey="payments" fill="#c25a32" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
