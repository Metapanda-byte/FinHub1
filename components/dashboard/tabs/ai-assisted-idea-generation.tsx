"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
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
  Sparkles,
  Globe,
  Network,
  Zap,
  MessageSquare,
  Search,
  Shield,
  Activity,
  Package,
  Users,
  Calendar,
  Eye,
  ThumbsUp,
  ThumbsDown,
  ChevronRight,
  Filter,
  Newspaper,
  Twitter,
  LineChart,
  Bot,
  Shuffle,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types for different AI features
interface ThematicTrend {
  theme: string;
  strength: number;
  momentum: 'rising' | 'stable' | 'falling';
  relatedStocks: Array<{
    symbol: string;
    company: string;
    exposure: number;
    marketCap: string;
  }>;
  newsVolume: number;
  socialSentiment: number;
  catalysts: string[];
}

interface ContrarianOpportunity {
  symbol: string;
  company: string;
  fundamentalScore: number;
  sentimentScore: number;
  divergence: number;
  insiderActivity: 'buying' | 'selling' | 'neutral';
  analystLag: number;
  potentialCatalysts: string[];
}

interface SupplyChainInsight {
  centerCompany: string;
  impactedCompanies: Array<{
    symbol: string;
    company: string;
    relationship: string;
    impactScore: number;
  }>;
  eventType: string;
  expectedImpact: 'positive' | 'negative' | 'mixed';
}

interface AIGeneratedIdea {
  id: string;
  type: 'thematic' | 'contrarian' | 'momentum' | 'value' | 'event-driven';
  symbol: string;
  company: string;
  thesis: string;
  confidence: number;
  timeHorizon: string;
  riskLevel: 'low' | 'medium' | 'high';
  potentialReturn: number;
  keyMetrics: Record<string, any>;
}

// Mock data for demonstration
const mockThematicTrends: ThematicTrend[] = [
  {
    theme: "AI Infrastructure Boom",
    strength: 92,
    momentum: 'rising',
    relatedStocks: [
      { symbol: 'NVDA', company: 'NVIDIA', exposure: 95, marketCap: '$1.2T' },
      { symbol: 'SMCI', company: 'Super Micro Computer', exposure: 88, marketCap: '$60B' },
      { symbol: 'ARM', company: 'Arm Holdings', exposure: 82, marketCap: '$140B' },
      { symbol: 'DELL', company: 'Dell Technologies', exposure: 75, marketCap: '$80B' }
    ],
    newsVolume: 1247,
    socialSentiment: 85,
    catalysts: ['GPU shortage ending', 'Enterprise AI adoption', 'New chip releases']
  },
  {
    theme: "GLP-1 Revolution",
    strength: 87,
    momentum: 'rising',
    relatedStocks: [
      { symbol: 'LLY', company: 'Eli Lilly', exposure: 92, marketCap: '$750B' },
      { symbol: 'NVO', company: 'Novo Nordisk', exposure: 90, marketCap: '$480B' },
      { symbol: 'VKTX', company: 'Viking Therapeutics', exposure: 85, marketCap: '$7B' },
      { symbol: 'AMGN', company: 'Amgen', exposure: 70, marketCap: '$150B' }
    ],
    newsVolume: 892,
    socialSentiment: 79,
    catalysts: ['Expanding indications', 'Insurance coverage', 'Supply scaling']
  }
];

const mockContrarianOpps: ContrarianOpportunity[] = [
  {
    symbol: 'PYPL',
    company: 'PayPal',
    fundamentalScore: 78,
    sentimentScore: 35,
    divergence: 43,
    insiderActivity: 'buying',
    analystLag: 6,
    potentialCatalysts: ['New CEO strategy', 'Venmo monetization', 'Crypto integration']
  },
  {
    symbol: 'BABA',
    company: 'Alibaba',
    fundamentalScore: 82,
    sentimentScore: 28,
    divergence: 54,
    insiderActivity: 'buying',
    analystLag: 9,
    potentialCatalysts: ['China reopening', 'Regulatory clarity', 'Cloud growth']
  }
];

