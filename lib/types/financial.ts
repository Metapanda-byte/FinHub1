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