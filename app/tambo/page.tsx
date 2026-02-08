'use client';

import React, { useState } from 'react';
import { TamboProvider, useTamboThread, useTamboThreadInput, useTamboSuggestions } from '@tambo-ai/react';
import { tamboComponents, tamboTools, tamboContextHelpers } from '@/lib/tambo-config';
import { FiSend, FiLoader } from '@/lib/icons';

function TamboChatInterface() {
  const { thread } = useTamboThread();
  const { value, setValue, submit, isPending } = useTamboThreadInput();
  const { suggestions, accept } = useTamboSuggestions({
    maxSuggestions: 3,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !isPending) {
      submit();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-950 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Tambo AI Demo</h1>
            <p className="text-sm text-gray-400">Generative UI Chat Interface</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-green-900/20 border border-green-700 rounded-full text-sm text-green-400">
              ✓ Tambo Connected
            </span>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {thread.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4 max-w-2xl">
              <div className="text-6xl mb-4">✨</div>
              <h2 className="text-2xl font-bold text-white">
                Welcome to Tambo AI Demo
              </h2>
              <p className="text-gray-400">
                Try asking for charts, data cards, or project summaries.
                Tambo will dynamically render components based on your requests.
              </p>
              <div className="pt-4 space-y-2">
                <p className="text-sm text-gray-500 font-semibold">Try these examples:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                    "Show me a chart of sales data",
                    "Create a data card for website visitors",
                    "Display project summary",
                  ].map((example, idx) => (
                    <button
                      key={idx}
                      onClick={() => setValue(example)}
                      className="px-3 py-1.5 bg-blue-900/20 border border-blue-700 rounded-md text-sm text-blue-300 hover:bg-blue-900/30 transition-colors"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          thread.messages.map((message: any) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`rounded-lg px-4 py-3 max-w-2xl ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-900 text-gray-100 border border-gray-700'
                }`}
              >
                {/* Text Content */}
                {Array.isArray(message.content) ? (
                  message.content.map((part: any, i: number) =>
                    part.type === 'text' ? (
                      <p key={i} className="whitespace-pre-wrap">
                        {part.text}
                      </p>
                    ) : null
                  )
                ) : (
                  <p className="whitespace-pre-wrap">{String(message.content)}</p>
                )}

                {/* Rendered Component */}
                {message.renderedComponent && (
                  <div className="mt-4">
                    {message.renderedComponent}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {isPending && (
          <div className="flex justify-start">
            <div className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-3">
              <div className="flex items-center gap-2 text-gray-400">
                <FiLoader className="animate-spin" />
                <span>Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && !isPending && (
        <div className="px-6 pb-2">
          <div className="flex gap-2 flex-wrap">
            {suggestions.map((suggestion: any) => (
              <button
                key={suggestion.id}
                onClick={() => accept(suggestion)}
                className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-md text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                title={suggestion.title}
              >
                {suggestion.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <div className="border-t border-gray-800 bg-gray-950 px-6 py-4">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Ask Tambo to generate components..."
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isPending}
          />
          <button
            type="submit"
            disabled={isPending || !value.trim()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors flex items-center gap-2"
          >
            {isPending ? (
              <>
                <FiLoader className="animate-spin" />
                Sending
              </>
            ) : (
              <>
                <FiSend />
                Send
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function TamboDemoPage() {
  const [apiKeyError, setApiKeyError] = useState(false);
  const [sandboxId, setSandboxId] = useState<string | null>(null);
  
  const apiKey = process.env.NEXT_PUBLIC_TAMBO_API_KEY;
  
  // Fetch sandbox ID on mount
  React.useEffect(() => {
    let attempts = 0;
    const maxAttempts = 12; // Stop after 1 minute (12 * 5s)
    
    const fetchSandboxStatus = async () => {
      try {
        const response = await fetch('/api/sandbox-status');
        const data = await response.json();
        
        if (data.success && data.sandboxData?.sandboxId) {
          setSandboxId(data.sandboxData.sandboxId);
          console.log('[tambo] Sandbox ID loaded:', data.sandboxData.sandboxId);
          return true; // Signal success
        } else {
          console.log('[tambo] No active sandbox found');
          return false;
        }
      } catch (error) {
        console.error('[tambo] Failed to fetch sandbox status:', error);
        return false;
      }
    };
    
    // Initial fetch
    fetchSandboxStatus();
    
    // Poll for sandbox status with exponential backoff
    const interval = setInterval(async () => {
      attempts++;
      
      const success = await fetchSandboxStatus();
      
      // Stop polling if sandbox found or max attempts reached
      if (success || attempts >= maxAttempts) {
        clearInterval(interval);
        if (attempts >= maxAttempts) {
          console.log('[tambo] Stopped polling after max attempts');
        }
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  if (!apiKey) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-center space-y-4 max-w-md p-8 bg-red-900/20 border border-red-700 rounded-lg">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-white">Tambo API Key Missing</h2>
          <p className="text-gray-300">
            Please add <code className="bg-gray-800 px-2 py-1 rounded">NEXT_PUBLIC_TAMBO_API_KEY</code> to your <code className="bg-gray-800 px-2 py-1 rounded">.env.local</code> file.
          </p>
          <div className="text-sm text-gray-400 mt-4">
            Get your API key from{' '}
            <a
              href="https://console.tambo.co"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              console.tambo.co
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Configure MCP servers array with local MCP server
  // Requirements: 5.6 - MCP Server Configuration
  const mcpServers = sandboxId ? [
    {
      name: 'e2b-sandbox',
      url: '/api/mcp',
      headers: {
        'x-sandbox-id': sandboxId,
      },
    },
  ] : [];

  return (
    <TamboProvider
      apiKey={apiKey}
      components={tamboComponents}
      tools={tamboTools}
      contextHelpers={tamboContextHelpers}
      mcpServers={mcpServers}
    >
      <TamboChatInterface />
    </TamboProvider>
  );
}
