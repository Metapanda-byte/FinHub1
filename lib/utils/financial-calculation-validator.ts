/**
 * Comprehensive Financial Calculation Validator
 * Monitors and validates financial calculations for accuracy and consistency
 */

export interface CalculationValidationResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  suggestions: string[];
  confidence: 'high' | 'medium' | 'low';
}

export interface FinancialDataPoint {
  value: number;
  date: string;
  source: string;
  calculation?: string;
}

export interface CrossValidationCheck {
  name: string;
  description: string;
  check: (data: any) => boolean;
  severity: 'error' | 'warning' | 'info';
}

/**
 * Validates P/E ratio calculation
 */
export function validatePERatio(
  price: number,
  earnings: number,
  sharesOutstanding: number
): CalculationValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  const suggestions: string[] = [];

  // Check for division by zero
  if (sharesOutstanding <= 0) {
    errors.push('Shares outstanding must be positive for P/E calculation');
    return { isValid: false, warnings, errors, suggestions, confidence: 'low' };
  }

  if (earnings <= 0) {
    warnings.push('Negative or zero earnings will result in negative P/E ratio');
  }

  const eps = earnings / sharesOutstanding;
  const peRatio = price / eps;

  // Validate reasonable ranges
  if (peRatio < 0) {
    errors.push('P/E ratio cannot be negative');
  } else if (peRatio > 1000) {
    warnings.push('Extremely high P/E ratio detected - verify earnings data');
  } else if (peRatio < 1 && peRatio > 0) {
    warnings.push('Very low P/E ratio - verify price and earnings data');
  }

  // Cross-check with market cap
  const impliedMarketCap = price * sharesOutstanding;
  if (impliedMarketCap > 0 && earnings > 0) {
    const impliedPE = impliedMarketCap / earnings;
    if (Math.abs(impliedPE - peRatio) > 0.01) {
      errors.push('P/E ratio calculation inconsistency detected');
    }
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors,
    suggestions,
    confidence: errors.length === 0 ? 'high' : 'medium'
  };
}

/**
 * Validates Enterprise Value calculation
 */
export function validateEnterpriseValue(
  marketCap: number,
  totalDebt: number,
  cashAndEquivalents: number
): CalculationValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  const suggestions: string[] = [];

  const enterpriseValue = marketCap + totalDebt - cashAndEquivalents;

  // Check for negative enterprise value
  if (enterpriseValue < 0) {
    warnings.push('Negative enterprise value detected - verify debt and cash data');
  }

  // Check if cash exceeds debt significantly
  if (cashAndEquivalents > totalDebt * 2) {
    warnings.push('Cash significantly exceeds debt - verify data accuracy');
  }

  // Validate that EV is reasonable relative to market cap
  if (marketCap > 0) {
    const evToMarketCapRatio = enterpriseValue / marketCap;
    if (evToMarketCapRatio < 0.5 || evToMarketCapRatio > 3) {
      warnings.push('Enterprise value seems unusual relative to market cap');
    }
  }

  return {
    isValid: true,
    warnings,
    errors,
    suggestions,
    confidence: 'high'
  };
}

/**
 * Validates DCF calculation components
 */
export function validateDCFCalculation(
  projectedFCF: number[],
  discountRate: number,
  terminalValue: number,
  enterpriseValue: number
): CalculationValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  const suggestions: string[] = [];

  // Validate discount rate
  if (discountRate <= 0 || discountRate > 50) {
    errors.push('Discount rate must be between 0% and 50%');
  }

  // Check for negative FCF
  const negativeFCF = projectedFCF.filter(fcf => fcf < 0);
  if (negativeFCF.length > 0) {
    warnings.push(`${negativeFCF.length} periods have negative free cash flow`);
  }

  // Validate terminal value calculation
  if (terminalValue <= 0) {
    errors.push('Terminal value must be positive');
  }

  // Check if terminal value is reasonable relative to projected FCF
  const avgFCF = projectedFCF.reduce((sum, fcf) => sum + fcf, 0) / projectedFCF.length;
  if (avgFCF > 0) {
    const terminalMultiple = terminalValue / avgFCF;
    if (terminalMultiple > 50) {
      warnings.push('Terminal value multiple seems unusually high');
    }
  }

  // Validate enterprise value calculation
  let presentValueFCF = 0;
  for (let i = 0; i < projectedFCF.length; i++) {
    presentValueFCF += projectedFCF[i] / Math.pow(1 + discountRate / 100, i + 1);
  }

  const calculatedEV = presentValueFCF + terminalValue / Math.pow(1 + discountRate / 100, projectedFCF.length);
  
  if (Math.abs(calculatedEV - enterpriseValue) / enterpriseValue > 0.01) {
    errors.push('Enterprise value calculation inconsistency detected');
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors,
    suggestions,
    confidence: errors.length === 0 ? 'high' : 'medium'
  };
}

/**
 * Validates financial ratios for consistency
 */
