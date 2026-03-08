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