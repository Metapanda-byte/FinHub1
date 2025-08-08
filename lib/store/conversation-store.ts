import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date | string;
  suggestions?: string[];
  chartData?: any;
}

export interface Conversation {
  id: string;
  title: string;
  symbol: string;
  companyName: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface ConversationStore {
  conversations: Conversation[];
  currentConversationId: string | null;
  
  // Actions
  createConversation: (symbol: string, companyName: string) => string;
  setCurrentConversation: (id: string) => void;
  addMessage: (conversationId: string, message: Message) => void;
  updateConversationTitle: (conversationId: string, title: string) => void;
  deleteConversation: (conversationId: string) => void;
  clearConversations: () => void;
  
  // Getters
  getCurrentConversation: () => Conversation | null;
  getConversation: (id: string) => Conversation | null;
}

export const useConversationStore = create<ConversationStore>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentConversationId: null,

      createConversation: (symbol: string, companyName: string) => {
        const id = `conv_${Date.now()}`;
        const conversation: Conversation = {
          id,
          title: `Analysis of ${companyName || symbol}`,
          symbol,
          companyName,
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };

        set((state) => ({
          conversations: [...state.conversations, conversation],
          currentConversationId: id
        }));

        return id;
      },

      setCurrentConversation: (id: string) => {
        set({ currentConversationId: id });
      },

      addMessage: (conversationId: string, message: Message) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: [...conv.messages, message],
                  updatedAt: new Date()
                }
              : conv
          )
        }));
      },

      updateConversationTitle: (conversationId: string, title: string) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId
              ? { ...conv, title, updatedAt: new Date() }
              : conv
          )
        }));
      },

      deleteConversation: (conversationId: string) => {
        set((state) => {
          const newConversations = state.conversations.filter(
            (conv) => conv.id !== conversationId
          );
          const newCurrentId = 
            state.currentConversationId === conversationId
              ? newConversations.length > 0
                ? newConversations[0].id
                : null
              : state.currentConversationId;

          return {
            conversations: newConversations,
            currentConversationId: newCurrentId
          };
        });
      },

      clearConversations: () => {
        set({ conversations: [], currentConversationId: null });
      },

      getCurrentConversation: () => {
        const state = get();
        return state.conversations.find(
          (conv) => conv.id === state.currentConversationId
        ) || null;
      },

      getConversation: (id: string) => {
        const state = get();
        return state.conversations.find((conv) => conv.id === id) || null;
      }
    }),
    {
      name: 'analyst-conversations',
      partialize: (state) => ({
        conversations: state.conversations,
        currentConversationId: state.currentConversationId
      })
    }
  )
); 