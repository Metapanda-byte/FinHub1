"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Send, 
  X, 
  Sparkles, 
  TrendingUp, 
  DollarSign,
  BarChart3,
  FileText,
  Brain,
  Minimize2,
  Maximize2,
  MessageSquare,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Activity,
  Briefcase,
  BarChart,
  Search,
  Building2,
  Target,
  Zap,
  Award,
  Timer,
  Lock,
  Crown,
  Check,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAnalystTeamStore, type TeamMessage, type TaskPriority } from "@/lib/store/analyst-team-store";
import { ChartDisplay } from "./chart-display";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Helper to gather visible page text for context (bounded for token safety)
function gatherSiteContent(maxChars: number = 10000): string {
  if (typeof document === 'undefined') return '';
  const text = document.body?.innerText || '';
  return text.replace(/\s+/g, ' ').trim().slice(0, maxChars);
}

interface AnalystTeamProps {
  symbol: string | null;
  companyName: string | null;
  financialData: any;
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  onQueryProcessed?: () => void;
}

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: "bg-gray-500",
  medium: "bg-blue-500",
  high: "bg-orange-500",
  urgent: "bg-red-500"
};

const ROLE_ICONS = {
  research: Search,
  financial: DollarSign,
  charts: BarChart
};

const ROLE_COLORS = {
  research: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  financial: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
  charts: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
};

