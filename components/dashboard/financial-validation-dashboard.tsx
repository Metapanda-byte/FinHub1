"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";
import { financialMonitor } from "@/lib/utils/financial-calculation-validator";

interface ValidationDashboardProps {
  symbol?: string;
}

export function FinancialValidationDashboard({ symbol }: ValidationDashboardProps) {
  const [validationSummary, setValidationSummary] = useState<any>(null);
  const [recentErrors, setRecentErrors] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshData = () => {
    setIsRefreshing(true);
    const summary = financialMonitor.getValidationSummary();
    const errors = financialMonitor.getRecentErrors(60); // Last hour
    setValidationSummary(summary);
    setRecentErrors(errors);
    setIsRefreshing(false);
  };

  useEffect(() => {
    refreshData();
    // Refresh every 5 minutes
    const interval = setInterval(refreshData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [symbol]);

  if (!validationSummary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Financial Validation Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No validation data available yet.</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (successRate: number) => {
    if (successRate >= 95) return "bg-green-100 text-green-800";
    if (successRate >= 80) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getStatusIcon = (successRate: number) => {
    if (successRate >= 95) return <CheckCircle className="h-4 w-4" />;
    if (successRate >= 80) return <AlertTriangle className="h-4 w-4" />;
    return <XCircle className="h-4 w-4" />;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Financial Calculation Validation
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Validations</p>
              <p className="text-2xl font-bold">{validationSummary.totalValidations}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Errors</p>
              <p className="text-2xl font-bold text-red-600">{validationSummary.errorCount}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Warnings</p>
              <p className="text-2xl font-bold text-yellow-600">{validationSummary.warningCount}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Success Rate</p>
              <div className="flex items-center justify-center gap-2">
                {getStatusIcon(validationSummary.successRate)}
                <span className="text-2xl font-bold">{validationSummary.successRate.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge className={getStatusColor(validationSummary.successRate)}>
              {validationSummary.successRate >= 95 ? "Excellent" : 
               validationSummary.successRate >= 80 ? "Good" : "Needs Attention"}
            </Badge>
          </div>

          {/* Recent Errors */}
          {recentErrors.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-red-600">Recent Errors (Last Hour)</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {recentErrors.map((error, index) => (
                  <Alert key={index} variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-semibold">{error.context}</div>
                      <div className="text-sm opacity-90">{error.timestamp}</div>
                      <ul className="mt-2 space-y-1">
                        {error.errors.map((err: string, errIndex: number) => (
                          <li key={errIndex} className="text-sm">• {err}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="space-y-2">
            <h4 className="font-semibold">Recommendations</h4>
            <div className="space-y-2">
              {validationSummary.errorCount > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {validationSummary.errorCount} calculation errors detected. Review the data sources and calculation logic.
                  </AlertDescription>
                </Alert>
              )}
              
              {validationSummary.warningCount > 0 && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    {validationSummary.warningCount} warnings detected. Monitor these for potential issues.
                  </AlertDescription>
                </Alert>
              )}

              {validationSummary.successRate >= 95 && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    All financial calculations are passing validation checks. Continue monitoring for any changes.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 