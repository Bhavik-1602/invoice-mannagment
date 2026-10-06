/**
 * Format a number as Indian Rupee currency
 * Example: 1463200 → ₹14,63,200.00
 */
export function formatCurrency(amount: number, includeSymbol: boolean = true): string {
  const fixed = Number(amount).toFixed(2);
  const [intPart, decPart] = fixed.split('.');
  
  // Indian number system: last 3 digits, then groups of 2
  const lastThree = intPart.slice(-3);
  const otherDigits = intPart.slice(0, -3);
  
  let formatted = lastThree;
  if (otherDigits.length > 0) {
    formatted = otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  }
  
  // Handle negative numbers
  if (formatted.startsWith('-,')) {
    formatted = '-' + formatted.slice(2);
  }
  
  const formattedNumber = `${formatted}.${decPart}`;
  return includeSymbol ? `₹${formattedNumber}` : formattedNumber;
}

export function formatNumberForPDF(amount: number): string {
  if (amount === 0 || isNaN(amount)) return '0.00';
  return formatCurrency(amount, false);
}

/**
 * Round to 2 decimal places safely
 */
export function roundTo2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Parse a numeric value safely
 */
export function parseNumeric(value: string | number): number {
  if (typeof value === 'number') return value;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format date as DD/MM/YYYY
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Get today's date as YYYY-MM-DD for input fields
 */
export function getTodayISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generate a CSS class string from conditional classes
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