export function validateFinancialRatios(ratios: {
  currentRatio?: number;
  debtToEquity?: number;
  roe?: number;
  roa?: number;
  grossMargin?: number;
  operatingMargin?: number;
  netMargin?: number;
}): CalculationValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  const suggestions: string[] = [];

  // Current ratio validation
  if (ratios.currentRatio !== undefined) {
    if (ratios.currentRatio < 0) {
      errors.push('Current ratio cannot be negative');
    } else if (ratios.currentRatio < 0.5) {
      warnings.push('Very low current ratio - potential liquidity issues');
    } else if (ratios.currentRatio > 10) {
      warnings.push('Unusually high current ratio - verify data');
    }
  }

  // Debt to equity validation
  if (ratios.debtToEquity !== undefined) {
    if (ratios.debtToEquity < 0) {
      errors.push('Debt to equity ratio cannot be negative');
    } else if (ratios.debtToEquity > 10) {
      warnings.push('Extremely high debt to equity ratio');
    }
  }

  // Margin consistency check
  if (ratios.grossMargin && ratios.operatingMargin && ratios.netMargin) {
    if (ratios.operatingMargin > ratios.grossMargin) {
      errors.push('Operating margin cannot exceed gross margin');
    }
    if (ratios.netMargin > ratios.operatingMargin) {
      warnings.push('Net margin exceeds operating margin - unusual but possible');
    }
  }

  // ROE and ROA relationship
  if (ratios.roe && ratios.roa) {
    if (Math.abs(ratios.roe - ratios.roa) > 50) {
      warnings.push('Large difference between ROE and ROA - verify calculations');
    }
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors,
    suggestions,
    confidence: errors.length === 0 ? 'high' : 'medium'
  };
}

/**
 * Validates balance sheet consistency
 */
export function validateBalanceSheet(
  totalAssets: number,
  totalLiabilities: number,
  totalEquity: number,
  currentAssets: number,
  currentLiabilities: number
): CalculationValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  const suggestions: string[] = [];

  // Basic accounting equation
  const calculatedEquity = totalAssets - totalLiabilities;
  const difference = Math.abs(calculatedEquity - totalEquity);
  const tolerance = Math.max(totalAssets * 0.01, 1000000); // 1% tolerance

  if (difference > tolerance) {
    errors.push(`Balance sheet doesn't balance: Assets ${totalAssets.toLocaleString()} ≠ Liabilities ${totalLiabilities.toLocaleString()} + Equity ${totalEquity.toLocaleString()}`);
  }

  // Current assets should be <= total assets
  if (currentAssets > totalAssets) {
    errors.push('Current assets cannot exceed total assets');
  }

  // Current liabilities should be <= total liabilities
  if (currentLiabilities > totalLiabilities) {
    errors.push('Current liabilities cannot exceed total liabilities');
  }

  // Working capital check
  const workingCapital = currentAssets - currentLiabilities;
  if (workingCapital < 0) {
    warnings.push('Negative working capital detected');
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors,
    suggestions,
    confidence: errors.length === 0 ? 'high' : 'medium'
  };
}

/**
 * Validates cash flow statement consistency
 */
export function validateCashFlowStatement(
  operatingCashFlow: number,
  investingCashFlow: number,
  financingCashFlow: number,
  netChangeInCash: number,
  beginningCash: number,
  endingCash: number
): CalculationValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  const suggestions: string[] = [];

  // Check if cash flows sum to net change
  const calculatedNetChange = operatingCashFlow + investingCashFlow + financingCashFlow;
  const difference = Math.abs(calculatedNetChange - netChangeInCash);
  
  if (difference > 1000) { // Allow for rounding differences
    errors.push('Cash flow components do not sum to net change in cash');
  }

  // Check if ending cash equals beginning cash plus net change
  const calculatedEndingCash = beginningCash + netChangeInCash;
  const endingDifference = Math.abs(calculatedEndingCash - endingCash);
  
  if (endingDifference > 1000) {
    errors.push('Ending cash balance calculation error');
  }

  // Validate reasonable cash flow patterns
  if (operatingCashFlow < 0 && Math.abs(operatingCashFlow) > Math.abs(investingCashFlow + financingCashFlow)) {
    warnings.push('Large negative operating cash flow - verify data');
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors,
    suggestions,
    confidence: errors.length === 0 ? 'high' : 'medium'
  };
}

/**
 * Comprehensive validation of all financial calculations
 */