export function AnalystTeam({ 
  symbol, 
  companyName, 
  financialData, 
  isOpen, 
  onClose, 
  initialQuery,
  onQueryProcessed 
}: AnalystTeamProps) {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority>('medium');
  const [showAnalystSelector, setShowAnalystSelector] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    analysts,
    tasks,
    messages,
    activeTaskCount,
    teamPerformance,
    selectedAnalystId,
    userSubscriptionTier,
    initializeTeam,
    createTask,
    assignTask,
    completeTask,
    addMessage,
    delegateTask,
    getAvailableAnalysts,
    selectAnalyst,
    getSelectedAnalyst,
    canUseAnalyst,
    setUserSubscriptionTier,
    clearMessages
  } = useAnalystTeamStore();

  const selectedAnalyst = getSelectedAnalyst();

  // Initialize team on mount
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeTeam();
    }
  }, [isOpen, messages.length, initializeTeam]);

  // Handle initial query
  useEffect(() => {
    if (initialQuery && isOpen) {
      handleSend(initialQuery, true);
      onQueryProcessed?.();
    }
  }, [initialQuery, isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const processAnalystTasks = async (taskId: string, analystIds: string[]) => {
    // Prepare tasks for the API
    const tasks = analystIds.map(analystId => ({
      analystId,
      query: input,
      context: {
        symbol,
        companyName,
        financialData: financialData ? {
          hasData: true,
          dataPoints: Object.keys(financialData).length
        } : null,
        siteContent: gatherSiteContent(12000)
      }
    }));

    try {
      // Call the analyst team API for parallel processing
      const response = await fetch('/api/analyst-team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tasks,
          mode: 'parallel' // Enable parallel processing
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process analyst tasks');
      }

      const data = await response.json();
      return data.results;
    } catch (error) {
      console.error('Error calling analyst team API:', error);
      
      // Fallback with more informative error messages
      return analystIds.map(analystId => {
        const analyst = analysts.find(a => a.id === analystId);
        let errorContent = '';
        
        if (analystId === 'laura') {
          errorContent = `**Research Analysis by Laura:**\n\n`;
          errorContent += `⚠️ I'm having trouble connecting to my research sources (Perplexity API).\n\n`;
          errorContent += `For the robotics industry report you requested, key areas to explore include:\n`;
          errorContent += `• Market size and growth projections\n`;
          errorContent += `• Major players (e.g., Boston Dynamics, ABB, FANUC, KUKA)\n`;
          errorContent += `• Industrial vs. service robotics segments\n`;
          errorContent += `• AI/ML integration trends\n`;
          errorContent += `• Supply chain and component manufacturers\n\n`;
          errorContent += `*Please ensure the Perplexity API key is properly configured in your environment variables.*`;
        } else {
          errorContent = `Analysis temporarily unavailable. Please check API configuration.`;
        }
        
        return {
          analystId,
          analystName: analyst?.name || 'Analyst',
          role: analyst?.role || 'research',
          content: errorContent,
          confidence: 0,
          processingTime: 0,
          suggestions: [
            'Check API configuration',
            'Retry the analysis',
            'Contact support if issue persists'
          ],
          sources: []
        };
      });
    }
  };

  // Reset chat: clear messages, reinitialize team, and default to Brian
  const handleReset = () => {
    clearMessages();
    initializeTeam();
    selectAnalyst('brian');
  };

  const handleSend = async (queryText?: string, hideQuery?: boolean) => {
    const messageText = queryText || input;
    if (!messageText.trim() || isProcessing) return;

    // Check if an analyst is selected
    if (!selectedAnalyst) {
      const errorMessage: TeamMessage = {
        id: `error_${Date.now()}`,
        type: 'system',
        content: 'Please select an analyst to handle your request.',
        timestamp: new Date()
      };
      addMessage(errorMessage);
      return;
    }

    // Add user message
    if (!hideQuery) {
      const userMessage: TeamMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: messageText,
        timestamp: new Date()
      };
      addMessage(userMessage);
    }

    setInput('');
    setIsProcessing(true);

    try {
      // Create task
      const task = createTask(messageText, selectedPriority, {
        symbol,
        companyName,
        financialData
      });

      // Use only the selected analyst
      const assignedAnalystIds = [selectedAnalyst.id];
      
      // Assign task to selected analyst
      assignTask(task.id, assignedAnalystIds);

      // Add system message about task assignment
      const assignmentMessage: TeamMessage = {
        id: `assign_${Date.now()}`,
        type: 'system',
        content: `Task assigned to: ${selectedAnalyst.avatar} ${selectedAnalyst.name}`,
        timestamp: new Date()
      };
      addMessage(assignmentMessage);

      // Process analyst tasks via API
      const results = await processAnalystTasks(task.id, assignedAnalystIds);

      // Complete task
      completeTask(task.id, results);

      // Add analyst response
      for (const result of results) {
        const analystMessage: TeamMessage = {
          id: `analyst_${Date.now()}_${result.analystId}`,
          type: 'analyst',
          analystId: result.analystId,
          content: result.content,
          timestamp: new Date(),
          chartData: result.chartData,
          results: [result]
        };
        addMessage(analystMessage);
      }

    } catch (error) {
      console.error('Team analysis error:', error);
      const errorMessage: TeamMessage = {
        id: `error_${Date.now()}`,
        type: 'system',
        content: 'I apologize, but there was an error processing your request. Please try again.',
        timestamp: new Date()
      };
      addMessage(errorMessage);
    } finally {
      setIsProcessing(false);
      inputRef.current?.focus();
    }
  };

  if (!isOpen) return null;

  const availableAnalysts = getAvailableAnalysts();
  const busyAnalysts = analysts.filter(a => a.status === 'busy');

  return (
    <div className={cn(
      "fixed top-0 right-0 bottom-0 bg-background border-l border-border shadow-2xl z-50 flex flex-col animate-slide-in-right transition-all duration-300 overflow-hidden",
      isExpanded ? "w-[800px]" : "w-[500px]"
    )}>
      {/* Header with McLaren orange accent [[memory:4967922]] */}
      <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-muted/30 to-muted/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-base flex items-center gap-2">
              AI Analyst Team
              {userSubscriptionTier === 'pro' && (
                <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
                  <Crown className="w-3 h-3 mr-1" />
                  Pro
                </Badge>
              )}
            </h3>
            <p className="text-xs text-muted-foreground">
              {companyName ? `${companyName} (${symbol})` : symbol || 'Financial Analysis'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8"
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Analyst Selector Bar */}
      <div className="flex-shrink-0 px-4 py-3 bg-muted/10 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Active Analyst:</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-9 px-3">
                  {selectedAnalyst ? (
                    <>
                      <span className="text-lg mr-2">{selectedAnalyst.avatar}</span>
                      <span className="font-medium">{selectedAnalyst.name}</span>
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Select Analyst
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-80">
                {analysts.map((analyst) => {
                  const isLocked = !canUseAnalyst(analyst.id);
                  const isSelected = selectedAnalyst?.id === analyst.id;
                  
                  return (
                    <DropdownMenuItem
                      key={analyst.id}
                      onClick={() => !isLocked && selectAnalyst(analyst.id)}
                      className={cn(
                        "p-3 cursor-pointer",
                        isLocked && "opacity-60 cursor-not-allowed",
                        isSelected && "bg-orange-50 dark:bg-orange-900/20"
                      )}
                      disabled={isLocked}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0",
                          analyst.role === 'financial' ? 'bg-green-100 dark:bg-green-900/30' :
                          analyst.role === 'research' ? 'bg-blue-100 dark:bg-blue-900/30' :
                          'bg-purple-100 dark:bg-purple-900/30'
                        )}>
                          {analyst.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium flex items-center gap-2">
                                {analyst.name}
                                {analyst.isPrimary && (
                                  <Badge variant="secondary" className="text-xs">Default</Badge>
                                )}
                                {isSelected && (
                                  <Check className="w-4 h-4 text-green-600" />
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground">{analyst.title}</p>
                            </div>
                            {isLocked && (
                              <Badge variant="outline" className="ml-2">
                                <Lock className="w-3 h-3 mr-1" />
                                Pro
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {isLocked ? analyst.description : analyst.specialties.slice(0, 2).join(', ')}
                          </p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  );
                })}
                
                {userSubscriptionTier === 'free' && (
                  <>
                    <DropdownMenuSeparator />
                    <div className="p-3 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                      <p className="text-xs font-medium mb-1">🚀 Unlock Full Team</p>
                      <p className="text-xs text-muted-foreground">
                        Upgrade to Pro to access Laura (Research) and John (Charts) for comprehensive analysis
                      </p>
                      <Button 
                        size="sm" 
                        className="mt-2 w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                        onClick={() => window.location.href = '/plans'}
                      >
                        Upgrade to Pro
                      </Button>
                    </div>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {selectedAnalyst && (
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <Activity className="w-3 h-3" />
                <span>{selectedAnalyst.successRate}% Success</span>
              </div>
              <div className="flex items-center gap-1">
                <Timer className="w-3 h-3" />
                <span>{selectedAnalyst.responseTime}s Avg</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Team Status Bar - Now shows only selected analyst */}
      <div className="flex-shrink-0 px-4 py-2 bg-muted/20 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {selectedAnalyst && (
              <div className="flex items-center gap-1.5">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm",
                  selectedAnalyst.status === 'available' ? 'bg-green-100 dark:bg-green-900/30' :
                  selectedAnalyst.status === 'busy' ? 'bg-orange-100 dark:bg-orange-900/30 animate-pulse' :
                  selectedAnalyst.status === 'locked' ? 'bg-gray-100 dark:bg-gray-900/30' :
                  'bg-gray-100 dark:bg-gray-900/30'
                )}>
                  {selectedAnalyst.avatar}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium">{selectedAnalyst.name}</span>
                  <span className={cn(
                    "text-[10px]",
                    selectedAnalyst.status === 'available' ? 'text-green-600 dark:text-green-400' :
                    selectedAnalyst.status === 'busy' ? 'text-orange-600 dark:text-orange-400' :
                    'text-gray-500'
                  )}>
                    {selectedAnalyst.status === 'busy' ? 'Working...' : 
                     selectedAnalyst.status === 'locked' ? 'Upgrade Required' : 
                     selectedAnalyst.status}
                  </span>
                </div>
              </div>
            )}
          </div>
          {activeTaskCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              <Activity className="w-3 h-3 mr-1" />
              {activeTaskCount} Active Tasks
            </Badge>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <TabsList className="flex-shrink-0 mx-4 mt-2 grid w-[calc(100%-32px)] grid-cols-3">
          <TabsTrigger value="chat" className="text-xs">
            <MessageSquare className="w-3 h-3 mr-1" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="team" className="text-xs">
            <Users className="w-3 h-3 mr-1" />
            Team
          </TabsTrigger>
          <TabsTrigger value="tasks" className="text-xs">
            <Briefcase className="w-3 h-3 mr-1" />
            Tasks
          </TabsTrigger>
        </TabsList>

        {/* Chat Tab */}
        <TabsContent value="chat" className="flex-1 flex flex-col mt-0 p-0 min-h-0">
          <ScrollArea className="flex-1 p-4 overflow-y-auto" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="space-y-2">
                  {message.type === 'system' && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <AlertCircle className="w-3 h-3" />
                      <span>{message.content}</span>
                    </div>
                  )}
                  
                  {message.type === 'user' && (
                    <div className="flex justify-end">
                      <div className="max-w-[70%] rounded-lg px-4 py-2 bg-orange-500 text-white">
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {(message.type === 'analyst' || message.type === 'team') && (
                    <div className="flex gap-3">
                      {message.analystId && (
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1",
                          message.analystId === 'laura' ? ROLE_COLORS.research :
                          message.analystId === 'brian' ? ROLE_COLORS.financial :
                          ROLE_COLORS.charts
                        )}>
                          {analysts.find(a => a.id === message.analystId)?.avatar || <Brain className="w-5 h-5" />}
                        </div>
                      )}
                      {message.type === 'team' && (
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0 mt-1">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div className="flex-1 max-w-[85%]">
                        <Card className="border-muted">
                          <CardContent className="p-3">
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                              {message.content.split('\n').map((line, i) => (
                                <p key={i} className="text-sm mb-1 last:mb-0">
                                  {line.startsWith('**') && line.endsWith('**') ? (
                                    <strong>{line.slice(2, -2)}</strong>
                                  ) : line.startsWith('• ') ? (
                                    <span className="ml-2">{line}</span>
                                  ) : line.startsWith('*') && line.endsWith('*') ? (
                                    <em className="text-xs text-muted-foreground">{line.slice(1, -1)}</em>
                                  ) : (
                                    line
                                  )}
                                </p>
                              ))}
                            </div>
                            {message.chartData && (
                              <div className="mt-3">
                                <ChartDisplay chartData={message.chartData} />
                              </div>
                            )}
                            {message.results && message.results[0]?.suggestions && (
                              <div className="mt-3 pt-3 border-t">
                                <p className="text-xs text-muted-foreground mb-2">Suggested follow-ups:</p>
                                <div className="flex flex-wrap gap-1">
                                  {message.results[0].suggestions.map((suggestion, idx) => (
                                    <Button
                                      key={idx}
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setInput(suggestion)}
                                      className="h-6 text-xs px-2 rounded-full"
                                    >
                                      {suggestion}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isProcessing && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-orange-600 dark:text-orange-400 animate-pulse" />
                  </div>
                  <Card className="flex-1">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                        <span className="text-sm text-muted-foreground">Team is analyzing...</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="flex-shrink-0 p-4 border-t border-border bg-muted/10">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">Priority:</Badge>
              <div className="flex gap-1">
                {(['low', 'medium', 'high', 'urgent'] as TaskPriority[]).map((priority) => (
                  <Button
                    key={priority}
                    variant={selectedPriority === priority ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedPriority(priority)}
                    className={cn(
                      "h-6 px-2 text-xs capitalize",
                      selectedPriority === priority && PRIORITY_COLORS[priority]
                    )}
                  >
                    {priority}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask your analyst team anything..."
                disabled={isProcessing}
                className="flex-1"
              />
              <Button
                onClick={() => handleSend()}
                disabled={isProcessing || !input.trim()}
                size="icon"
                className="bg-orange-500 hover:bg-orange-600"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Quick Actions */}
            <div className="flex gap-1 mt-2 flex-wrap">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setInput("Provide a comprehensive industry analysis")}
                className="h-7 text-xs px-2"
              >
                <Search className="w-3 h-3 mr-1" />
                Industry Research
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setInput("Analyze financial performance and key metrics")}
                className="h-7 text-xs px-2"
              >
                <DollarSign className="w-3 h-3 mr-1" />
                Financial Analysis
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setInput("Create performance charts and visualizations")}
                className="h-7 text-xs px-2"
              >
                <BarChart className="w-3 h-3 mr-1" />
                Generate Charts
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setInput("Full team analysis with all perspectives")}
                className="h-7 text-xs px-2"
              >
                <Users className="w-3 h-3 mr-1" />
                Team Analysis
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="flex-1 p-0 min-h-0 overflow-hidden">
          <ScrollArea className="h-full p-4">
            <div className="space-y-4">
              {/* Team Performance */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Award className="w-4 h-4 text-orange-500" />
                    Team Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Total Tasks</p>
                      <p className="text-lg font-semibold">{teamPerformance.totalTasks}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Completed</p>
                      <p className="text-lg font-semibold text-green-600">{teamPerformance.completedTasks}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Avg Response</p>
                      <p className="text-lg font-semibold">{teamPerformance.averageResponseTime.toFixed(1)}s</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Success Rate</p>
                      <p className="text-lg font-semibold">{teamPerformance.successRate.toFixed(0)}%</p>
                    </div>
                  </div>
                  <Progress value={teamPerformance.successRate} className="h-2" />
                </CardContent>
              </Card>

              {/* Analyst Cards */}
              <div className="space-y-3">
                {analysts.map((analyst) => {
                  const Icon = ROLE_ICONS[analyst.role];
                  const isLocked = !canUseAnalyst(analyst.id);
                  const isSelected = selectedAnalyst?.id === analyst.id;
                  
                  return (
                    <Card key={analyst.id} className={cn(
                      "transition-all cursor-pointer",
                      analyst.status === 'busy' && "border-orange-500/50 bg-orange-50/5",
                      isSelected && "border-orange-500 bg-orange-50/10",
                      isLocked && "opacity-75"
                    )}
                    onClick={() => !isLocked && selectAnalyst(analyst.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-12 h-12 rounded-lg flex items-center justify-center text-lg relative",
                              ROLE_COLORS[analyst.role]
                            )}>
                              {analyst.avatar}
                              {isLocked && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gray-800 rounded-full flex items-center justify-center">
                                  <Lock className="w-3 h-3 text-white" />
                                </div>
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm flex items-center gap-2">
                                {analyst.name}
                                {analyst.isPrimary && (
                                  <Badge variant="secondary" className="text-xs">Default</Badge>
                                )}
                                {isSelected && (
                                  <Badge className="bg-orange-500 text-white text-xs">Active</Badge>
                                )}
                              </h4>
                              <p className="text-xs text-muted-foreground">{analyst.title}</p>
                            </div>
                          </div>
                          <Badge variant={
                            isLocked ? 'outline' :
                            analyst.status === 'available' ? 'default' : 
                            analyst.status === 'busy' ? 'secondary' : 'outline'
                          }>
                            {isLocked ? (
                              <>
                                <Lock className="w-3 h-3 mr-1" />
                                Pro Only
                              </>
                            ) : analyst.status === 'busy' ? (
                              <>
                                <Activity className="w-3 h-3 mr-1 animate-pulse" />
                                Working
                              </>
                            ) : (
                              analyst.status
                            )}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {isLocked ? (
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground italic">
                              {analyst.description}
                            </p>
                            <Button 
                              size="sm" 
                              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = '/plans';
                              }}
                            >
                              <Crown className="w-4 h-4 mr-2" />
                              Unlock with Pro
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div className="flex flex-wrap gap-1">
                              {analyst.specialties.slice(0, 3).map((specialty, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {specialty}
                                </Badge>
                              ))}
                              {analyst.specialties.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{analyst.specialties.length - 3} more
                                </Badge>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                              <div className="text-center">
                                <p className="text-xs text-muted-foreground">Tasks</p>
                                <p className="text-sm font-semibold">{analyst.completedTasks}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-muted-foreground">Success</p>
                                <p className="text-sm font-semibold text-green-600">{analyst.successRate}%</p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-muted-foreground">Speed</p>
                                <p className="text-sm font-semibold">{analyst.responseTime}s</p>
                              </div>
                            </div>

                            {analyst.currentTask && (
                              <div className="pt-2 border-t">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Timer className="w-3 h-3 animate-spin" />
                                  <span>Currently working on task...</span>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="flex-1 p-0 min-h-0 overflow-hidden">
          <ScrollArea className="h-full p-4">
            <div className="space-y-3">
              {tasks.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No tasks yet. Start a conversation to create tasks.</p>
                  </CardContent>
                </Card>
              ) : (
                tasks.slice(-10).reverse().map((task) => (
                <Card key={task.id}>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium line-clamp-2">{task.query}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={cn("text-xs", PRIORITY_COLORS[task.priority])}>
                            {task.priority}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(task.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      <Badge variant={
                        task.status === 'completed' ? 'default' :
                        task.status === 'in_progress' ? 'secondary' :
                        task.status === 'failed' ? 'destructive' :
                        'outline'
                      }>
                        {task.status === 'completed' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                        {task.status === 'in_progress' && <Activity className="w-3 h-3 mr-1 animate-pulse" />}
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    {task.assignedTo.length > 0 && (
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t">
                        <span className="text-xs text-muted-foreground">Assigned to:</span>
                        <div className="flex gap-1">
                          {task.assignedTo.map(id => {
                            const analyst = analysts.find(a => a.id === id);
                            return analyst ? (
                              <div key={id} className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                                {analyst.avatar}
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}

                    {task.completedAt && task.startedAt && (
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Zap className="w-3 h-3" />
                        <span>
                          Completed in {((new Date(task.completedAt).getTime() - new Date(task.startedAt).getTime()) / 1000).toFixed(1)}s
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
} 