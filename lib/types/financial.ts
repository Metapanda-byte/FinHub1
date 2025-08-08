export type FinancialPeriod = 'annual' | 'quarterly';
export type ViewMode = 'summary' | 'detailed';

export interface FinancialLineItem {
  label: string;
  values: number[];
  isExpense?: boolean;
  isSubtotal?: boolean;
  indentLevel?: number;
  showGrowth?: boolean;
}

export interface IncomeStatementItem {
  date: string;
  symbol: string;
  reportedCurrency: string;
  cik: string;
  fillingDate: string;
  acceptedDate: string;
  calendarYear: string;
  period: string;
  revenue: number;
  costOfRevenue: number;
  grossProfit: number;
  researchAndDevelopmentExpenses: number;
  generalAndAdministrativeExpenses: number;
  sellingAndMarketingExpenses: number;
  sellingGeneralAndAdministrativeExpenses: number;
  otherExpenses: number;
  operatingExpenses: number;
  costAndExpenses: number;
  operatingIncome: number;
  interestIncome: number;
  interestExpense: number;
  depreciationAndAmortization: number;
  ebitda: number;
  ebitdaratio: number;
  otherIncome: number;
  incomeBeforeTax: number;
  incomeTaxExpense: number;
  netIncome: number;
  eps: number;
  epsDiluted: number;
  weightedAverageShsOut: number;
  weightedAverageShsOutDil: number;
  [key: string]: any;
}

export interface BalanceSheetItem {
  date: string;
  symbol: string;
  reportedCurrency: string;
  cik: string;
  fillingDate: string;
  acceptedDate: string;
  calendarYear: string;
  period: string;
  totalAssets: number;
  currentAssets: number;
  cashAndCashEquivalents: number;
  shortTermInvestments: number;
  netReceivables: number;
  inventory: number;
  otherCurrentAssets: number;
  propertyPlantEquipmentNet: number;
  goodwill: number;
  intangibleAssets: number;
  longTermInvestments: number;
  otherNonCurrentAssets: number;
  totalLiabilities: number;
  currentLiabilities: number;
  accountPayables: number;
  shortTermDebt: number;
  deferredRevenue: number;
  otherCurrentLiabilities: number;
  longTermDebt: number;
  deferredRevenueNonCurrent: number;
  otherNonCurrentLiabilities: number;
  totalStockholdersEquity: number;
  retainedEarnings: number;
  commonStock: number;
  [key: string]: any;
}

export interface CashFlowItem {
  date: string;
  symbol: string;
  reportedCurrency: string;
  cik: string;
  fillingDate: string;
  acceptedDate: string;
  calendarYear: string;
  period: string;
  netIncome: number;
  depreciationAndAmortization: number;
  stockBasedCompensation: number;
  changeInWorkingCapital: number;
  accountsReceivables: number;
  inventory: number;
  accountsPayables: number;
  otherWorkingCapital: number;
  operatingCashFlow: number;
  capitalExpenditure: number;
  acquisitionsNet: number;
  purchasesOfInvestments: number;
  salesMaturitiesOfInvestments: number;
  otherInvestingActivites: number;
  investingCashFlow: number;
  debtRepayment: number;
  commonStockIssued: number;
  commonStockRepurchased: number;
  dividendsPaid: number;
  otherFinancingActivites: number;
  financingCashFlow: number;
  freeCashFlow: number;
  netCashFlow: number;
  netChangeInCash: number;
  cashAtBeginningOfPeriod: number;
  cashAtEndOfPeriod: number;
  netCashUsedForInvestingActivites: number;
  netCashUsedProvidedByFinancingActivities: number;
  [key: string]: any;
}

// Add common visualization types
export interface ProcessedSegment {
  name: string;
  value: number;
  percentage: number;
  children?: ProcessedSegment[];
  fullName?: string;
}

// Financial Ratios interfaces
export interface FinancialRatios {
  peRatio: number;
  pegRatio: number;
  bookValuePerShare: number;
  priceToBookRatio: number;
  returnOnAssets: number;
  returnOnEquity: number;
  debtEquityRatio: number;
  currentRatio: number;
  quickRatio: number;
  grossProfitMargin: number;
  operatingProfitMargin: number;
  netProfitMargin: number;
  dividendYield: number;
  payoutRatio: number;
  
  // Credit Analysis Ratios
  debtRatio: number; // Total Liabilities / Total Assets
  longTermDebtToCapitalization: number;
  totalDebtToCapitalization: number;
  interestCoverage: number; // EBIT / Interest Expense
  cashFlowToDebtRatio: number; // Operating Cash Flow / Total Debt
  cashRatio: number; // Cash / Current Liabilities
  companyEquityMultiplier: number; // Total Assets / Total Equity
  cashFlowCoverageRatios: number; // Operating Cash Flow / (Short Term Debt + Total Debt)
  shortTermCoverageRatios: number; // Operating Cash Flow / Short Term Debt
  capitalExpenditureCoverageRatio: number; // Operating Cash Flow / Capex
  
  date: string;
}

// Key Metrics interface for credit analysis
export interface KeyMetrics {
  revenuePerShare: number;
  netIncomePerShare: number;
  operatingCashFlowPerShare: number;
  freeCashFlowPerShare: number;
  cashPerShare: number;
  bookValuePerShare: number;
  tangibleBookValuePerShare: number;
  shareholdersEquityPerShare: number;
  interestDebtPerShare: number;
  marketCap: number;
  enterpriseValue: number;
  peRatio: number;
  priceToSalesRatio: number;
  pocfratio: number; // Price to Operating Cash Flow
  pfcfRatio: number; // Price to Free Cash Flow
  pbRatio: number;
  ptbRatio: number;
  evToSales: number;
  enterpriseValueOverEBITDA: number;
  evToOperatingCashFlow: number;
  evToFreeCashFlow: number;
  earningsYield: number;
  freeCashFlowYield: number;
  debtToEquity: number;
  debtToAssets: number;
  netDebtToEBITDA: number;
  currentRatio: number;
  interestCoverage: number;
  incomeQuality: number;
  dividendYield: number;
  payoutRatio: number;
  salesGeneralAndAdministrativeToRevenue: number;
  researchAndDevelopmentToRevenue: number;
  intangiblesToTotalAssets: number;
  capexToOperatingCashFlow: number;
  capexToRevenue: number;
  capexToDepreciation: number;
  stockBasedCompensationToRevenue: number;
  grahamNumber: number;
  roic: number; // Return on Invested Capital
  returnOnTangibleAssets: number;
  grahamNetNet: number;
  workingCapital: number;
  tangibleAssetValue: number;
  netCurrentAssetValue: number;
  investedCapital: number;
  averageReceivables: number;
  averagePayables: number;
  averageInventory: number;
  daysSalesOutstanding: number;
  daysPayablesOutstanding: number;
  daysOfInventoryOnHand: number;
  receivablesTurnover: number;
  payablesTurnover: number;
  inventoryTurnover: number;
  roe: number;
  capexPerShare: number;
  date: string;
}

export interface EarningsTranscriptDate {
  symbol: string;
  quarter: number;
  year: number;
  date: string;
}

export interface SECFiling {
  symbol: string;
  fillingDate: string;
  acceptedDate: string;
  cik: string;
  type: string;
  link: string;
  finalLink: string;
}