export default function AIAssistedIdeaGeneration() {
  const [activeTab, setActiveTab] = useState('discover');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ThematicTrend | null>(null);
  const [aiQuery, setAiQuery] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'ai', content: string, data?: any}>>([]);

  const handleGenerateIdeas = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
  };

  const handleAIChat = () => {
    if (!aiQuery.trim()) return;
    
    setChatMessages(prev => [...prev, { role: 'user', content: aiQuery }]);
    
    // Simulate AI response
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        role: 'ai',
        content: `Based on your query about "${aiQuery}", here are some investment opportunities I've identified...`,
        data: {
          ideas: [
            { symbol: 'MSFT', reason: 'Strong AI integration in products' },
            { symbol: 'GOOGL', reason: 'Leading in AI research and cloud' }
          ]
        }
      }]);
    }, 1500);
    
    setAiQuery('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-finhub-orange" />
            AI Investment Discovery Suite
          </CardTitle>
          <CardDescription>
            Leverage advanced AI to discover investment opportunities through multiple intelligent strategies
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="premium-tabs">
          <TabsList className="h-8 bg-transparent border-none p-0 gap-0 w-full justify-start">
            <TabsTrigger 
              value="discover" 
              className="premium-tab-trigger h-8 px-3 text-xs font-medium text-muted-foreground hover:text-foreground transition-all duration-200 data-[state=active]:text-foreground data-[state=active]:font-semibold rounded-none bg-transparent shadow-none flex items-center gap-1"
            >
              <Sparkles className="h-3 w-3" />
              Discover
            </TabsTrigger>
            <TabsTrigger 
              value="themes" 
              className="premium-tab-trigger h-8 px-3 text-xs font-medium text-muted-foreground hover:text-foreground transition-all duration-200 data-[state=active]:text-foreground data-[state=active]:font-semibold rounded-none bg-transparent shadow-none flex items-center gap-1"
            >
              <Globe className="h-3 w-3" />
              Themes
            </TabsTrigger>
            <TabsTrigger 
              value="contrarian" 
              className="premium-tab-trigger h-8 px-3 text-xs font-medium text-muted-foreground hover:text-foreground transition-all duration-200 data-[state=active]:text-foreground data-[state=active]:font-semibold rounded-none bg-transparent shadow-none flex items-center gap-1"
            >
              <Shuffle className="h-3 w-3" />
              Contrarian
            </TabsTrigger>
            <TabsTrigger 
              value="supply-chain" 
              className="premium-tab-trigger h-8 px-3 text-xs font-medium text-muted-foreground hover:text-foreground transition-all duration-200 data-[state=active]:text-foreground data-[state=active]:font-semibold rounded-none bg-transparent shadow-none flex items-center gap-1"
            >
              <Network className="h-3 w-3" />
              Supply Chain
            </TabsTrigger>
            <TabsTrigger 
              value="ai-chat" 
              className="premium-tab-trigger h-8 px-3 text-xs font-medium text-muted-foreground hover:text-foreground transition-all duration-200 data-[state=active]:text-foreground data-[state=active]:font-semibold rounded-none bg-transparent shadow-none flex items-center gap-1"
            >
              <Bot className="h-3 w-3" />
              AI Chat
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Discovery Tab - Personalized Feed */}
        <TabsContent value="discover" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Personalized Discovery Feed</CardTitle>
              <CardDescription>AI-curated investment ideas based on your preferences and market conditions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Button size="sm" variant="outline" className="text-xs">
                  <Filter className="h-3 w-3 mr-1" />
                  Risk: Medium
                </Button>
                <Button size="sm" variant="outline" className="text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  Horizon: 6-12M
                </Button>
                <Button size="sm" variant="outline" className="text-xs">
                  <Target className="h-3 w-3 mr-1" />
                  Growth Focus
                </Button>
              </div>

              <div className="grid gap-4">
                {/* Discovery Card 1 */}
                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Momentum Play
                          </Badge>
                          <Badge className="bg-green-100 text-green-800">High Confidence</Badge>
                        </div>
                        <h3 className="font-semibold text-lg">CRWD - CrowdStrike</h3>
                        <p className="text-sm text-muted-foreground">Cybersecurity • Large Cap</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">+32%</p>
                        <p className="text-xs text-muted-foreground">Potential</p>
                      </div>
                    </div>
                    
                    <p className="text-sm mb-4">
                      AI identified strong momentum in cybersecurity spending. CrowdStrike showing 
                      accelerating growth, expanding margins, and increasing enterprise adoption.
                    </p>
                    
                    <div className="flex gap-2 mb-4">
                      <Badge variant="secondary" className="text-xs">Rising cyber threats</Badge>
                      <Badge variant="secondary" className="text-xs">AI-powered platform</Badge>
                      <Badge variant="secondary" className="text-xs">Market share gains</Badge>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        <Eye className="h-3 w-3 mr-1" />
                        View Analysis
                      </Button>
                      <Button size="sm" variant="outline">
                        <ThumbsUp className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <ThumbsDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Discovery Card 2 */}
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            <Award className="h-3 w-3 mr-1" />
                            Hidden Gem
                          </Badge>
                          <Badge className="bg-blue-100 text-blue-800">Under Radar</Badge>
                        </div>
                        <h3 className="font-semibold text-lg">DDOG - Datadog</h3>
                        <p className="text-sm text-muted-foreground">Cloud Monitoring • Mid Cap</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">+28%</p>
                        <p className="text-xs text-muted-foreground">Potential</p>
                      </div>
                    </div>
                    
                    <p className="text-sm mb-4">
                      AI detected unusual options activity and increasing institutional accumulation. 
                      Company benefiting from cloud migration and DevOps adoption trends.
                    </p>
                    
                    <div className="flex gap-2 mb-4">
                      <Badge variant="secondary" className="text-xs">Multi-cloud growth</Badge>
                      <Badge variant="secondary" className="text-xs">Sticky platform</Badge>
                      <Badge variant="secondary" className="text-xs">High NRR</Badge>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        <Eye className="h-3 w-3 mr-1" />
                        View Analysis
                      </Button>
                      <Button size="sm" variant="outline">
                        <ThumbsUp className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <ThumbsDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Button className="w-full mt-4" variant="outline" onClick={handleGenerateIdeas}>
                {isGenerating ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Load More Ideas
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Thematic Investing Tab */}
        <TabsContent value="themes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Trending Investment Themes</CardTitle>
              <CardDescription>AI-identified macro trends and thematic opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {mockThematicTrends.map((theme, idx) => (
                  <Card key={idx} className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedTheme(theme)}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-semibold">{theme.theme}</h3>
                        <Badge className={cn(
                          "text-xs",
                          theme.momentum === 'rising' && "bg-green-100 text-green-800",
                          theme.momentum === 'stable' && "bg-yellow-100 text-yellow-800",
                          theme.momentum === 'falling' && "bg-red-100 text-red-800"
                        )}>
                          {theme.momentum === 'rising' && <TrendingUp className="h-3 w-3 mr-1" />}
                          {theme.momentum === 'falling' && <TrendingDown className="h-3 w-3 mr-1" />}
                          {theme.momentum}
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Theme Strength</span>
                            <span>{theme.strength}%</span>
                          </div>
                          <Progress value={theme.strength} className="h-2" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-1">
                            <Newspaper className="h-3 w-3 text-muted-foreground" />
                            <span>{theme.newsVolume} news</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Twitter className="h-3 w-3 text-muted-foreground" />
                            <span>{theme.socialSentiment}% positive</span>
                          </div>
                        </div>
                        
                        <div className="flex -space-x-2">
                          {theme.relatedStocks.slice(0, 4).map((stock, i) => (
                            <div key={i} className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-white dark:border-gray-900 flex items-center justify-center text-xs font-medium">
                              {stock.symbol.slice(0, 2)}
                            </div>
                          ))}
                          {theme.relatedStocks.length > 4 && (
                            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-900 flex items-center justify-center text-xs">
                              +{theme.relatedStocks.length - 4}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Theme Detail View */}
              {selectedTheme && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg">{selectedTheme.theme} - Deep Dive</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Key Stocks</h4>
                        <div className="grid gap-2">
                          {selectedTheme.relatedStocks.map((stock, i) => (
                            <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <div>
                                  <p className="font-medium">{stock.symbol}</p>
                                  <p className="text-xs text-muted-foreground">{stock.company}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center gap-2">
                                  <Progress value={stock.exposure} className="w-20 h-2" />
                                  <span className="text-xs">{stock.exposure}%</span>
                                </div>
                                <p className="text-xs text-muted-foreground">{stock.marketCap}</p>
                              </div>
                              <Button size="sm" variant="outline">
                                <ChevronRight className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Catalysts</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedTheme.catalysts.map((catalyst, i) => (
                            <Badge key={i} variant="secondary">{catalyst}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contrarian Opportunities Tab */}
        <TabsContent value="contrarian" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contrarian Opportunities</CardTitle>
              <CardDescription>Stocks where sentiment diverges from fundamentals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription>
                    AI scans for stocks with strong fundamentals but negative sentiment, often indicating oversold conditions.
                  </AlertDescription>
                </Alert>
              </div>

              <div className="grid gap-4">
                {mockContrarianOpps.map((opp, idx) => (
                  <Card key={idx}>
                    <CardContent className="pt-6">
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{opp.symbol}</h3>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-sm text-muted-foreground">{opp.company}</span>
                            {opp.insiderActivity === 'buying' && (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                <Users className="h-3 w-3 mr-1" />
                                Insider Buying
                              </Badge>
                            )}
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex gap-4">
                              <div>
                                <p className="text-xs text-muted-foreground">Fundamentals</p>
                                <p className="text-lg font-semibold text-green-600">{opp.fundamentalScore}%</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Sentiment</p>
                                <p className="text-lg font-semibold text-red-600">{opp.sentimentScore}%</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Divergence</p>
                                <p className="text-lg font-semibold">{opp.divergence}pts</p>
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Analyst Coverage Lag</p>
                              <div className="flex items-center gap-2">
                                <Progress value={opp.analystLag * 10} className="h-2" />
                                <span className="text-xs">{opp.analystLag} months</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="border-l pl-4">
                          <h4 className="text-sm font-medium mb-2">Potential Catalysts</h4>
                          <div className="space-y-1">
                            {opp.potentialCatalysts.map((catalyst, i) => (
                              <p key={i} className="text-xs flex items-start gap-1">
                                <ChevronRight className="h-3 w-3 mt-0.5 text-muted-foreground" />
                                {catalyst}
                              </p>
                            ))}
                          </div>
                          <Button size="sm" className="w-full mt-3">
                            Deep Dive
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Supply Chain Intelligence Tab */}
        <TabsContent value="supply-chain" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Supply Chain Intelligence</CardTitle>
              <CardDescription>Track ripple effects through connected companies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">Track Impact From:</label>
                <div className="flex gap-2">
                  <Input placeholder="Enter company or event (e.g., AAPL, chip shortage)" className="flex-1" />
                  <Button>
                    <Search className="h-4 w-4 mr-2" />
                    Analyze
                  </Button>
                </div>
              </div>

              {/* Example Supply Chain Visualization */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4">NVDA New Chip Launch - Supply Chain Impact</h3>
                  
                  <div className="relative">
                    {/* Center Node */}
                    <div className="flex justify-center mb-8">
                      <div className="w-24 h-24 rounded-full bg-finhub-orange text-white flex items-center justify-center font-bold text-lg">
                        NVDA
                      </div>
                    </div>
                    
                    {/* Connected Companies */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card className="border-green-500">
                        <CardContent className="p-4">
                          <Badge className="bg-green-100 text-green-800 text-xs mb-2">+Impact</Badge>
                          <p className="font-medium">TSM</p>
                          <p className="text-xs text-muted-foreground">Chip Manufacturing</p>
                          <p className="text-sm mt-1">+15% volume</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-green-500">
                        <CardContent className="p-4">
                          <Badge className="bg-green-100 text-green-800 text-xs mb-2">+Impact</Badge>
                          <p className="font-medium">ASML</p>
                          <p className="text-xs text-muted-foreground">Equipment</p>
                          <p className="text-sm mt-1">+8% orders</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-red-500">
                        <CardContent className="p-4">
                          <Badge className="bg-red-100 text-red-800 text-xs mb-2">-Impact</Badge>
                          <p className="font-medium">AMD</p>
                          <p className="text-xs text-muted-foreground">Competitor</p>
                          <p className="text-sm mt-1">Share loss</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-green-500">
                        <CardContent className="p-4">
                          <Badge className="bg-green-100 text-green-800 text-xs mb-2">+Impact</Badge>
                          <p className="font-medium">SMCI</p>
                          <p className="text-xs text-muted-foreground">AI Servers</p>
                          <p className="text-sm mt-1">+20% demand</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Chat Assistant Tab */}
        <TabsContent value="ai-chat" className="space-y-4">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">AI Investment Copilot</CardTitle>
              <CardDescription>Ask questions and get personalized investment ideas</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {/* Chat Messages */}
              <ScrollArea className="flex-1 pr-4 mb-4">
                <div className="space-y-4">
                  {chatMessages.length === 0 ? (
                    <div className="text-center py-12">
                      <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-medium mb-2">Start a conversation</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Ask me about investment opportunities, market trends, or specific companies
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setAiQuery("Find me high-growth tech stocks under $50B market cap")}
                        >
                          Growth stocks under $50B
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setAiQuery("What are the best dividend stocks for retirement?")}
                        >
                          Dividend stocks
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setAiQuery("Show me companies benefiting from AI trend")}
                        >
                          AI beneficiaries
                        </Button>
                      </div>
                    </div>
                  ) : (
                    chatMessages.map((msg, idx) => (
                      <div key={idx} className={cn(
                        "flex gap-3",
                        msg.role === 'user' ? 'justify-end' : 'justify-start'
                      )}>
                        <div className={cn(
                          "max-w-[80%] rounded-lg p-3",
                          msg.role === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        )}>
                          <p className="text-sm">{msg.content}</p>
                          {msg.data && (
                            <div className="mt-3 space-y-2">
                              {msg.data.ideas?.map((idea: any, i: number) => (
                                <Card key={i} className="bg-background">
                                  <CardContent className="p-3">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <p className="font-medium">{idea.symbol}</p>
                                        <p className="text-xs text-muted-foreground">{idea.reason}</p>
                                      </div>
                                      <Button size="sm" variant="ghost">
                                        <ChevronRight className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
              
              {/* Input Area */}
              <div className="flex gap-2">
                <Textarea
                  placeholder="Ask about investment opportunities..."
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleAIChat()}
                  className="min-h-[60px] max-h-[120px]"
                />
                <Button onClick={handleAIChat} disabled={!aiQuery.trim()}>
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bottom Stats Bar */}
      <Card>
        <CardContent className="py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">2,847</p>
              <p className="text-xs text-muted-foreground">Ideas Generated Today</p>
            </div>
            <div>
              <p className="text-2xl font-bold">73%</p>
              <p className="text-xs text-muted-foreground">Avg Success Rate</p>
            </div>
            <div>
              <p className="text-2xl font-bold">156</p>
              <p className="text-xs text-muted-foreground">Active Themes</p>
            </div>
            <div>
              <p className="text-2xl font-bold">4.2/5</p>
              <p className="text-xs text-muted-foreground">User Rating</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          AI-generated ideas are for research purposes only. Always conduct your own due diligence before investing.
        </AlertDescription>
      </Alert>
    </div>
  );
}