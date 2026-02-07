/**
 * Conversation Manager
 * 
 * Utility functions for managing conversation history and context.
 * Requirements: 15.1 - Store all user messages and agent responses with timestamps
 */

import type { ConversationMessage } from '@/types/conversation';

/**
 * Add a message to the conversation history
 * Requirements: 15.1 - Store all user messages and agent responses
 */
export async function addMessageToHistory(
  role: 'user' | 'assistant',
  content: string,
  metadata?: ConversationMessage['metadata']
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const response = await fetch('/api/conversation-state', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'add-message',
        data: {
          message: {
            role,
            content,
            timestamp: Date.now(),
            metadata: metadata || {},
          },
        },
      }),
    });

    const result = await response.json();
    
    if (!result.success) {
      console.error('[conversation-manager] Failed to add message:', result.error);
      return { success: false, error: result.error };
    }

    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('[conversation-manager] Error adding message:', error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Get the complete conversation history
 * Requirements: 15.1 - Make history retrievable for context in subsequent interactions
 */
export async function getConversationHistory(): Promise<{
  success: boolean;
  messages?: ConversationMessage[];
  error?: string;
}> {
  try {
    const response = await fetch('/api/conversation-state');
    const result = await response.json();

    if (!result.success) {
      return { success: false, error: result.error };
    }

    if (!result.state) {
      return { success: true, messages: [] };
    }

    return { success: true, messages: result.state.context.messages };
  } catch (error) {
    console.error('[conversation-manager] Error getting history:', error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Get recent messages from conversation history
 * Requirements: 15.1 - Make history retrievable for context
 */
export async function getRecentMessages(count: number = 10): Promise<{
  success: boolean;
  messages?: ConversationMessage[];
  error?: string;
}> {
  const result = await getConversationHistory();
  
  if (!result.success || !result.messages) {
    return result;
  }

  return {
    success: true,
    messages: result.messages.slice(-count),
  };
}

/**
 * Reset conversation history
 * Requirements: 15.5 - Clear conversation history when user starts new project
 */
export async function resetConversationHistory(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const response = await fetch('/api/conversation-state', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'reset',
      }),
    });

    const result = await response.json();
    
    if (!result.success) {
      console.error('[conversation-manager] Failed to reset:', result.error);
      return { success: false, error: result.error };
    }

    return { success: true };
  } catch (error) {
    console.error('[conversation-manager] Error resetting:', error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Update sandbox state in conversation context
 * Requirements: 15.2, 15.6 - Maintain sandbox ID and track modifications
 */
export async function updateSandboxState(
  sandboxId?: string | null,
  url?: string | null,
  modification?: {
    type: 'file_create' | 'file_update' | 'file_delete' | 'dependency_install' | 'config_change';
    description: string;
    files?: string[];
    packages?: string[];
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/conversation-state', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'update-sandbox',
        data: {
          sandboxId,
          url,
          modification,
        },
      }),
    });

    const result = await response.json();
    
    if (!result.success) {
      console.error('[conversation-manager] Failed to update sandbox state:', result.error);
      return { success: false, error: result.error };
    }

    return { success: true };
  } catch (error) {
    console.error('[conversation-manager] Error updating sandbox state:', error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Get current sandbox state from conversation context
 * Requirements: 15.2, 15.6 - Allow querying current sandbox state
 */
export async function getSandboxState(): Promise<{
  success: boolean;
  sandboxState?: {
    sandboxId: string | null;
    url: string | null;
    createdAt: number;
    lastModified: number;
    modifications: Array<{
      timestamp: number;
      type: string;
      description: string;
      files?: string[];
      packages?: string[];
    }>;
  };
  error?: string;
}> {
  try {
    const response = await fetch('/api/conversation-state');
    const result = await response.json();

    if (!result.success) {
      return { success: false, error: result.error };
    }

    if (!result.state || !result.state.context.sandboxState) {
      return { 
        success: true, 
        sandboxState: {
          sandboxId: null,
          url: null,
          createdAt: Date.now(),
          lastModified: Date.now(),
          modifications: []
        }
      };
    }

    return { success: true, sandboxState: result.state.context.sandboxState };
  } catch (error) {
    console.error('[conversation-manager] Error getting sandbox state:', error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Track a modification to the sandbox
 * Requirements: 15.2, 15.6 - Track all modifications made to sandbox
 */
export async function trackSandboxModification(
  type: 'file_create' | 'file_update' | 'file_delete' | 'dependency_install' | 'config_change',
  description: string,
  files?: string[],
  packages?: string[]
): Promise<{ success: boolean; error?: string }> {
  return updateSandboxState(undefined, undefined, {
    type,
    description,
    files,
    packages,
  });
}

/**
 * Start a new project by resetting conversation context
 * Requirements: 15.5 - Clear conversation history when user starts new project
 * 
 * This will:
 * - Clear conversation history
 * - Preserve old sandbox ID for potential recovery
 * - Initialize empty sandbox state for new project
 */
export async function startNewProject(): Promise<{
  success: boolean;
  previousSandboxId?: string | null;
  error?: string;
}> {
  try {
    const response = await fetch('/api/conversation-state', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'reset',
      }),
    });

    const result = await response.json();
    
    if (!result.success) {
      console.error('[conversation-manager] Failed to start new project:', result.error);
      return { success: false, error: result.error };
    }

    return { 
      success: true, 
      previousSandboxId: result.previousSandboxId 
    };
  } catch (error) {
    console.error('[conversation-manager] Error starting new project:', error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Create a new sandbox for a new project
 * Requirements: 15.5 - Create new sandbox for new project
 * 
 * This will:
 * - Create a new E2B sandbox
 * - Update conversation state with new sandbox ID
 * - Return the new sandbox URL
 */
export async function createNewProjectSandbox(): Promise<{
  success: boolean;
  sandboxId?: string;
  url?: string;
  error?: string;
}> {
  try {
    // Create new sandbox
    const response = await fetch('/api/create-ai-sandbox', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    
    if (!result.success) {
      console.error('[conversation-manager] Failed to create new sandbox:', result.error);
      return { success: false, error: result.error };
    }

    // Update conversation state with new sandbox
    await updateSandboxState(result.sandboxId, result.url);

    return { 
      success: true, 
      sandboxId: result.sandboxId,
      url: result.url
    };
  } catch (error) {
    console.error('[conversation-manager] Error creating new sandbox:', error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Complete workflow for starting a new project
 * Requirements: 15.5 - Clear conversation history and create new sandbox
 * 
 * This combines:
 * 1. Resetting conversation context (preserving old sandbox ID)
 * 2. Creating a new sandbox
 * 3. Updating conversation state with new sandbox
 */
export async function startNewProjectWithSandbox(): Promise<{
  success: boolean;
  sandboxId?: string;
  url?: string;
  previousSandboxId?: string | null;
  error?: string;
}> {
  // Reset conversation context
  const resetResult = await startNewProject();
  
  if (!resetResult.success) {
    return { success: false, error: resetResult.error };
  }

  // Create new sandbox
  const sandboxResult = await createNewProjectSandbox();
  
  if (!sandboxResult.success) {
    return { 
      success: false, 
      error: sandboxResult.error,
      previousSandboxId: resetResult.previousSandboxId
    };
  }

  return {
    success: true,
    sandboxId: sandboxResult.sandboxId,
    url: sandboxResult.url,
    previousSandboxId: resetResult.previousSandboxId,
  };
}
