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

export const formatPercentage = (value: number): string => {
  if (value == null || isNaN(value)) return 'N/A';
  return `${value.toFixed(1)}%`;
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(value);
};

export const formatShortDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
};

export const formatYYYYMMDD = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

export const formatMonthYear = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
  }).format(date);
};

export const formatYearOnly = (dateString: string): string => {
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