import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice, InvoiceItem, CompanySettings, TermCondition } from '@/types';
import { formatDate, formatNumberForPDF, roundTo2 } from './utils';
import { amountToWords } from './number-to-words';
import { DEFAULT_SIGNATURE_BASE64 } from './default-signature';

export function generateInvoicePDF(
  invoice: Invoice,
  items: InvoiceItem[],
  settings: CompanySettings,
  terms: TermCondition[]
): jsPDF {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const drawBorder = () => {
    doc.setDrawColor(0);
    doc.setLineWidth(0.3);
    doc.rect(margin, margin, contentWidth, pageHeight - margin * 2);
  };

  // ==========================================
  // 1. HEADER - Company Name & Tax Invoice Title
  // ==========================================
  const companyName = invoice.company_name_snapshot || settings?.company_name || '';
  const companyAddress = invoice.company_address_snapshot || settings?.company_address || '';

  if (companyName) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(companyName, pageWidth / 2, y + 6, { align: 'center' });
    y += 10;
  }

  if (companyAddress) {
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text(companyAddress, pageWidth / 2, y + 2, { align: 'center' });
    y += 6;
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TAX INVOICE', pageWidth / 2, y + 4, { align: 'center' });
  y += 8;

  // Divider line
  doc.setDrawColor(0);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);

  // ==========================================
  // 2. BILLED TO & INVOICE DETAILS GRID
  // ==========================================
  const gridStartY = y;
  const midX = margin + 115;
  const leftX = margin + 3;
  const rightX = midX + 3;

  doc.setFontSize(8.5);

  // Left Column: Customer info
  let leftY = gridStartY + 5;
  doc.setFont('helvetica', 'bold');
  doc.text('Billed To:', leftX, leftY);
  leftY += 4.5;

  doc.text('M/s.:', leftX, leftY);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.customer_name_snapshot || '', leftX + 18, leftY);
  leftY += 4.5;

  doc.setFont('helvetica', 'bold');
  doc.text('Address:', leftX, leftY);
  doc.setFont('helvetica', 'normal');
  const addressLines = doc.splitTextToSize(invoice.customer_address_snapshot || '', 90);
  doc.text(addressLines, leftX + 18, leftY);
  leftY += addressLines.length * 4;

  doc.setFont('helvetica', 'bold');
  doc.text('Place of Supply:', leftX, leftY);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.customer_place_of_supply_snapshot || '', leftX + 28, leftY);
  leftY += 4.5;

  doc.setFont('helvetica', 'bold');
  doc.text('GSTIN No.:', leftX, leftY);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.customer_gstin_snapshot || '-', leftX + 22, leftY);
  leftY += 4.5;

  // Right Column: Invoice details
  let rightY = gridStartY + 5;
  doc.setFont('helvetica', 'bold');
  doc.text('Invoice No.:', rightX, rightY);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.invoice_no || '', rightX + 22, rightY);
  rightY += 4.5;

  doc.setFont('helvetica', 'bold');
  doc.text('Date:', rightX, rightY);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(invoice.invoice_date), rightX + 22, rightY);
  rightY += 4.5;

  doc.setFont('helvetica', 'bold');
  doc.text('P.O. No.:', rightX, rightY);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.po_no || '', rightX + 22, rightY);
  rightY += 4.5;

  doc.setFont('helvetica', 'bold');
  doc.text('P.O. Date:', rightX, rightY);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.po_date ? formatDate(invoice.po_date) : '', rightX + 22, rightY);
  rightY += 4.5;

  // Box divider lines
  y = Math.max(leftY, rightY) + 2;
  doc.line(midX, gridStartY, midX, y); // vertical divider
  doc.line(margin, y, pageWidth - margin, y); // bottom line of billed to

  // ==========================================
  // 3. SHADED STRIP (GSTIN & Bank Details)
  // ==========================================
  const stripHeight = 6.5;
  doc.setFillColor(232, 232, 232);
  doc.rect(margin, y, contentWidth, stripHeight, 'F');
  doc.rect(margin, y, contentWidth, stripHeight, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);

  const companyGstin = invoice.company_gstin_snapshot || settings?.company_gstin || '';
  const bankName = invoice.bank_name_snapshot || settings?.bank_name || '';
  const accNo = invoice.account_number_snapshot || settings?.account_number || '';
  const ifsc = invoice.ifsc_code_snapshot || settings?.ifsc_code || '';
  
  const stripParts: string[] = [];
  if (companyGstin) stripParts.push(`GSTIN No.: ${companyGstin}`);
  if (bankName) stripParts.push(`Bank Name: ${bankName}`);
  if (accNo) stripParts.push(`A/C No.: ${accNo}`);
  if (ifsc) stripParts.push(`IFSC: ${ifsc}`);
  const stripText = stripParts.join(' | ');

  if (stripText) {
    doc.text(stripText, pageWidth / 2, y + 4.5, { align: 'center' });
  }
  y += stripHeight;

  // ==========================================
  // 4. ITEMS TABLE (With Grid & Matching Columns)
  // ==========================================
  const tableData: (string | number)[][] = items.map((item, index) => {
    let productDesc = item.product_name_snapshot || '';
    if (item.description_snapshot) {
      productDesc += '\n' + item.description_snapshot;
    }
    const hasValues = Number(item.qty) > 0 || Number(item.rate) > 0;
    return [
      (index + 1).toString(),
      productDesc,
      item.hsn_sac_snapshot || '',
      hasValues ? item.qty.toString() : '',
      hasValues ? formatNumberForPDF(item.rate) : '',
      hasValues ? `${item.gst_percentage}%` : '',
      hasValues ? formatNumberForPDF(item.taxable_amount) : '',
    ];
  });

  // Pad empty rows to create standard full invoice grid
  while (tableData.length < 6) {
    tableData.push(['', '', '', '', '', '', '']);
  }

  // Calculate GST rate percentages for footer display
  const halfGstRate = roundTo2(invoice.total_gst / 2 / (invoice.subtotal || 1) * 100);
  const fullGstRate = roundTo2(invoice.total_gst / (invoice.subtotal || 1) * 100);

  type FootRow = { content: string; colSpan?: number; styles?: Record<string, string | number> }[];
  const footRows: FootRow[] = [
    [
      { content: 'Sub Total', colSpan: 6, styles: { halign: 'right', fontStyle: 'bold' } },
      { content: formatNumberForPDF(invoice.subtotal), styles: { halign: 'right', fontStyle: 'bold' } },
    ],
  ];

  if (invoice.gst_type === 'cgst_sgst') {
    footRows.push([
      { content: `CGST (${halfGstRate > 0 ? halfGstRate : 9}%)`, colSpan: 6, styles: { halign: 'right', fontStyle: 'bold' } },
      { content: formatNumberForPDF(invoice.cgst), styles: { halign: 'right' } },
    ]);
    footRows.push([
      { content: `SGST (${halfGstRate > 0 ? halfGstRate : 9}%)`, colSpan: 6, styles: { halign: 'right', fontStyle: 'bold' } },
      { content: formatNumberForPDF(invoice.sgst), styles: { halign: 'right' } },
    ]);
  } else {
    footRows.push([
      { content: `IGST (${fullGstRate > 0 ? fullGstRate : 18}%)`, colSpan: 6, styles: { halign: 'right', fontStyle: 'bold' } },
      { content: formatNumberForPDF(invoice.igst), styles: { halign: 'right' } },
    ]);
  }

  footRows.push([
    { content: 'Grand Total', colSpan: 6, styles: { halign: 'right', fontStyle: 'bold', fontSize: 9 } },
    { content: formatNumberForPDF(invoice.grand_total), styles: { halign: 'right', fontStyle: 'bold', fontSize: 9 } },
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Sr. No.', 'Product Name', 'HSN/SAC', 'Qty', 'Rate', 'GST %', 'Amount']],
    body: tableData,
    foot: footRows,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
      textColor: [0, 0, 0],
    },
    headStyles: {
      fillColor: [235, 235, 235],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      halign: 'center',
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
    },
    footStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 14 },
      1: { halign: 'left', cellWidth: 62 },
      2: { halign: 'center', cellWidth: 22 },
      3: { halign: 'center', cellWidth: 16 },
      4: { halign: 'right', cellWidth: 24 },
      5: { halign: 'center', cellWidth: 18 },
      6: { halign: 'right', cellWidth: 34 },
    },
    margin: { left: margin, right: margin },
    didDrawPage: () => {
      drawBorder();
    },
  });

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 3;

  // Check page overflow
  if (y > pageHeight - 65) {
    doc.addPage();
    y = margin + 4;
    drawBorder();
  }

  // ==========================================
  // 5. WORDS & TERMS (LEFT) + SIGNATURE (RIGHT)
  // ==========================================
  const bottomStartY = y;
  const leftBottomWidth = 115;
  const leftXBottom = margin + 3;
  const rightSignX = margin + leftBottomWidth + (contentWidth - leftBottomWidth) / 2;

  // Amount in words
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Total GST in Words:', leftXBottom, y + 3);
  doc.setFont('helvetica', 'normal');
  const gstWords = invoice.gst_in_words || amountToWords(invoice.total_gst);
  doc.text(gstWords, leftXBottom + 35, y + 3);

  doc.setFont('helvetica', 'bold');
  doc.text('Bill Amount in Words:', leftXBottom, y + 8);
  doc.setFont('helvetica', 'normal');
  const amtWords = invoice.amount_in_words || amountToWords(invoice.grand_total);
  doc.text(amtWords, leftXBottom + 35, y + 8);

  y += 14;

  // Terms & Conditions
  doc.setFont('helvetica', 'bold');
  doc.text('Terms & Conditions:', leftXBottom, y);
  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);

  const defaultTerms = [
    '1. Goods once sold will not be taken back.',
    '2. Interest @18% p.a. will be charged if payment is not made within due date.',
    '3. Subject to jurisdiction only.',
  ];

  if (terms && terms.length > 0) {
    terms.forEach((term, i) => {
      doc.text(`${i + 1}. ${term.term_text}`, leftXBottom + 1, y);
      y += 3.8;
    });
  } else {
    defaultTerms.forEach((dt) => {
      doc.text(dt, leftXBottom + 1, y);
      y += 3.8;
    });
  }

  // Right Side: Company Signatory & Signature Image
  let signY = bottomStartY + 3;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  const forCompanyName = invoice.company_name_snapshot || settings?.company_name || 'Authorised Signatory';
  doc.text(`For, ${forCompanyName}`, rightSignX, signY, { align: 'center' });
  signY += 4;

  // Embed Handwritten Signature Image
  const signatureData =
    settings?.signature_url && settings.signature_url.startsWith('data:')
      ? settings.signature_url
      : DEFAULT_SIGNATURE_BASE64;

  try {
    doc.addImage(signatureData, 'PNG', rightSignX - 22, signY, 44, 16);
  } catch (err) {
    console.warn('Failed to draw signature image in PDF:', err);
  }

  signY += 18;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('(Authorised Signatory)', rightSignX, signY, { align: 'center' });

  // Draw final border around the page
  drawBorder();

  return doc;
}
