import { useState, useEffect } from 'react';
import { Loader2, ExternalLink, RefreshCw, Terminal, AlertCircle, CheckCircle } from 'lucide-react';

type ViewMode = 'desktop' | 'tablet' | 'mobile';
type SandboxStatus = 'active' | 'building' | 'error' | 'stopped';

interface SandboxErrorDetails {
  code: string;
  message: string;
  details?: Record<string, any>;
  recovery?: {
    action: string;
    description?: string;
    params?: Record<string, any>;
  };
}

interface SandboxPreviewProps {
  sandboxId: string;
  port: number;
  type: 'vite' | 'nextjs' | 'console';
  output?: string;
  isLoading?: boolean;
  // New interactable props (Task 5.3)
  viewMode?: ViewMode;
  showConsole?: boolean;
  url?: string;
  status?: SandboxStatus;
  errorDetails?: SandboxErrorDetails;
}

export default function SandboxPreview({ 
  sandboxId, 
  port, 
  type, 
  output,
  isLoading = false,
  // New interactable props with defaults
  viewMode = 'desktop',
  showConsole: showConsoleProp,
  url: urlProp,
  status = 'active',
  errorDetails,
}: SandboxPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [showConsole, setShowConsole] = useState(showConsoleProp ?? false);
  const [iframeKey, setIframeKey] = useState(0);

  // Sync showConsole with prop when it changes
  useEffect(() => {
    if (showConsoleProp !== undefined) {
      setShowConsole(showConsoleProp);
    }
  }, [showConsoleProp]);

  useEffect(() => {
    if (sandboxId && type !== 'console') {
      // Use the url prop if provided, otherwise construct from sandboxId and port
      const baseUrl = urlProp || `https://${sandboxId}-${port}.e2b.dev`;
      setPreviewUrl(baseUrl);
    }
  }, [sandboxId, port, type, urlProp]);

  const handleRefresh = () => {
    setIframeKey(prev => prev + 1);
  };

  // Get viewport dimensions based on viewMode
  const getViewportDimensions = () => {
    switch (viewMode) {
      case 'mobile':
        return { width: '375px', height: '667px' }; // iPhone SE dimensions
      case 'tablet':
        return { width: '768px', height: '1024px' }; // iPad dimensions
      case 'desktop':
      default:
        return { width: '100%', height: '600px' };
    }
  };

  // Get status indicator
  const getStatusIndicator = () => {
    switch (status) {
      case 'active':
        return (
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Active</span>
          </div>
        );
      case 'building':
        return (
          <div className="flex items-center gap-2 text-blue-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Building</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Error</span>
          </div>
        );
      case 'stopped':
        return (
          <div className="flex items-center gap-2 text-gray-400">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Stopped</span>
          </div>
        );
    }
  };

  const dimensions = getViewportDimensions();

  if (type === 'console') {
    return (
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="font-mono text-sm whitespace-pre-wrap text-gray-300">
          {output || 'No output yet...'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Preview Controls */}
      <div className="flex items-center justify-between bg-gray-800 rounded-lg p-3 border border-gray-700">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">
            {type === 'vite' ? '⚡ Vite' : '▲ Next.js'} Preview
          </span>
          <code className="text-xs bg-gray-900 px-2 py-1 rounded text-blue-400">
            {previewUrl}
          </code>
          {getStatusIndicator()}
        </div>
        <div className="flex items-center gap-2">
          {/* View Mode Selector */}
          <div className="flex items-center gap-1 bg-gray-900 rounded p-1">
            <button
              onClick={() => {/* viewMode is controlled by parent */}}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                viewMode === 'desktop' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Desktop view"
            >
              Desktop
            </button>
            <button
              onClick={() => {/* viewMode is controlled by parent */}}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                viewMode === 'tablet' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Tablet view"
            >
              Tablet
            </button>
            <button
              onClick={() => {/* viewMode is controlled by parent */}}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                viewMode === 'mobile' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Mobile view"
            >
              Mobile
            </button>
          </div>
          <button
            onClick={() => setShowConsole(!showConsole)}
            className={`p-2 rounded transition-colors ${
              showConsole ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'
            }`}
            title="Toggle console"
          >
            <Terminal className="w-4 h-4" />
          </button>
          <button
            onClick={handleRefresh}
            className="p-2 hover:bg-gray-700 rounded transition-colors"
            title="Refresh preview"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-gray-700 rounded transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Main Preview */}
      <div className="relative bg-gray-900 rounded-lg overflow-hidden border border-gray-700 flex justify-center items-start">
        {(isLoading || status === 'building') && (
          <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center z-10">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-400">
                {type === 'vite' ? 'Starting Vite dev server...' : 'Starting Next.js dev server...'}
              </p>
            </div>
          </div>
        )}
        
        {status === 'error' && (
          <div className="absolute inset-0 bg-gray-900/95 flex items-center justify-center z-10 p-6">
            <div className="max-w-md w-full bg-gray-800 rounded-lg p-6 border border-red-500/50">
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-400 mb-1">Sandbox Error</h3>
                  {errorDetails ? (
                    <>
                      <p className="text-sm text-gray-300 mb-2">{errorDetails.message}</p>
                      {errorDetails.code && (
                        <p className="text-xs text-gray-500 font-mono mb-3">
                          Error Code: {errorDetails.code}
                        </p>
                      )}
                      {errorDetails.details && Object.keys(errorDetails.details).length > 0 && (
                        <div className="mb-3 p-3 bg-gray-900 rounded border border-gray-700">
                          <p className="text-xs font-semibold text-gray-400 mb-2">Details:</p>
                          <div className="space-y-1">
                            {Object.entries(errorDetails.details).map(([key, value]) => (
                              <div key={key} className="text-xs">
                                <span className="text-gray-500">{key}:</span>{' '}
                                <span className="text-gray-300 font-mono">
                                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {errorDetails.recovery && (
                        <div className="p-3 bg-blue-900/20 rounded border border-blue-500/30">
                          <p className="text-xs font-semibold text-blue-400 mb-1">
                            Suggested Action: {errorDetails.recovery.action}
                          </p>
                          {errorDetails.recovery.description && (
                            <p className="text-xs text-gray-400">
                              {errorDetails.recovery.description}
                            </p>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-400">Check console for details</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {status === 'stopped' && (
          <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center z-10">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Sandbox Stopped</p>
            </div>
          </div>
        )}
        
        <iframe
          key={iframeKey}
          src={previewUrl}
          style={{
            width: dimensions.width,
            height: dimensions.height,
            maxWidth: '100%',
          }}
          className="bg-white"
          title={`${type} preview`}
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      </div>

      {/* Console Output (Toggle) */}
      {showConsole && output && (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-400">Console Output</span>
          </div>
          <div className="font-mono text-xs whitespace-pre-wrap text-gray-300 max-h-48 overflow-y-auto">
            {output}
          </div>
        </div>
      )}
    </div>
  );
}