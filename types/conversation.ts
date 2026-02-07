// Conversation tracking types for maintaining context across interactions

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  metadata?: {
    editedFiles?: string[]; // Files edited in this interaction
    addedPackages?: string[]; // Packages added in this interaction
    editType?: string; // Type of edit performed
    sandboxId?: string; // Sandbox ID at time of message
  };
}

export interface ConversationEdit {
  timestamp: number;
  userRequest: string;
  editType: string;
  targetFiles: string[];
  confidence: number;
  outcome: 'success' | 'partial' | 'failed';
  errorMessage?: string;
}

export interface ConversationContext {
  messages: ConversationMessage[];
  edits: ConversationEdit[];
  currentTopic?: string; // Current focus area (e.g., "header styling", "hero section")
  projectEvolution: {
    initialState?: string; // Description of initial project state
    majorChanges: Array<{
      timestamp: number;
      description: string;
      filesAffected: string[];
    }>;
  };
  userPreferences: {
    editStyle?: 'targeted' | 'comprehensive'; // How the user prefers edits
    commonRequests?: string[]; // Common patterns in user requests
    packagePreferences?: string[]; // Commonly used packages
  };
  // Requirements: 15.2, 15.6 - Sandbox state persistence
  sandboxState?: {
    sandboxId: string | null;
    url: string | null;
    createdAt: number;
    lastModified: number;
    modifications: Array<{
      timestamp: number;
      type: 'file_create' | 'file_update' | 'file_delete' | 'dependency_install' | 'config_change';
      description: string;
      files?: string[];
      packages?: string[];
    }>;
  };
}

export interface ConversationState {
  conversationId: string;
  startedAt: number;
  lastUpdated: number;
  context: ConversationContext;
}