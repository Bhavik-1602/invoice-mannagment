import { roundTo2, parseNumeric } from './utils';
import { InvoiceItemFormData } from '@/types';

/**
 * Calculate the taxable amount for a single item
 */
export function calculateItemAmount(qty: number | string, rate: number | string): number {
  const q = parseNumeric(qty);
  const r = parseNumeric(rate);
  return roundTo2(q * r);
}

/**
 * Calculate GST amount for a single item
 */
export function calculateItemGST(taxableAmount: number, gstPercentage: number | string): number {
  const gst = parseNumeric(gstPercentage);
  return roundTo2(taxableAmount * (gst / 100));
}

/**
 * Calculate all invoice totals from items
 */
export function calculateInvoiceTotals(
  items: InvoiceItemFormData[],
  gstType: 'cgst_sgst' | 'igst'
) {
  let subtotal = 0;
  let totalGst = 0;

  const calculatedItems = items.map((item) => {
    const qty = parseNumeric(item.qty);
    const rate = parseNumeric(item.rate);
    const gstPercentage = parseNumeric(item.gst_percentage);

    const taxableAmount = roundTo2(qty * rate);
    const gstAmount = roundTo2(taxableAmount * (gstPercentage / 100));

    subtotal = roundTo2(subtotal + taxableAmount);
    totalGst = roundTo2(totalGst + gstAmount);

    return {
      ...item,
      taxable_amount: taxableAmount,
      gst_amount: gstAmount,
    };
  });

  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (gstType === 'cgst_sgst') {
    cgst = roundTo2(totalGst / 2);
    sgst = roundTo2(totalGst / 2);
    igst = 0;
  } else {
    igst = totalGst;
    cgst = 0;
    sgst = 0;
  }

  const grandTotal = roundTo2(subtotal + totalGst);

  return {
    items: calculatedItems,
    subtotal,
    cgst,
    sgst,
    igst,
    totalGst,
    grandTotal,
  };
}
