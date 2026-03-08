'use client';

import { useEffect, useState } from 'react';
import { dashboardAPI } from '@/services/api';

interface FinancialData {
  mrr:                number;
  total_revenue:      number;
  overdue_count:      number;
  overdue_amount:     number;
  active_memberships: number;
  expiring_soon:      number;
  recent_payments:    Array<{
    payment_id:     number;
    full_name:      string;
    amount:         number;
    payment_method: string;
    status:         string;
    paid_at:        string;
  }>;
}

function StatCard({ label, value, sublabel, accent }: {
  label: string; value: string; sublabel?: string; accent?: string;
}) {
  return (
    <div className={`bg-white rounded-xl border p-5 ${accent || 'border-gray-200'}`}>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      {sublabel && <p className="text-xs text-gray-400 mt-1">{sublabel}</p>}
    </div>
  );
}