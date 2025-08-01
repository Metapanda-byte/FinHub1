/**
 * Financial data validation utilities for ensuring data consistency and logical reasoning
 */

export interface ValidationResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
}

export interface FinancialStatement {
  revenue?: number;
  netIncome?: number;
  totalAssets?: number;
  totalLiabilities?: number;
  totalEquity?: number;
  currentAssets?: number;
  currentLiabilities?: number;
  operatingCashFlow?: number;
  freeCashFlow?: number;
  ebitda?: number;
  date?: string;
}

/**
 * Validates financial statement data for logical consistency
 */
export function validateFinancialStatement(statement: FinancialStatement): ValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Basic accounting equation: Assets = Liabilities + Equity
  if (statement.totalAssets && statement.totalLiabilities && statement.totalEquity) {
    const calculatedEquity = statement.totalAssets - statement.totalLiabilities;
    const difference = Math.abs(calculatedEquity - statement.totalEquity);
    const tolerance = Math.max(statement.totalAssets * 0.01, 1000000); // 1% tolerance or $1M
    
    if (difference > tolerance) {
      errors.push(`Balance sheet doesn't balance: Assets ${statement.totalAssets.toLocaleString()} ≠ Liabilities ${statement.totalLiabilities.toLocaleString()} + Equity ${statement.totalEquity.toLocaleString()}`);
    }
  }

  // Current assets should be <= total assets
  if (statement.currentAssets && statement.totalAssets && statement.currentAssets > statement.totalAssets) {
    errors.push(`Current assets (${statement.currentAssets.toLocaleString()}) cannot exceed total assets (${statement.totalAssets.toLocaleString()})`);
  }

  // Current liabilities should be <= total liabilities
  if (statement.currentLiabilities && statement.totalLiabilities && statement.currentLiabilities > statement.totalLiabilities) {
    errors.push(`Current liabilities (${statement.currentLiabilities.toLocaleString()}) cannot exceed total liabilities (${statement.totalLiabilities.toLocaleString()})`);
  }

  // Revenue should be positive for most companies
  if (statement.revenue && statement.revenue < 0) {
    warnings.push(`Negative revenue detected: ${statement.revenue.toLocaleString()}`);
  }

  // Net income should be reasonable relative to revenue
  if (statement.revenue && statement.netIncome) {
    const netMargin = (statement.netIncome / statement.revenue) * 100;
    if (netMargin < -100 || netMargin > 50) {
      warnings.push(`Unusual net margin detected: ${netMargin.toFixed(1)}%`);
    }
  }

  // EBITDA should be greater than net income (for profitable companies)
  if (statement.ebitda && statement.netIncome && statement.netIncome > 0 && statement.ebitda < statement.netIncome) {
    warnings.push(`EBITDA (${statement.ebitda.toLocaleString()}) is less than net income (${statement.netIncome.toLocaleString()}), which is unusual`);
  }

  // Free cash flow should be reasonable relative to operating cash flow
  if (statement.operatingCashFlow && statement.freeCashFlow && statement.operatingCashFlow > 0) {
    if (statement.freeCashFlow > statement.operatingCashFlow) {
      warnings.push(`Free cash flow (${statement.freeCashFlow.toLocaleString()}) exceeds operating cash flow (${statement.operatingCashFlow.toLocaleString()}), which is unusual`);
    }
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors
  };
}

/**
 * Validates financial ratios for reasonable ranges
 */
export function validateFinancialRatios(ratios: {
  peRatio?: number;
  pbRatio?: number;
  psRatio?: number;
  currentRatio?: number;
  debtToEquity?: number;
  roe?: number;
  roa?: number;
  grossMargin?: number;
  operatingMargin?: number;
  netMargin?: number;
}): ValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  // P/E ratio validation
  if (ratios.peRatio !== undefined && ratios.peRatio !== null) {
    if (ratios.peRatio < 0) {
      warnings.push(`Negative P/E ratio: ${ratios.peRatio.toFixed(2)}`);
    } else if (ratios.peRatio > 1000) {
      warnings.push(`Extremely high P/E ratio: ${ratios.peRatio.toFixed(2)}`);
    }
  }

  // Current ratio validation
  if (ratios.currentRatio !== undefined && ratios.currentRatio !== null) {
    if (ratios.currentRatio < 0) {
      errors.push(`Current ratio cannot be negative: ${ratios.currentRatio.toFixed(2)}`);
    } else if (ratios.currentRatio < 0.5) {
      warnings.push(`Very low current ratio: ${ratios.currentRatio.toFixed(2)}`);
    } else if (ratios.currentRatio > 10) {
      warnings.push(`Very high current ratio: ${ratios.currentRatio.toFixed(2)}`);
    }
  }

  // ROE validation
  if (ratios.roe !== undefined && ratios.roe !== null) {
    if (ratios.roe < -100 || ratios.roe > 100) {
      warnings.push(`Extreme ROE value: ${ratios.roe.toFixed(1)}%`);
    }
  }

  // Margin validations
  const margins = ['grossMargin', 'operatingMargin', 'netMargin'] as const;
  margins.forEach(margin => {
    const value = ratios[margin];
    if (value !== undefined && value !== null) {
      if (value < -100 || value > 100) {
        warnings.push(`Extreme ${margin}: ${value.toFixed(1)}%`);
      }
    }
  });

  // Cross-ratio validation: Operating margin should be less than gross margin
  if (ratios.grossMargin && ratios.operatingMargin && ratios.operatingMargin > ratios.grossMargin) {
    warnings.push(`Operating margin (${ratios.operatingMargin.toFixed(1)}%) exceeds gross margin (${ratios.grossMargin.toFixed(1)}%), which is unusual`);
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors
  };
}

/**
 * Validates time series data for consistency and trends
 */
export function validateTimeSeries(data: Array<{ date: string; value: number }>, metric: string): ValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  if (data.length < 2) {
    return { isValid: true, warnings, errors };
  }

  // Check for extreme period-over-period changes
  for (let i = 1; i < data.length; i++) {
    const current = data[i].value;
    const previous = data[i - 1].value;
    
    if (previous !== 0) {
      const change = Math.abs((current - previous) / previous);
      if (change > 5) { // 500% change
        warnings.push(`Large period-over-period change in ${metric}: ${(change * 100).toFixed(0)}% between ${data[i - 1].date} and ${data[i].date}`);
      }
    }
  }

  // Check for impossible values
  data.forEach(point => {
    if (!isFinite(point.value)) {
      errors.push(`Invalid value in ${metric} for ${point.date}: ${point.value}`);
    }
  });

  return {
    isValid: errors.length === 0,
    warnings,
    errors
  };
}

/**
 * Logs validation results with appropriate severity
 */
export function logValidationResults(results: ValidationResult, context: string): void {
  if (results.errors.length > 0) {
    console.error(`[Validation Error - ${context}]`, results.errors);
  }
  
  if (results.warnings.length > 0) {
    console.warn(`[Validation Warning - ${context}]`, results.warnings);
  }
  
  if (results.isValid && results.warnings.length === 0) {
    console.log(`[Validation Success - ${context}] All checks passed`);
  }
}