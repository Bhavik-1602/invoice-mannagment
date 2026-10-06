/**
 * Convert a number to Indian currency words
 * Example: 1463200 → "Fourteen Lakh Sixty Three Thousand Two Hundred"
 */

const ones = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen',
];

const tens = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety',
];

function convertTwoDigit(n: number): string {
  if (n < 20) return ones[n];
  const t = Math.floor(n / 10);
  const o = n % 10;
  return tens[t] + (o ? ' ' + ones[o] : '');
}

function convertThreeDigit(n: number): string {
  if (n === 0) return '';
  const h = Math.floor(n / 100);
  const remainder = n % 100;
  let result = '';
  if (h > 0) {
    result = ones[h] + ' Hundred';
    if (remainder > 0) result += ' ';
  }
  if (remainder > 0) {
    result += convertTwoDigit(remainder);
  }
  return result;
}

export function numberToIndianWords(amount: number): string {
  if (amount === 0) return 'Zero';

  const isNegative = amount < 0;
  amount = Math.abs(amount);

  // Separate integer and decimal parts
  const intPart = Math.floor(amount);
  const decPart = Math.round((amount - intPart) * 100);

  if (intPart === 0 && decPart === 0) return 'Zero';

  let words = '';

  if (intPart > 0) {
    // Indian number system: ones, thousands, lakhs, crores
    const crore = Math.floor(intPart / 10000000);
    const lakh = Math.floor((intPart % 10000000) / 100000);
    const thousand = Math.floor((intPart % 100000) / 1000);
    const hundred = intPart % 1000;

    const parts: string[] = [];

    if (crore > 0) {
      parts.push(convertTwoDigit(crore) + ' Crore');
    }
    if (lakh > 0) {
      parts.push(convertTwoDigit(lakh) + ' Lakh');
    }
    if (thousand > 0) {
      parts.push(convertTwoDigit(thousand) + ' Thousand');
    }
    if (hundred > 0) {
      parts.push(convertThreeDigit(hundred));
    }

    words = parts.join(' ');
  }

  if (decPart > 0) {
    const paiseWords = convertTwoDigit(decPart);
    if (words) {
      words += ' and ' + paiseWords + ' Paise';
    } else {
      words = paiseWords + ' Paise';
    }
  }

  if (isNegative) {
    words = 'Minus ' + words;
  }

  return words;
}

/**
 * Convert amount to full Indian currency words string
 * Example: 1463200 → "Rupees Fourteen Lakh Sixty Three Thousand Two Hundred Only"
 */
export function amountToWords(amount: number): string {
  if (amount === 0) return 'Rupees Zero Only';
  const words = numberToIndianWords(amount);
  
  // Check if there are paise
  if (words.includes('Paise')) {
    return 'Rupees ' + words;
  }
  return 'Rupees ' + words + ' Only';
}
