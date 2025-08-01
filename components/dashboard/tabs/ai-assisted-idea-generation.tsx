"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Lightbulb, 
  BarChart3, 
  DollarSign,
  AlertTriangle,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { useSearchStore } from '@/lib/store/search-store';

interface InvestmentIdea {
  symbol: string;
  company: string;
  sector: string;
  reason: string;
  confidence: number;
  targetPrice: number;
  currentPrice: number;
  upside: number;
  risk: 'Low' | 'Medium' | 'High';
  timeHorizon: '3M' | '6M' | '12M';
  catalysts: string[];
}

const mockIdeas: InvestmentIdea[] = [
  {
    symbol: 'NVDA',
    company: 'NVIDIA Corporation',
    sector: 'Technology',
    reason: 'AI revolution leader with strong GPU demand and expanding data center business',
    confidence: 85,
    targetPrice: 650,
    currentPrice: 500,
    upside: 30,
    risk: 'Medium',
    timeHorizon: '12M',
    catalysts: ['AI adoption growth', 'Data center expansion', 'New GPU launches']
  },
  {
    symbol: 'TSM',
    company: 'Taiwan Semiconductor',
    sector: 'Technology',
    reason: 'Dominant chip manufacturer benefiting from AI and 5G trends',
    confidence: 78,
    targetPrice: 120,
    currentPrice: 95,
    upside: 26,
    risk: 'Medium',
    timeHorizon: '12M',
    catalysts: ['Advanced node demand', 'Apple partnership', 'EV chip growth']
  },
  {
    symbol: 'MSFT',
    company: 'Microsoft Corporation',
    sector: 'Technology', 
    reason: 'Cloud leadership and AI integration across product suite',
    confidence: 82,
    targetPrice: 420,
    currentPrice: 380,
    upside: 11,
    risk: 'Low',
    timeHorizon: '6M',
    catalysts: ['Azure growth', 'AI monetization', 'Office 365 expansion']
  },
  {
    symbol: 'AMD',
    company: 'Advanced Micro Devices',
    sector: 'Technology',
    reason: 'Gaining market share in CPUs and expanding in AI/data center',
    confidence: 71,
    targetPrice: 180,
    currentPrice: 140,
    upside: 29,
    risk: 'High',
    timeHorizon: '12M',
    catalysts: ['Server CPU growth', 'AI chip competition', 'Data center wins']
  }
];

const RiskBadge: React.FC<{ risk: string }> = ({ risk }) => {
  const colors = {
    Low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    High: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
  };
  
  return <Badge className={colors[risk as keyof typeof colors]}>{risk} Risk</Badge>;
};

const ConfidenceBar: React.FC<{ confidence: number }> = ({ confidence }) => {
  const color = confidence >= 80 ? 'bg-green-500' : confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500';
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span>AI Confidence</span>
        <span>{confidence}%</span>
      </div>
                      <Progress value={confidence} className="h-2" />
    </div>
  );
};

export default function AIAssistedIdeaGeneration() {
  const { currentSymbol } = useSearchStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [ideas, setIdeas] = useState<InvestmentIdea[]>(mockIdeas);

  const handleGenerateIdeas = () => {
    setIsGenerating(true);
    // Simulate AI processing
    setTimeout(() => {
      setIsGenerating(false);
      // In a real implementation, this would call an AI service
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI-Powered Investment Ideas
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Generate investment opportunities using advanced AI analysis of market trends, financials, and catalysts
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button 
              onClick={handleGenerateIdeas}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {isGenerating ? 'Generating Ideas...' : 'Generate New Ideas'}
            </Button>
            <Badge variant="outline" className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              {ideas.length} Ideas Found
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* AI Status Alert */}
      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertDescription>
          AI analysis combines financial metrics, market sentiment, sector trends, and technical indicators to identify high-potential opportunities.
          <strong className="ml-1">This is a demo - results are simulated.</strong>
        </AlertDescription>
      </Alert>

      {/* Investment Ideas Grid */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {ideas.map((idea, index) => (
          <Card key={idea.symbol} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span>{idea.symbol}</span>
                    <RiskBadge risk={idea.risk} />
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {idea.company} • {idea.sector}
                  </p>
                </div>
                <Badge variant="outline">{idea.timeHorizon}</Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Price Information */}
              <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500">Current</p>
                  <p className="font-medium tabular-nums">${idea.currentPrice}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Target</p>
                  <p className="font-medium tabular-nums">${idea.targetPrice}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Upside</p>
                  <p className="font-medium text-green-600 tabular-nums flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +{idea.upside}%
                  </p>
                </div>
              </div>

              {/* AI Confidence */}
              <ConfidenceBar confidence={idea.confidence} />

              {/* Investment Thesis */}
              <div>
                <h4 className="text-sm font-medium mb-2">Investment Thesis</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {idea.reason}
                </p>
              </div>

              {/* Key Catalysts */}
              <div>
                <h4 className="text-sm font-medium mb-2">Key Catalysts</h4>
                <div className="flex flex-wrap gap-2">
                  {idea.catalysts.map((catalyst, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {catalyst}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-4"
                onClick={() => {
                  // In a real implementation, this would navigate to the company
                  alert(`Navigate to ${idea.symbol} analysis`);
                }}
              >
                View Detailed Analysis
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Market Insights Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            AI Market Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="text-lg font-bold">Technology</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Top Sector</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-lg font-bold">AI/ML</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Key Theme</p>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Target className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <p className="text-lg font-bold">78%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Confidence</p>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium mb-2">Current Market Themes</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Artificial Intelligence</Badge>
              <Badge variant="outline">Cloud Computing</Badge>
              <Badge variant="outline">Semiconductor Growth</Badge>
              <Badge variant="outline">Data Center Expansion</Badge>
              <Badge variant="outline">5G Infrastructure</Badge>
              <Badge variant="outline">Electric Vehicles</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> AI-generated investment ideas are for informational purposes only and should not be considered as financial advice. 
          Always conduct your own research and consult with a financial advisor before making investment decisions.
        </AlertDescription>
      </Alert>
    </div>
  );
} 