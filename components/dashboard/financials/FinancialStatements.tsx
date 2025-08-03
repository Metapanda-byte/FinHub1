"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ViewModeToggle } from "../controls/ViewModeToggle";
import { PeriodToggle } from "../controls/PeriodToggle";
import { useFinancialPeriodStore } from "@/lib/store/financial-period";
import { 
  useIncomeStatements, 
  useBalanceSheets, 
  useCashFlows,
  useRevenueSegments,
  useGeographicRevenue
} from "@/lib/api/financial";
import { formatFinancialNumber } from "@/lib/utils/formatters";
import { IncomeStatementLine } from "./IncomeStatementLine";
import { cn } from "@/lib/utils";

interface FinancialStatementsProps {
  symbol: string;
}

export function FinancialStatements({ symbol }: FinancialStatementsProps) {
  const { viewMode, period } = useFinancialPeriodStore();
  
  const { statements: incomeStatements, isLoading: incomeLoading } = useIncomeStatements(symbol);
  const { statements: balanceSheets, isLoading: balanceLoading } = useBalanceSheets(symbol);
  const { statements: cashFlows, isLoading: cashFlowLoading } = useCashFlows(symbol);
  const { segments, isLoading: segmentsLoading } = useRevenueSegments(symbol);
  const { regions, isLoading: regionsLoading } = useGeographicRevenue(symbol);

  if (incomeLoading || balanceLoading || cashFlowLoading || segmentsLoading || regionsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Financial Data...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center">
            <div className="animate-pulse space-y-4">
              <div className="h-4 w-48 bg-muted rounded"></div>
              <div className="h-4 w-36 bg-muted rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!incomeStatements.length || !balanceSheets.length || !cashFlows.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Financial Data Available</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Unable to fetch financial statements for this company.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xl font-bold">Historical Financials</CardTitle>
        <div className="flex items-center gap-4">
          <ViewModeToggle />
          <PeriodToggle />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Income Statement */}
        <section>
          <h3 className="text-lg font-semibold mb-4">Income Statement</h3>
          <div className="overflow-x-auto">
            <table className="w-full financial-table">
              <thead>
                <tr className="">
                  <th className="text-left py-3 px-4 font-medium text-sm">Metric</th>
                  {incomeStatements.map((statement) => (
                    <th key={statement.date} className="text-right py-3 px-4 font-medium text-sm">
                      {period === 'annual' ? statement.calendarYear : statement.period}
                    </th>
                  ))}
                  <th className="text-right py-3 px-4 font-medium text-sm">YoY Growth</th>
                </tr>
              </thead>
              <tbody>
                <IncomeStatementLine
                  label="Revenue"
                  values={incomeStatements.map(s => s.revenue)}
                  isSubtotal
                />

                {viewMode === 'detailed' && segments.map(segment => (
                  <IncomeStatementLine
                    key={segment.name}
                    label={segment.name}
                    values={incomeStatements.map(() => segment.value * 1e9)}
                    indentLevel={1}
                    showGrowth={false}
                  />
                ))}

                <IncomeStatementLine
                  label="Cost of Revenue"
                  values={incomeStatements.map(s => s.costOfRevenue)}
                  isExpense
                />

                <IncomeStatementLine
                  label="Gross Profit"
                  values={incomeStatements.map(s => s.grossProfit)}
                  isSubtotal
                />

                {viewMode === 'detailed' && (
                  <>
                    <IncomeStatementLine
                      label="Research & Development"
                      values={incomeStatements.map(s => s.researchAndDevelopment || 0)}
                      isExpense
                    />
                    <IncomeStatementLine
                      label="Selling, General & Administrative"
                      values={incomeStatements.map(s => s.sellingGeneralAndAdministrative || 0)}
                      isExpense
                    />
                  </>
                )}

                <IncomeStatementLine
                  label="Operating Income"
                  values={incomeStatements.map(s => s.operatingIncome)}
                  isSubtotal
                />

                {/* Add EBITDA section */}
                <IncomeStatementLine
                  label="EBITDA"
                  values={incomeStatements.map(s => s.ebitda)}
                  isSubtotal
                />

                {viewMode === 'detailed' && (
                  <>
                    <IncomeStatementLine
                      label="Depreciation & Amortization"
                      values={incomeStatements.map(s => s.depreciationAndAmortization)}
                      isExpense
                      indentLevel={1}
                    />
                    <IncomeStatementLine
                      label="EBITDA Margin"
                      values={incomeStatements.map(s => s.ebitdaratio * 100)}
                      showGrowth={false}
                      indentLevel={1}
                    />
                  </>
                )}

                {viewMode === 'detailed' && (
                  <>
                    <IncomeStatementLine
                      label="Interest Income"
                      values={incomeStatements.map(s => s.interestIncome || 0)}
                    />
                    <IncomeStatementLine
                      label="Interest Expense"
                      values={incomeStatements.map(s => s.interestExpense || 0)}
                      isExpense
                    />
                  </>
                )}

                <IncomeStatementLine
                  label="Income Before Tax"
                  values={incomeStatements.map(s => s.incomeBeforeTax)}
                  isSubtotal
                />

                <IncomeStatementLine
                  label="Income Tax Expense"
                  values={incomeStatements.map(s => s.incomeTaxExpense)}
                  isExpense
                />

                <IncomeStatementLine
                  label="Net Income"
                  values={incomeStatements.map(s => s.netIncome)}
                  isSubtotal
                />

                {viewMode === 'detailed' && (
                  <>
                    <tr className="">
                      <td colSpan={incomeStatements.length + 2} className="py-4 px-4 font-medium text-sm">
                        Per Share Data
                      </td>
                    </tr>
                    <IncomeStatementLine
                      label="EPS (Basic)"
                      values={incomeStatements.map(s => s.eps)}
                      showGrowth={false}
                    />
                    <IncomeStatementLine
                      label="EPS (Diluted)"
                      values={incomeStatements.map(s => s.epsdiluted)}
                      showGrowth={false}
                    />
                  </>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Balance Sheet */}
        <section>
          <h3 className="text-lg font-semibold mb-4">Balance Sheet</h3>
          <div className="overflow-x-auto">
            <table className="w-full financial-table">
              <thead>
                <tr className="">
                  <th className="text-left py-3 px-4 font-medium text-sm">Metric</th>
                  {balanceSheets.map((statement) => (
                    <th key={statement.date} className="text-right py-3 px-4 font-medium text-sm">
                      {period === 'annual' ? statement.calendarYear : statement.period}
                    </th>
                  ))}
                  <th className="text-right py-3 px-4 font-medium text-sm">YoY Growth</th>
                </tr>
              </thead>
              <tbody>
                <IncomeStatementLine
                  label="Total Assets"
                  values={balanceSheets.map(s => s.totalAssets)}
                  isSubtotal
                />

                {viewMode === 'detailed' && (
                  <>
                    <IncomeStatementLine
                      label="Cash & Equivalents"
                      values={balanceSheets.map(s => s.cashAndCashEquivalents)}
                      indentLevel={1}
                    />
                    <IncomeStatementLine
                      label="Short Term Investments"
                      values={balanceSheets.map(s => s.shortTermInvestments)}
                      indentLevel={1}
                    />
                    <IncomeStatementLine
                      label="Net Receivables"
                      values={balanceSheets.map(s => s.netReceivables)}
                      indentLevel={1}
                    />
                    <IncomeStatementLine
                      label="Inventory"
                      values={balanceSheets.map(s => s.inventory)}
                      indentLevel={1}
                    />
                  </>
                )}

                <IncomeStatementLine
                  label="Total Liabilities"
                  values={balanceSheets.map(s => s.totalLiabilities)}
                  isSubtotal
                />

                {viewMode === 'detailed' && (
                  <>
                    <IncomeStatementLine
                      label="Accounts Payable"
                      values={balanceSheets.map(s => s.accountPayables)}
                      indentLevel={1}
                    />
                    <IncomeStatementLine
                      label="Short Term Debt"
                      values={balanceSheets.map(s => s.shortTermDebt)}
                      indentLevel={1}
                    />
                    <IncomeStatementLine
                      label="Long Term Debt"
                      values={balanceSheets.map(s => s.longTermDebt)}
                      indentLevel={1}
                    />
                  </>
                )}

                <IncomeStatementLine
                  label="Total Equity"
                  values={balanceSheets.map(s => s.totalStockholdersEquity)}
                  isSubtotal
                />
              </tbody>
            </table>
          </div>
        </section>

        {/* Cash Flow Statement */}
        <section>
          <h3 className="text-lg font-semibold mb-4">Cash Flow Statement</h3>
          <div className="overflow-x-auto">
            <table className="w-full financial-table">
              <thead>
                <tr className="">
                  <th className="text-left py-3 px-4 font-medium text-sm">Metric</th>
                  {cashFlows.map((statement) => (
                    <th key={statement.date} className="text-right py-3 px-4 font-medium text-sm">
                      {period === 'annual' ? statement.calendarYear : statement.period}
                    </th>
                  ))}
                  <th className="text-right py-3 px-4 font-medium text-sm">YoY Growth</th>
                </tr>
              </thead>
              <tbody>
                <IncomeStatementLine
                  label="Operating Cash Flow"
                  values={cashFlows.map(s => s.operatingCashFlow)}
                  isSubtotal
                />

                {viewMode === 'detailed' && (
                  <>
                    <IncomeStatementLine
                      label="Net Income"
                      values={cashFlows.map(s => s.netIncome)}
                      indentLevel={1}
                    />
                    <IncomeStatementLine
                      label="Depreciation & Amortization"
                      values={cashFlows.map(s => s.depreciationAndAmortization)}
                      indentLevel={1}
                    />
                    <IncomeStatementLine
                      label="Change in Working Capital"
                      values={cashFlows.map(s => s.changeInWorkingCapital)}
                      indentLevel={1}
                    />
                  </>
                )}

                <IncomeStatementLine
                  label="Capital Expenditure"
                  values={cashFlows.map(s => s.capitalExpenditure)}
                  isExpense
                />

                <IncomeStatementLine
                  label="Free Cash Flow"
                  values={cashFlows.map(s => s.freeCashFlow)}
                  isSubtotal
                />

                {viewMode === 'detailed' && (
                  <>
                    <IncomeStatementLine
                      label="Dividends Paid"
                      values={cashFlows.map(s => s.dividendsPaid)}
                      isExpense
                    />
                    <IncomeStatementLine
                      label="Share Repurchases"
                      values={cashFlows.map(s => s.commonStockRepurchased)}
                      isExpense
                    />
                  </>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {viewMode === 'detailed' && (
          <>
            {/* Revenue Segmentation */}
            {segments.length > 0 && (
              <section>
                <h3 className="text-lg font-semibold mb-4">Revenue Segmentation</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="">
                        <th className="text-left py-3 px-4 font-medium text-sm">Segment</th>
                        <th className="text-right py-3 px-4 font-medium text-sm">Revenue</th>
                        <th className="text-right py-3 px-4 font-medium text-sm">% of Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {segments.map((segment) => (
                        <tr key={segment.name} className="hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-4 text-sm">{segment.name}</td>
                          <td className="text-right py-3 px-4 text-sm">
                            {formatFinancialNumber(segment.value * 1e9)}
                          </td>
                          <td className="text-right py-3 px-4 text-sm">
                            {segment.percentage.toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Geographic Revenue */}
            {regions.length > 0 && (
              <section>
                <h3 className="text-lg font-semibold mb-4">Geographic Revenue</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="">
                        <th className="text-left py-3 px-4 font-medium text-sm">Region</th>
                        <th className="text-right py-3 px-4 font-medium text-sm">Revenue</th>
                        <th className="text-right py-3 px-4 font-medium text-sm">% of Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {regions.map((region) => (
                        <tr key={region.name} className="hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-4 text-sm">{region.name}</td>
                          <td className="text-right py-3 px-4 text-sm">
                            {formatFinancialNumber(region.value * 1e9)}
                          </td>
                          <td className="text-right py-3 px-4 text-sm">
                            {region.percentage.toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}