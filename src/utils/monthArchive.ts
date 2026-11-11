/**
 * Utility functions for appointment date parsing, month key generation,
 * and monthly archiving.
 */

export const MONTH_NAMES_PT_BR = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export interface MonthOption {
  key: string; // "YYYY-MM", e.g. "2026-11"
  label: string; // "Novembro de 2026"
  year: number;
  month: number; // 0-indexed
  isCurrent: boolean;
  isPast: boolean;
  count: number;
}

/**
 * Parses appointment date strings such as "Hoje", "Amanhã", "15/11/2026", "2026-11-15"
 */
export function parseAppointmentDate(dateStr: string): Date {
  const now = new Date();
  if (!dateStr) return now;

  const normalized = dateStr.trim().toLowerCase();

  if (normalized === 'hoje') {
    return now;
  }

  if (normalized === 'amanhã' || normalized === 'amanha') {
    const tmr = new Date(now);
    tmr.setDate(tmr.getDate() + 1);
    return tmr;
  }

  // DD/MM/YYYY
  if (normalized.includes('/')) {
    const parts = normalized.split('/');
    if (parts.length === 3) {
      const d = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const y = parseInt(parts[2], 10);
      if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
        return new Date(y, m, d);
      }
    }
  }

  // YYYY-MM-DD
  if (normalized.includes('-')) {
    const parts = normalized.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
        return new Date(y, m, d);
      }
    }
  }

  return now;
}

/**
 * Returns "YYYY-MM" key for an appointment's date.
 */
export function getAppointmentMonthKey(dateStr: string): string {
  const d = parseAppointmentDate(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Returns current month key e.g. "2026-11"
 */
export function getCurrentMonthKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Formats "YYYY-MM" to readable Portuguese, e.g. "Novembro de 2026"
 */
export function formatMonthKeyToLabel(monthKey: string): string {
  if (!monthKey || !monthKey.includes('-')) return 'Mês Atual';
  const [yStr, mStr] = monthKey.split('-');
  const y = parseInt(yStr, 10);
  const m = parseInt(mStr, 10) - 1;
  const name = MONTH_NAMES_PT_BR[m] || 'Mês';
  return `${name} de ${y}`;
}
