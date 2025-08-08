import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AnalystRole = 'research' | 'financial' | 'charts';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

export interface Analyst {
  id: string;
  name: string;
  role: AnalystRole;
  title: string;
  avatar: string;
  specialties: string[];
  status: 'available' | 'busy' | 'offline' | 'locked';
  currentTask?: string;
  completedTasks: number;
  successRate: number;
  responseTime: number; // in seconds
  requiredTier: SubscriptionTier; // subscription tier required to use this analyst
  description?: string; // Brief description for locked analysts
  isPrimary?: boolean; // Mark primary/default analyst
}

export interface Task {
  id: string;
  query: string;
  assignedTo: string[]; // analyst IDs
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  results?: TaskResult[];
  context?: {
    symbol?: string;
    companyName?: string;
    financialData?: any;
  };
}

export interface TaskResult {
  analystId: string;
  analystName: string;
  role: AnalystRole;
  content: string;
  chartData?: any;
  confidence: number; // 0-100
  processingTime: number; // in seconds
  suggestions?: string[];
  sources?: string[];
}

export interface TeamMessage {
  id: string;
  type: 'user' | 'team' | 'analyst' | 'system';
  analystId?: string;
  content: string;
  timestamp: Date;
  tasks?: Task[];
  results?: TaskResult[];
  isTeamResponse?: boolean;
  chartData?: any;
}

interface AnalystTeamStore {
  // State
  analysts: Analyst[];
  tasks: Task[];
  messages: TeamMessage[];
  activeTaskCount: number;
  selectedAnalystId: string | null; // Currently selected analyst
  userSubscriptionTier: SubscriptionTier; // User's subscription level
  teamPerformance: {
    totalTasks: number;
    completedTasks: number;
    averageResponseTime: number;
    successRate: number;
  };

  // Actions
  initializeTeam: () => void;
  createTask: (query: string, priority?: TaskPriority, context?: any) => Task;
  assignTask: (taskId: string, analystIds: string[]) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  completeTask: (taskId: string, results: TaskResult[]) => void;
  updateAnalystStatus: (analystId: string, status: 'available' | 'busy' | 'offline' | 'locked') => void;
  addMessage: (message: TeamMessage) => void;
  clearMessages: () => void;
  
  // Analyst selection
  selectAnalyst: (analystId: string) => void;
  getSelectedAnalyst: () => Analyst | null;
  canUseAnalyst: (analystId: string) => boolean;
  setUserSubscriptionTier: (tier: SubscriptionTier) => void;
  
  // Task delegation logic
  delegateTask: (query: string) => string[]; // returns analyst IDs
  getAvailableAnalysts: () => Analyst[];
  getAnalystById: (id: string) => Analyst | undefined;
  getTaskById: (id: string) => Task | undefined;
  
  // Performance tracking
  updateTeamPerformance: () => void;
  getAnalystPerformance: (analystId: string) => {
    completedTasks: number;
    successRate: number;
    averageResponseTime: number;
  };
}

// Initial team configuration - Brian first as the main analyst
const INITIAL_ANALYSTS: Analyst[] = [
  {
    id: 'brian',
    name: 'Brian',
    role: 'financial',
    title: 'Financial Analyst Whiz Kid',
    avatar: '👨‍💻',
    specialties: [
      'Company analysis',
      'Financial modeling',
      'Valuation metrics',
      'Earnings analysis',
      'Risk assessment',
      'DCF models'
    ],
    status: 'available',
    completedTasks: 0,
    successRate: 98,
    responseTime: 6,
    requiredTier: 'free', // Brian is available in free tier
    description: 'Your go-to analyst for comprehensive financial analysis and valuation',
    isPrimary: true
  },
  {
    id: 'laura',
    name: 'Laura',
    role: 'research',
    title: 'Senior Research Analyst',
    avatar: '👩‍💼',
    specialties: [
      'Deep dive reports',
      'Supply chain analysis',
      'Industry research',
      'Market trends',
      'Competitive landscape',
      'Regulatory analysis'
    ],
    status: 'locked',
    completedTasks: 0,
    successRate: 95,
    responseTime: 8,
    requiredTier: 'pro', // Laura requires pro subscription
    description: 'Unlock for deep market research and industry insights'
  },
  {
    id: 'john',
    name: 'John',
    role: 'charts',
    title: 'Data Visualization Expert',
    avatar: '📊',
    specialties: [
      'Chart creation',
      'Trend visualization',
      'Performance dashboards',
      'Interactive graphics',
      'Data storytelling',
      'Technical analysis'
    ],
    status: 'locked',
    completedTasks: 0,
    successRate: 97,
    responseTime: 5,
    requiredTier: 'pro', // John requires pro subscription
    description: 'Unlock for advanced data visualization and charting'
  }
];

