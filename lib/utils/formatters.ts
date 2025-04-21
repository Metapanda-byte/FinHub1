import { format } from 'date-fns';

export interface FinancialFormatOptions {
  unit?: 'millions' | 'billions' | 'trillions';
  decimals?: number;
  prefix?: string;
  suffix?: string;
  includeCurrency?: boolean;
  showZeroDecimals?: boolean;
}

const defaultOptions: FinancialFormatOptions = {
  unit: 'millions',
  decimals: 2,
  prefix: '$',
  suffix: '',
  includeCurrency: true,
  showZeroDecimals: false,
};

export function formatFinancialNumber(
  value: number,
  options: Partial<FinancialFormatOptions> = {}
): string {
  const opts = { ...defaultOptions, ...options };
  const { unit, decimals, prefix, suffix, includeCurrency, showZeroDecimals } = opts;

  let divisor = 1;
  let unitSuffix = '';

  switch (unit) {
    case 'billions':
      divisor = 1_000_000_000;
      unitSuffix = 'B';
      break;
    case 'millions':
      divisor = 1_000_000;
      unitSuffix = 'M';
      break;
    case 'trillions':
      divisor = 1_000_000_000_000;
      unitSuffix = 'T';
      break;
  }

  const scaledValue = value / divisor;
  const formattedNumber = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: showZeroDecimals ? decimals : 0,
    maximumFractionDigits: decimals,
    useGrouping: true,
  }).format(scaledValue);

  return `${includeCurrency ? prefix : ''}${formattedNumber}${unitSuffix}${suffix}`;
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}%`;
}

export function formatLargeNumber(value: number): string {
  if (Math.abs(value) >= 1_000_000_000_000) {
    return formatFinancialNumber(value, { unit: 'trillions' });
  }
  if (Math.abs(value) >= 1_000_000_000) {
    return formatFinancialNumber(value, { unit: 'billions' });
  }
  return formatFinancialNumber(value, { unit: 'millions' });
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatShortDate(date: string | Date): string {
  return format(new Date(date), 'MMM d');
}

export function formatYYYYMMDD(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy');
}

export function formatMonthYear(date: string | Date): string {
  return format(new Date(date), 'MMM yyyy');
}

export function formatYearOnly(date: string | Date): string {
  return format(new Date(date), 'yyyy');
}

export function formatTimeWithZone(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy HH:mm zzz');
}

export function formatPriceChange(current: number, previous: number): string {
  const change = current - previous;
  const percentChange = (change / Math.abs(previous)) * 100;
  const sign = change >= 0 ? '+' : '';
  return `${sign}${formatFinancialNumber(change, {
    decimals: 2,
  })} (${sign}${percentChange.toFixed(2)}%)`;
}

export interface OHLCData {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  change: number;
  changePercent: number;
}

export function formatOHLCData(data: OHLCData): string {
  return `O: ${formatFinancialNumber(data.open, { decimals: 2 })}
H: ${formatFinancialNumber(data.high, { decimals: 2 })}
L: ${formatFinancialNumber(data.low, { decimals: 2 })}
C: ${formatFinancialNumber(data.close, { decimals: 2 })}
Vol: ${formatNumber(data.volume)}
Chg: ${formatPriceChange(data.close, data.open)}`;
}

export function getGrowthIndicator(current: number, previous: number): 'positive' | 'negative' | 'neutral' {
  const change = current - previous;
  if (change > 0) return 'positive';
  if (change < 0) return 'negative';
  return 'neutral';
}

export function formatGrowth(current: number, previous: number): string {
  const growthPercentage = ((current - previous) / Math.abs(previous)) * 100;
  return `${growthPercentage >= 0 ? '+' : ''}${growthPercentage.toFixed(1)}%`;
}