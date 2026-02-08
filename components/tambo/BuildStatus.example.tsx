import { BuildStatus, BuildStep } from './BuildStatus';

// Example 1: Build in progress
export function BuildInProgressExample() {
  const steps: BuildStep[] = [
    { id: 'validate', label: 'Validating input', status: 'complete' },
    { id: 'analyze', label: 'Analyzing project structure', status: 'complete' },
    { id: 'generate', label: 'Generating code', status: 'pending' },
    { id: 'write', label: 'Writing files', status: 'pending' },
    { id: 'install', label: 'Installing dependencies', status: 'pending' },
    { id: 'restart', label: 'Restarting dev server', status: 'pending' },
    { id: 'verify', label: 'Verifying deployment', status: 'pending' },
  ];

  const logs = [
    '[12:34:56] Starting code generation...',
    '[12:34:57] Validated input schema',
    '[12:34:58] Scanned project directory',
    '[12:34:59] Found 15 existing files',
    '[12:35:00] Generating LoginForm.tsx...',
    '[12:35:01] Generating Button.tsx...',
  ];

  return (
    <BuildStatus 
      steps={steps} 
      currentStep="generate" 
      logs={logs} 
    />
  );
}

// Example 2: Build completed successfully
export function BuildSuccessExample() {
  const steps: BuildStep[] = [
    { id: 'validate', label: 'Validating input', status: 'complete' },
    { id: 'analyze', label: 'Analyzing project structure', status: 'complete' },
    { id: 'generate', label: 'Generating code', status: 'complete' },
    { id: 'write', label: 'Writing files', status: 'complete' },
    { id: 'install', label: 'Installing dependencies', status: 'complete' },
    { id: 'restart', label: 'Restarting dev server', status: 'complete' },
    { id: 'verify', label: 'Verifying deployment', status: 'complete' },
  ];

  const logs = [
    '[12:34:56] Starting code generation...',
    '[12:34:57] ✓ Validated input schema',
    '[12:34:58] ✓ Scanned project directory',
    '[12:34:59] ✓ Found 15 existing files',
    '[12:35:00] ✓ Generated LoginForm.tsx',
    '[12:35:01] ✓ Generated Button.tsx',
    '[12:35:02] ✓ Wrote 2 files',
    '[12:35:03] ✓ Installed react-hook-form@7.45.0',
    '[12:35:05] ✓ Restarted Vite dev server',
    '[12:35:06] ✓ Deployment verified at https://sandbox-3000.e2b.dev',
    '[12:35:06] Build completed successfully!',
  ];

  return (
    <BuildStatus 
      steps={steps} 
      currentStep="verify" 
      logs={logs} 
    />
  );
}

// Example 3: Build failed with error
export function BuildErrorExample() {
  const steps: BuildStep[] = [
    { id: 'validate', label: 'Validating input', status: 'complete' },
    { id: 'analyze', label: 'Analyzing project structure', status: 'complete' },
    { id: 'generate', label: 'Generating code', status: 'complete' },
    { id: 'write', label: 'Writing files', status: 'error' },
    { id: 'install', label: 'Installing dependencies', status: 'pending' },
    { id: 'restart', label: 'Restarting dev server', status: 'pending' },
    { id: 'verify', label: 'Verifying deployment', status: 'pending' },
  ];

  const logs = [
    '[12:34:56] Starting code generation...',
    '[12:34:57] ✓ Validated input schema',
    '[12:34:58] ✓ Scanned project directory',
    '[12:34:59] ✓ Found 15 existing files',
    '[12:35:00] ✓ Generated LoginForm.tsx',
    '[12:35:01] ✓ Generated Button.tsx',
    '[12:35:02] Writing files...',
    '[12:35:03] ✗ Error: File already exists: src/components/Button.tsx',
    '[12:35:03] ✗ Cannot create file with action="create" on existing file',
    '[12:35:03] Rolling back transaction...',
    '[12:35:04] ✓ Rolled back all changes',
    '[12:35:04] Build failed. Please fix the error and try again.',
  ];

  return (
    <BuildStatus 
      steps={steps} 
      currentStep="write" 
      logs={logs} 
    />
  );
}

// Example 4: Minimal build (just starting)
export function BuildStartingExample() {
  const steps: BuildStep[] = [
    { id: 'validate', label: 'Validating input', status: 'pending' },
    { id: 'generate', label: 'Generating code', status: 'pending' },
    { id: 'write', label: 'Writing files', status: 'pending' },
  ];

  const logs = [
    '[12:34:56] Initializing code generation...',
  ];

  return (
    <BuildStatus 
      steps={steps} 
      currentStep="validate" 
      logs={logs} 
    />
  );
}

// Example 5: Build with dependency installation
export function BuildWithDependenciesExample() {
  const steps: BuildStep[] = [
    { id: 'validate', label: 'Validating input', status: 'complete' },
    { id: 'generate', label: 'Generating code', status: 'complete' },
    { id: 'write', label: 'Writing files', status: 'complete' },
    { id: 'install', label: 'Installing dependencies', status: 'pending' },
    { id: 'restart', label: 'Restarting dev server', status: 'pending' },
  ];

  const logs = [
    '[12:34:56] Starting code generation...',
    '[12:34:57] ✓ Validated input schema',
    '[12:35:00] ✓ Generated 3 files',
    '[12:35:02] ✓ Wrote all files successfully',
    '[12:35:03] Installing dependencies...',
    '[12:35:04] npm install react-hook-form zod @hookform/resolvers',
    '[12:35:05] Downloading packages...',
    '[12:35:08] Building dependencies...',
  ];

  return (
    <BuildStatus 
      steps={steps} 
      currentStep="install" 
      logs={logs} 
    />
  );
}