export function validateAllFinancialCalculations(data: {
  price?: number;
  earnings?: number;
  sharesOutstanding?: number;
  marketCap?: number;
  totalDebt?: number;
  cashAndEquivalents?: number;
  projectedFCF?: number[];
  discountRate?: number;
  terminalValue?: number;
  enterpriseValue?: number;
  ratios?: any;
  balanceSheet?: any;
  cashFlow?: any;
}): CalculationValidationResult {
  const allWarnings: string[] = [];
  const allErrors: string[] = [];
  const allSuggestions: string[] = [];
  let overallConfidence: 'high' | 'medium' | 'low' = 'high';

  // Validate P/E ratio if data available
  if (data.price && data.earnings && data.sharesOutstanding) {
    const peValidation = validatePERatio(data.price, data.earnings, data.sharesOutstanding);
    allWarnings.push(...peValidation.warnings);
    allErrors.push(...peValidation.errors);
    if (peValidation.confidence === 'low') overallConfidence = 'low';
  }

  // Validate Enterprise Value
  if (data.marketCap !== undefined && data.totalDebt !== undefined && data.cashAndEquivalents !== undefined) {
    const evValidation = validateEnterpriseValue(data.marketCap, data.totalDebt, data.cashAndEquivalents);
    allWarnings.push(...evValidation.warnings);
    allErrors.push(...evValidation.errors);
  }

  // Validate DCF calculations
  if (data.projectedFCF && data.discountRate && data.terminalValue && data.enterpriseValue) {
    const dcfValidation = validateDCFCalculation(
      data.projectedFCF,
      data.discountRate,
      data.terminalValue,
      data.enterpriseValue
    );
    allWarnings.push(...dcfValidation.warnings);
    allErrors.push(...dcfValidation.errors);
    if (dcfValidation.confidence === 'low') overallConfidence = 'low';
  }

  // Validate financial ratios
  if (data.ratios) {
    const ratioValidation = validateFinancialRatios(data.ratios);
    allWarnings.push(...ratioValidation.warnings);
    allErrors.push(...ratioValidation.errors);
  }

  // Validate balance sheet
  if (data.balanceSheet) {
    const balanceValidation = validateBalanceSheet(
      data.balanceSheet.totalAssets,
      data.balanceSheet.totalLiabilities,
      data.balanceSheet.totalEquity,
      data.balanceSheet.currentAssets,
      data.balanceSheet.currentLiabilities
    );
    allWarnings.push(...balanceValidation.warnings);
    allErrors.push(...balanceValidation.errors);
  }

  // Validate cash flow statement
  if (data.cashFlow) {
    const cashFlowValidation = validateCashFlowStatement(
      data.cashFlow.operatingCashFlow,
      data.cashFlow.investingCashFlow,
      data.cashFlow.financingCashFlow,
      data.cashFlow.netChangeInCash,
      data.cashFlow.beginningCash,
      data.cashFlow.endingCash
    );
    allWarnings.push(...cashFlowValidation.warnings);
    allErrors.push(...cashFlowValidation.errors);
  }

  return {
    isValid: allErrors.length === 0,
    warnings: allWarnings,
    errors: allErrors,
    suggestions: allSuggestions,
    confidence: overallConfidence
  };
}

/**
 * Logs validation results with appropriate formatting
 */
export function logValidationResults(results: CalculationValidationResult, context: string): void {
  const timestamp = new Date().toISOString();
  
  if (results.errors.length > 0) {
    console.error(`[${timestamp}] [Financial Validation ERROR - ${context}]`, {
      errors: results.errors,
      confidence: results.confidence
    });
  }
  
  if (results.warnings.length > 0) {
    console.warn(`[${timestamp}] [Financial Validation WARNING - ${context}]`, {
      warnings: results.warnings,
      confidence: results.confidence
    });
  }
  
  if (results.isValid && results.warnings.length === 0) {
    console.log(`[${timestamp}] [Financial Validation SUCCESS - ${context}] All calculations validated successfully`);
  }
}

/**
 * Creates a monitoring system for ongoing validation
 */
export class FinancialCalculationMonitor {
  private validationHistory: Array<{
    timestamp: string;
    context: string;
    result: CalculationValidationResult;
  }> = [];

  private maxHistorySize = 1000;

  validateAndLog(data: any, context: string): CalculationValidationResult {
    const result = validateAllFinancialCalculations(data);
    
    // Store in history
    this.validationHistory.push({
      timestamp: new Date().toISOString(),
      context,
      result
    });

    // Maintain history size
    if (this.validationHistory.length > this.maxHistorySize) {
      this.validationHistory = this.validationHistory.slice(-this.maxHistorySize);
    }

    // Log results
    logValidationResults(result, context);

    return result;
  }

  getValidationHistory(): Array<{timestamp: string; context: string; result: CalculationValidationResult}> {
    return [...this.validationHistory];
  }

  getRecentErrors(minutes: number = 60): Array<{timestamp: string; context: string; errors: string[]}> {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.validationHistory
      .filter(entry => new Date(entry.timestamp) > cutoff && entry.result.errors.length > 0)
      .map(entry => ({
        timestamp: entry.timestamp,
        context: entry.context,
        errors: entry.result.errors
      }));
  }

  getValidationSummary(): {
    totalValidations: number;
    errorCount: number;
    warningCount: number;
    successRate: number;
  } {
    const total = this.validationHistory.length;
    const errors = this.validationHistory.filter(entry => entry.result.errors.length > 0).length;
    const warnings = this.validationHistory.filter(entry => entry.result.warnings.length > 0).length;
    const successRate = total > 0 ? ((total - errors) / total) * 100 : 100;

    return {
      totalValidations: total,
      errorCount: errors,
      warningCount: warnings,
      successRate
    };
  }
}

// Global monitor instance
export const financialMonitor = new FinancialCalculationMonitor(); 