export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatLargeCurrency = (value: number): string => {
  if (value == null || isNaN(value)) return 'N/A';
  if (value >= 1e12) {
    return `$${(value / 1e12).toFixed(1)}T`;
  } else if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(1)}B`;
  } else if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(1)}M`;
  } else if (value >= 1e3) {
    return `$${(value / 1e3).toFixed(1)}K`;
  } else {
    return `$${value.toFixed(1)}`;
  }
};

export const formatMillions = (value: number): string => {
  if (value == null || isNaN(value)) return 'N/A';
  return `$${(value).toFixed(1)}M`;
};

export const formatBillions = (value: number): string => {
  if (value == null || isNaN(value)) return 'N/A';
  return `$${(value).toFixed(1)}B`;
};

export const formatPercentage = (value: number, decimals = 1): string => {
  if (value == null || isNaN(value)) return 'N/A';
  return `${value.toFixed(decimals)}%`;
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(value);
};

export const formatShortDate = (dateString: string | Date): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
};

export const formatYYYYMMDD = (dateString: string | Date): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

export const formatMonthYear = (dateString: string | Date): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
  }).format(date);
};

export const formatYearOnly = (dateString: string | Date): string => {
  const date = new Date(dateString);
  return date.getFullYear().toString();
};

export const formatTooltipValue = (value: number, prefix = '$', suffix = ''): string => {
  if (value == null || isNaN(value)) return 'N/A';
  return `${prefix}${value.toLocaleString('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}${suffix}`;
};

export const getGrowthIndicator = (current: number, previous: number): 'positive' | 'negative' | 'neutral' => {
  const diff = current - previous;
  if (diff > 0) return 'positive';
  if (diff < 0) return 'negative';
  return 'neutral';
};

export const calculateGrowthPercentage = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return ((current - previous) / Math.abs(previous)) * 100;
};

export const formatGrowth = (current: number, previous: number): string => {
  if (current == null || previous == null || isNaN(current) || isNaN(previous)) return 'N/A';
  const growthPercentage = calculateGrowthPercentage(current, previous);
  return `${growthPercentage >= 0 ? '+' : ''}${growthPercentage.toFixed(1)}%`;
};

export interface FinancialFormatOptions {
  unit?: 'millions' | 'billions' | 'trillions';
  decimals?: number;
  prefix?: string;
  suffix?: string;
  includeCurrency?: boolean;
  showZeroDecimals?: boolean;
  useParentheses?: boolean;
}

const defaultOptions: FinancialFormatOptions = {
  unit: 'millions',
  decimals: 2,
  prefix: '$',
  suffix: '',
  includeCurrency: true,
  showZeroDecimals: false,
  useParentheses: false,
};

export function formatFinancialNumber(
  value: number,
  options: Partial<FinancialFormatOptions> = {}
): string {
  const opts = { ...defaultOptions, ...options };
  const { decimals, suffix, showZeroDecimals, useParentheses } = opts;

  if (value === 0) {
    return '-';
  }

  const scaledValue = value / 1_000_000;
  const formattedNumber = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: showZeroDecimals ? decimals : 0,
    maximumFractionDigits: decimals,
    useGrouping: true,
  }).format(Math.abs(scaledValue));

  let result = formattedNumber;

  if (suffix) {
    result += suffix;
  }

  if (scaledValue < 0) {
    result = useParentheses ? `(${result})` : `-${result}`;
  } else {
    result = '  ' + result;
  }

  return result;
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

export function formatTimeWithZone(date: string | Date): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  }).format(d);
}