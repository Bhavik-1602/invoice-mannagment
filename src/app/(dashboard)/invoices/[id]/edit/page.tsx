'use client';

import InvoiceForm from '@/components/invoices/InvoiceForm';
import { use } from 'react';

export default function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <InvoiceForm mode="edit" invoiceId={id} />;
}
