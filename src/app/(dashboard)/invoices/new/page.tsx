'use client';

import InvoiceForm from '@/components/invoices/InvoiceForm';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function NewInvoiceContent() {
  const searchParams = useSearchParams();
  const duplicateFrom = searchParams.get('duplicate') || undefined;
  
  return <InvoiceForm mode="create" duplicateFrom={duplicateFrom} />;
}

export default function NewInvoicePage() {
  return (
    <Suspense fallback={<div className="loading-page"><div className="spinner spinner-lg"></div></div>}>
      <NewInvoiceContent />
    </Suspense>
  );
}
