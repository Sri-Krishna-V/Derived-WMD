/**
 * Server-side conversation state management
 * Provides direct in-process access to conversation state without HTTP overhead
 */

import type { ConversationState, ConversationMessage, SandboxModification } from '@/types/conversation';

// Maximum number of messages to keep in memory
const MAX_MESSAGES = 100;

/**
 * Add a message to conversation state
 */
export function addMessage(message: ConversationMessage): void {
  if (!global.conversationState) {
    global.conversationState = {
      conversationId: `conv-${Date.now()}`,
      startedAt: Date.now(),
      lastUpdated: Date.now(),
      context: {
        messages: [],
        edits: [],
        projectEvolution: { majorChanges: [] },
        userPreferences: {}
      }
    };
  }

  global.conversationState.context.messages.push(message);
  global.conversationState.lastUpdated = Date.now();

  // Trim messages if exceeding limit
  if (global.conversationState.context.messages.length > MAX_MESSAGES) {
    global.conversationState.context.messages = 
      global.conversationState.context.messages.slice(-MAX_MESSAGES);
  }

  console.log('[conversation-state] Added message:', message.id, message.role);
}

/**
 * Update sandbox state
 */
export function updateSandbox(data: {
  sandboxId?: string;
  url?: string;
  modification?: SandboxModification;
}): void {
  if (!global.conversationState) {
    global.conversationState = {
      conversationId: `conv-${Date.now()}`,
      startedAt: Date.now(),
      lastUpdated: Date.now(),
      context: {
        messages: [],
        edits: [],
        projectEvolution: { majorChanges: [] },
        userPreferences: {}
      }
    };
  }

  if (data.sandboxId) {
    global.conversationState.sandboxId = data.sandboxId;
  }

  if (data.url) {
    global.conversationState.sandboxUrl = data.url;
  }

  if (data.modification) {
    if (!global.conversationState.sandboxState) {
      global.conversationState.sandboxState = {
        modifications: [],
        dependencies: [],
        errors: []
      };
    }
    global.conversationState.sandboxState.modifications.push(data.modification);
  }

  global.conversationState.lastUpdated = Date.now();
  console.log('[conversation-state] Updated sandbox state');
}

/**
 * Get current conversation state
 */
export function getConversationState(): ConversationState | null {
  return global.conversationState || null;
}
