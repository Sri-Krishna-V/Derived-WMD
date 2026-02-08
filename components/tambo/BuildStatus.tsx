import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export interface BuildStep {
  id: string;
  label: string;
  status: 'pending' | 'complete' | 'error';
}

export interface BuildStatusProps {
  steps: BuildStep[];
  currentStep: string;
  logs: string[];
}

export const BuildStatus = ({ steps, currentStep, logs }: BuildStatusProps) => {
  return (
    <div className="p-4 bg-gray-900 rounded-lg font-mono text-sm border border-gray-700">
      {/* Step List */}
      <div className="space-y-2 mb-4">
        {steps.map((step) => (
          <div key={step.id} className="flex items-center gap-2">
            {/* Status Icon */}
            {step.status === 'pending' && (
              <Loader2 className="w-4 h-4 text-blue-400 animate-spin flex-shrink-0" />
            )}
            {step.status === 'complete' && (
              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
            )}
            {step.status === 'error' && (
              <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            )}
            
            {/* Step Label */}
            <span
              className={
                step.id === currentStep
                  ? 'text-blue-400 font-semibold'
                  : step.status === 'complete'
                  ? 'text-gray-400'
                  : step.status === 'error'
                  ? 'text-red-400'
                  : 'text-gray-500'
              }
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Log Viewer */}
      {logs.length > 0 && (
        <div className="mt-4 h-32 overflow-y-auto bg-black p-2 rounded border border-gray-700 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          {logs.map((log, i) => (
            <div key={i} className="text-gray-300 text-xs leading-relaxed">
              {log}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BuildStatus;
