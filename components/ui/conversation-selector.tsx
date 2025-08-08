"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  Edit3, 
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useConversationStore, type Conversation } from '@/lib/store/conversation-store';
import { cn } from '@/lib/utils';

interface ConversationSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectConversation: (conversationId: string) => void;
}

export function ConversationSelector({ 
  isOpen, 
  onClose, 
  onSelectConversation 
}: ConversationSelectorProps) {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  
  const {
    conversations,
    currentConversationId,
    createConversation,
    setCurrentConversation,
    updateConversationTitle,
    deleteConversation,
    clearConversations
  } = useConversationStore();

  const handleCreateConversation = () => {
    const newId = createConversation('NEW', 'New Analysis');
    onSelectConversation(newId);
    onClose();
  };

  const handleSelectConversation = (conversationId: string) => {
    setCurrentConversation(conversationId);
    onSelectConversation(conversationId);
    onClose();
  };

  const handleEditTitle = (conversation: Conversation) => {
    setIsEditing(conversation.id);
    setEditTitle(conversation.title);
  };

  const handleSaveTitle = (conversationId: string) => {
    if (editTitle.trim()) {
      updateConversationTitle(conversationId, editTitle.trim());
    }
    setIsEditing(null);
    setEditTitle('');
  };

  const handleDeleteConversation = (conversationId: string) => {
    deleteConversation(conversationId);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-background border-l border-border shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          <h3 className="font-semibold">Conversations</h3>
          <Badge variant="secondary" className="text-xs">
            {conversations.length}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-8 w-8"
        >
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {/* New Conversation Button */}
        <div className="p-4 border-b border-border">
          <Button 
            onClick={handleCreateConversation}
            className="w-full"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Conversation
          </Button>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {conversations.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No conversations yet</p>
                <p className="text-xs">Start a new conversation to begin analyzing</p>
              </div>
            ) : (
              conversations.map((conversation) => (
                <Card 
                  key={conversation.id}
                  className={cn(
                    "cursor-pointer transition-colors",
                    currentConversationId === conversation.id
                      ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
                      : "hover:bg-muted/50"
                  )}
                  onClick={() => handleSelectConversation(conversation.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        {isEditing === conversation.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleSaveTitle(conversation.id);
                                }
                              }}
                              onBlur={() => handleSaveTitle(conversation.id)}
                              className="h-6 text-sm"
                              autoFocus
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm truncate">
                              {conversation.title}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {conversation.symbol}
                            </Badge>
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-muted-foreground">
                            {conversation.messages.length} messages
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(conversation.updatedAt)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 ml-2">
                        {isEditing !== conversation.id && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditTitle(conversation);
                              }}
                            >
                              <Edit3 className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteConversation(conversation.id);
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        {conversations.length > 0 && (
          <div className="p-4 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={clearConversations}
              className="w-full text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All Conversations
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 