export const useAnalystTeamStore = create<AnalystTeamStore>()(
  persist(
    (set, get) => ({
      analysts: INITIAL_ANALYSTS,
      tasks: [],
      messages: [],
      activeTaskCount: 0,
      selectedAnalystId: 'brian', // Default to Brian
      userSubscriptionTier: 'free', // Default to free tier
      teamPerformance: {
        totalTasks: 0,
        completedTasks: 0,
        averageResponseTime: 0,
        successRate: 0
      },

      initializeTeam: () => {
        const userTier = get().userSubscriptionTier;
        set({
          analysts: INITIAL_ANALYSTS.map(a => ({ 
            ...a, 
            status: get().canUseAnalyst(a.id) ? 'available' as const : 'locked' as const 
          })),
          selectedAnalystId: 'brian', // Always default to Brian
          messages: [{
            id: 'welcome',
            type: 'system',
            content: userTier === 'free' 
              ? "Welcome! Brian, your Financial Analyst, is ready to help. Upgrade to Pro to unlock Laura (Research) and John (Charts) for comprehensive team analysis."
              : "Welcome! Your full analyst team is ready. Brian handles financials, Laura provides research, and John creates visualizations.",
            timestamp: new Date(),
            isTeamResponse: true
          }]
        });
      },

      createTask: (query: string, priority: TaskPriority = 'medium', context?: any) => {
        const task: Task = {
          id: `task_${Date.now()}`,
          query,
          assignedTo: [],
          status: 'pending',
          priority,
          createdAt: new Date(),
          context
        };

        set((state) => ({
          tasks: [...state.tasks, task],
          activeTaskCount: state.activeTaskCount + 1
        }));

        return task;
      },

      assignTask: (taskId: string, analystIds: string[]) => {
        set((state) => ({
          tasks: state.tasks.map(task =>
            task.id === taskId
              ? { ...task, assignedTo: analystIds, status: 'in_progress' as TaskStatus, startedAt: new Date() }
              : task
          ),
          analysts: state.analysts.map(analyst =>
            analystIds.includes(analyst.id)
              ? { ...analyst, status: 'busy' as const, currentTask: taskId }
              : analyst
          )
        }));
      },

      updateTaskStatus: (taskId: string, status: TaskStatus) => {
        set((state) => ({
          tasks: state.tasks.map(task =>
            task.id === taskId ? { ...task, status } : task
          )
        }));
      },

      completeTask: (taskId: string, results: TaskResult[]) => {
        const completedAt = new Date();
        
        set((state) => {
          const task = state.tasks.find(t => t.id === taskId);
          if (!task) return state;

          // Update task
          const updatedTasks = state.tasks.map(t =>
            t.id === taskId
              ? { ...t, status: 'completed' as TaskStatus, completedAt, results }
              : t
          );

          // Update analysts
          const updatedAnalysts = state.analysts.map(analyst => {
            if (task.assignedTo.includes(analyst.id)) {
              const taskResult = results.find(r => r.analystId === analyst.id);
              return {
                ...analyst,
                status: 'available' as const,
                currentTask: undefined,
                completedTasks: analyst.completedTasks + 1,
                responseTime: taskResult 
                  ? (analyst.responseTime + taskResult.processingTime) / 2 
                  : analyst.responseTime
              };
            }
            return analyst;
          });

          return {
            tasks: updatedTasks,
            analysts: updatedAnalysts,
            activeTaskCount: Math.max(0, state.activeTaskCount - 1)
          };
        });

        // Update team performance
        get().updateTeamPerformance();
      },

      updateAnalystStatus: (analystId: string, status: 'available' | 'busy' | 'offline' | 'locked') => {
        set((state) => ({
          analysts: state.analysts.map(analyst =>
            analyst.id === analystId ? { ...analyst, status } : analyst
          )
        }));
      },

      addMessage: (message: TeamMessage) => {
        set((state) => ({
          messages: [...state.messages, message]
        }));
      },

      clearMessages: () => {
        set({ messages: [] });
      },

      selectAnalyst: (analystId: string) => {
        const analyst = get().getAnalystById(analystId);
        if (analyst && get().canUseAnalyst(analystId)) {
          set({ selectedAnalystId: analystId });
        }
      },

      getSelectedAnalyst: () => {
        const state = get();
        const analyst = state.analysts.find(a => a.id === state.selectedAnalystId);
        return analyst || null;
      },

      canUseAnalyst: (analystId: string) => {
        const state = get();
        const analyst = state.analysts.find(a => a.id === analystId);
        if (!analyst) return false;
        
        const tierLevels: Record<SubscriptionTier, number> = {
          'free': 0,
          'pro': 1,
          'enterprise': 2
        };
        
        return tierLevels[state.userSubscriptionTier] >= tierLevels[analyst.requiredTier];
      },

      setUserSubscriptionTier: (tier: SubscriptionTier) => {
        set({ userSubscriptionTier: tier });
        // Update analyst availability based on new tier
        const state = get();
        set({
          analysts: state.analysts.map(a => ({
            ...a,
            status: state.canUseAnalyst(a.id) ? 'available' as const : 'locked' as const
          }))
        });
      },

      delegateTask: (query: string) => {
        const lowerQuery = query.toLowerCase();
        const analysts = get().getAvailableAnalysts();
        const assignedIds: string[] = [];

        // Determine which analysts to assign based on query content
        const needsResearch = 
          lowerQuery.includes('research') ||
          lowerQuery.includes('industry') ||
          lowerQuery.includes('supply chain') ||
          lowerQuery.includes('competitor') ||
          lowerQuery.includes('market') ||
          lowerQuery.includes('trend') ||
          lowerQuery.includes('report');

        const needsFinancial = 
          lowerQuery.includes('financial') ||
          lowerQuery.includes('earnings') ||
          lowerQuery.includes('revenue') ||
          lowerQuery.includes('profit') ||
          lowerQuery.includes('valuation') ||
          lowerQuery.includes('dcf') ||
          lowerQuery.includes('analysis') ||
          lowerQuery.includes('metric') ||
          lowerQuery.includes('ratio');

        const needsChart = 
          lowerQuery.includes('chart') ||
          lowerQuery.includes('graph') ||
          lowerQuery.includes('visualiz') ||
          lowerQuery.includes('show') ||
          lowerQuery.includes('display') ||
          lowerQuery.includes('plot') ||
          lowerQuery.includes('trend');

        // Assign analysts based on needs
        if (needsResearch) {
          const laura = analysts.find(a => a.id === 'laura');
          if (laura) assignedIds.push(laura.id);
        }

        if (needsFinancial) {
          const brian = analysts.find(a => a.id === 'brian');
          if (brian) assignedIds.push(brian.id);
        }

        if (needsChart) {
          const john = analysts.find(a => a.id === 'john');
          if (john) assignedIds.push(john.id);
        }

        // If no specific needs detected, assign Brian as default for general financial queries
        if (assignedIds.length === 0) {
          const brian = analysts.find(a => a.id === 'brian');
          if (brian) assignedIds.push(brian.id);
        }

        return assignedIds;
      },

      getAvailableAnalysts: () => {
        return get().analysts.filter(a => a.status === 'available');
      },

      getAnalystById: (id: string) => {
        return get().analysts.find(a => a.id === id);
      },

      getTaskById: (id: string) => {
        return get().tasks.find(t => t.id === id);
      },

      updateTeamPerformance: () => {
        const state = get();
        const completedTasks = state.tasks.filter(t => t.status === 'completed');
        const totalTasks = state.tasks.length;
        
        if (totalTasks === 0) return;

        const totalResponseTime = completedTasks.reduce((sum, task) => {
          if (task.startedAt && task.completedAt) {
            const startTime = new Date(task.startedAt).getTime();
            const endTime = new Date(task.completedAt).getTime();
            return sum + (endTime - startTime) / 1000;
          }
          return sum;
        }, 0);

        const averageResponseTime = completedTasks.length > 0 
          ? totalResponseTime / completedTasks.length 
          : 0;

        const successRate = (completedTasks.length / totalTasks) * 100;

        set({
          teamPerformance: {
            totalTasks,
            completedTasks: completedTasks.length,
            averageResponseTime,
            successRate
          }
        });
      },

      getAnalystPerformance: (analystId: string) => {
        const analyst = get().getAnalystById(analystId);
        if (!analyst) {
          return {
            completedTasks: 0,
            successRate: 0,
            averageResponseTime: 0
          };
        }

        return {
          completedTasks: analyst.completedTasks,
          successRate: analyst.successRate,
          averageResponseTime: analyst.responseTime
        };
      }
    }),
    {
      name: 'analyst-team-store',
      partialize: (state) => ({
        tasks: state.tasks,
        messages: state.messages,
        teamPerformance: state.teamPerformance
      }),
      // Add custom storage to handle Date serialization
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          
          const parsed = JSON.parse(str);
          
          // Convert date strings back to Date objects for tasks
          if (parsed.state?.tasks) {
            parsed.state.tasks = parsed.state.tasks.map((task: any) => ({
              ...task,
              createdAt: task.createdAt ? new Date(task.createdAt) : undefined,
              startedAt: task.startedAt ? new Date(task.startedAt) : undefined,
              completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
            }));
          }
          
          // Convert date strings back to Date objects for messages
          if (parsed.state?.messages) {
            parsed.state.messages = parsed.state.messages.map((msg: any) => ({
              ...msg,
              timestamp: msg.timestamp ? new Date(msg.timestamp) : undefined,
            }));
          }
          
          return parsed;
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
    }
  )
); 