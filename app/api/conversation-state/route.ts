import { NextRequest, NextResponse } from 'next/server';
import type { ConversationState, ConversationMessage } from '@/types/conversation';

declare global {
  var conversationState: ConversationState | null;
}

// GET: Retrieve current conversation state
export async function GET() {
  try {
    if (!global.conversationState) {
      return NextResponse.json({
        success: true,
        state: null,
        message: 'No active conversation'
      });
    }
    
    return NextResponse.json({
      success: true,
      state: global.conversationState
    });
  } catch (error) {
    console.error('[conversation-state] Error getting state:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}

// POST: Reset or update conversation state
export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json();
    
    switch (action) {
      case 'reset':
        // Requirements: 15.5 - Clear conversation history when user starts new project
        // Preserve old sandbox ID for potential recovery
        const oldSandboxId = global.conversationState?.context.sandboxState?.sandboxId || null;
        
        global.conversationState = {
          conversationId: `conv-${Date.now()}`,
          startedAt: Date.now(),
          lastUpdated: Date.now(),
          context: {
            messages: [],
            edits: [],
            projectEvolution: { majorChanges: [] },
            userPreferences: {},
            // Initialize empty sandbox state for new project
            sandboxState: {
              sandboxId: null,
              url: null,
              createdAt: Date.now(),
              lastModified: Date.now(),
              modifications: []
            }
          }
        };
        
        console.log('[conversation-state] Reset conversation state');
        if (oldSandboxId) {
          console.log('[conversation-state] Previous sandbox ID preserved:', oldSandboxId);
        }
        
        return NextResponse.json({
          success: true,
          message: 'Conversation state reset',
          state: global.conversationState,
          previousSandboxId: oldSandboxId
        });
        
      case 'clear-old':
        // Clear old conversation data but keep recent context
        if (!global.conversationState) {
          return NextResponse.json({
            success: false,
            error: 'No active conversation to clear'
          }, { status: 400 });
        }
        
        // Keep only recent data
        global.conversationState.context.messages = global.conversationState.context.messages.slice(-5);
        global.conversationState.context.edits = global.conversationState.context.edits.slice(-3);
        global.conversationState.context.projectEvolution.majorChanges = 
          global.conversationState.context.projectEvolution.majorChanges.slice(-2);
        
        console.log('[conversation-state] Cleared old conversation data');
        
        return NextResponse.json({
          success: true,
          message: 'Old conversation data cleared',
          state: global.conversationState
        });
        
      case 'update':
        if (!global.conversationState) {
          return NextResponse.json({
            success: false,
            error: 'No active conversation to update'
          }, { status: 400 });
        }
        
        // Update specific fields if provided
        if (data) {
          if (data.currentTopic) {
            global.conversationState.context.currentTopic = data.currentTopic;
          }
          if (data.userPreferences) {
            global.conversationState.context.userPreferences = {
              ...global.conversationState.context.userPreferences,
              ...data.userPreferences
            };
          }
          
          global.conversationState.lastUpdated = Date.now();
        }
        
        return NextResponse.json({
          success: true,
          message: 'Conversation state updated',
          state: global.conversationState
        });
      
      case 'add-message':
        // Requirements: 15.1 - Store all user messages and agent responses
        if (!global.conversationState) {
          // Initialize if not exists
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
        
        if (!data || !data.message) {
          return NextResponse.json({
            success: false,
            error: 'Message data is required'
          }, { status: 400 });
        }
        
        const message: ConversationMessage = {
          id: data.message.id || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          role: data.message.role,
          content: data.message.content,
          timestamp: data.message.timestamp || Date.now(),
          metadata: data.message.metadata || {}
        };
        
        global.conversationState.context.messages.push(message);
        global.conversationState.lastUpdated = Date.now();
        
        // Prevent unbounded memory growth - keep last 100 messages
        const MAX_MESSAGES = 100;
        if (global.conversationState.context.messages.length > MAX_MESSAGES) {
          global.conversationState.context.messages = 
            global.conversationState.context.messages.slice(-MAX_MESSAGES);
          console.log('[conversation-state] Trimmed messages to last', MAX_MESSAGES);
        }
        
        console.log('[conversation-state] Added message:', message.id, message.role);
        
        return NextResponse.json({
          success: true,
          message: 'Message added to conversation history',
          messageId: message.id,
          totalMessages: global.conversationState.context.messages.length
        });
      
      case 'update-sandbox':
        // Requirements: 15.2, 15.6 - Maintain sandbox ID and track modifications
        if (!global.conversationState) {
          // Initialize if not exists
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
        
        if (!data) {
          return NextResponse.json({
            success: false,
            error: 'Sandbox data is required'
          }, { status: 400 });
        }
        
        // Initialize sandbox state if not exists
        if (!global.conversationState.context.sandboxState) {
          global.conversationState.context.sandboxState = {
            sandboxId: null,
            url: null,
            createdAt: Date.now(),
            lastModified: Date.now(),
            modifications: []
          };
        }
        
        // Update sandbox ID and URL if provided
        if (data.sandboxId !== undefined) {
          global.conversationState.context.sandboxState.sandboxId = data.sandboxId;
        }
        if (data.url !== undefined) {
          global.conversationState.context.sandboxState.url = data.url;
        }
        
        // Add modification if provided
        if (data.modification) {
          global.conversationState.context.sandboxState.modifications.push({
            timestamp: Date.now(),
            type: data.modification.type,
            description: data.modification.description,
            files: data.modification.files,
            packages: data.modification.packages
          });
        }
        
        global.conversationState.context.sandboxState.lastModified = Date.now();
        global.conversationState.lastUpdated = Date.now();
        
        console.log('[conversation-state] Updated sandbox state:', 
          global.conversationState.context.sandboxState.sandboxId);
        
        return NextResponse.json({
          success: true,
          message: 'Sandbox state updated',
          sandboxState: global.conversationState.context.sandboxState
        });
        
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use "reset", "update", "clear-old", "add-message", or "update-sandbox"'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('[conversation-state] Error:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}

// DELETE: Clear conversation state
export async function DELETE() {
  try {
    global.conversationState = null;
    
    console.log('[conversation-state] Cleared conversation state');
    
    return NextResponse.json({
      success: true,
      message: 'Conversation state cleared'
    });
  } catch (error) {
    console.error('[conversation-state] Error clearing state:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}