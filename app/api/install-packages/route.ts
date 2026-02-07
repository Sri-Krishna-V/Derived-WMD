import { NextRequest, NextResponse } from 'next/server';
import { Sandbox } from '@e2b/code-interpreter';
import {
  createValidationError,
  createSandboxError,
  createPackageInstallationError,
  ErrorCodes,
} from '@/lib/types/errors';

declare global {
  var activeSandbox: any;
  var sandboxData: any;
}

/**
 * Parse npm error output to identify common issues (Requirement 11.7)
 * Returns a structured error with issue type and details
 */
function parseNpmError(npmError: string, packageName: string): {
  issueType: string;
  details: string;
  suggestion: string;
} {
  const errorLower = npmError.toLowerCase();
  
  // Package not found (404)
  if (errorLower.includes('404') || errorLower.includes('not found') || errorLower.includes('e404')) {
    return {
      issueType: 'PACKAGE_NOT_FOUND',
      details: `Package '${packageName}' does not exist in the npm registry`,
      suggestion: 'Check the package name for typos or verify it exists on npmjs.com',
    };
  }
  
  // Version conflict / peer dependency issues
  if (errorLower.includes('eresolve') || errorLower.includes('peer dep') || errorLower.includes('conflict')) {
    return {
      issueType: 'VERSION_CONFLICT',
      details: `Dependency version conflict detected for '${packageName}'`,
      suggestion: 'Try using --legacy-peer-deps flag or update conflicting dependencies',
    };
  }
  
  // Invalid version specifier
  if (errorLower.includes('invalid version') || errorLower.includes('etarget')) {
    return {
      issueType: 'INVALID_VERSION',
      details: `Invalid version specified for '${packageName}'`,
      suggestion: 'Check the version format (e.g., "1.0.0" or "^1.0.0")',
    };
  }
  
  // Network/registry errors
  if (errorLower.includes('enotfound') || errorLower.includes('network') || errorLower.includes('timeout')) {
    return {
      issueType: 'NETWORK_ERROR',
      details: `Network error while fetching '${packageName}'`,
      suggestion: 'Check internet connection or try again later',
    };
  }
  
  // Permission errors
  if (errorLower.includes('eacces') || errorLower.includes('permission')) {
    return {
      issueType: 'PERMISSION_ERROR',
      details: `Permission denied while installing '${packageName}'`,
      suggestion: 'Check file system permissions in the sandbox',
    };
  }
  
  // Disk space errors
  if (errorLower.includes('enospc') || errorLower.includes('no space')) {
    return {
      issueType: 'DISK_SPACE_ERROR',
      details: `Insufficient disk space to install '${packageName}'`,
      suggestion: 'Free up disk space or reduce the number of dependencies',
    };
  }
  
  // Deprecated package
  if (errorLower.includes('deprecated')) {
    return {
      issueType: 'DEPRECATED_PACKAGE',
      details: `Package '${packageName}' is deprecated`,
      suggestion: 'Consider using an alternative package recommended by the maintainer',
    };
  }
  
  // Generic error
  return {
    issueType: 'INSTALLATION_ERROR',
    details: `Failed to install '${packageName}'`,
    suggestion: 'Check the npm error output for more details',
  };
}

/**
 * Synchronous package installation for non-streaming mode
 * Used by the manageSandbox tool for structured JSON responses
 */
async function installPackagesSync(sandbox: any, packages: string[]): Promise<NextResponse> {
  // Track installed packages for conversation state update
  let installedPackages: string[] = [];
  
  try {
    console.log('[install-packages-sync] Installing packages:', packages);
    
    // Kill any existing Vite process first
    await sandbox.runCode(`
import subprocess
import os
import signal

# Try to kill any existing Vite process
try:
    with open('/tmp/vite-process.pid', 'r') as f:
        pid = int(f.read().strip())
        os.kill(pid, signal.SIGTERM)
        print("Stopped existing Vite process")
except:
    print("No existing Vite process found")
    `);
    
    // Check which packages are already installed
    const checkResult = await sandbox.runCode(`
import os
import json

os.chdir('/home/user/app')

# Read package.json to check installed packages
try:
    with open('package.json', 'r') as f:
        package_json = json.load(f)
    
    dependencies = package_json.get('dependencies', {})
    dev_dependencies = package_json.get('devDependencies', {})
    all_deps = {**dependencies, **dev_dependencies}
    
    # Check which packages need to be installed
    packages_to_check = ${JSON.stringify(packages)}
    already_installed = []
    need_install = []
    
    for pkg in packages_to_check:
        # Handle scoped packages and versioned packages
        if pkg.startswith('@'):
            # Scoped package - check full name before @version
            pkg_name = pkg.split('@', 2)[0] + '@' + pkg.split('@', 2)[1] if '@' in pkg[1:] else pkg
        else:
            # Extract package name without version
            pkg_name = pkg.split('@')[0]
        
        if pkg_name in all_deps:
            already_installed.append(pkg_name)
        else:
            need_install.append(pkg)
    
    print(f"Already installed: {already_installed}")
    print(f"Need to install: {need_install}")
    print(f"NEED_INSTALL:{json.dumps(need_install)}")
    
except Exception as e:
    print(f"Error checking packages: {e}")
    print(f"NEED_INSTALL:{json.dumps(packages_to_check)}")
    `);
    
    // Parse packages that need installation
    let packagesToInstall = packages;
    
    if (checkResult && checkResult.results && checkResult.results[0] && checkResult.results[0].text) {
      const outputLines = checkResult.results[0].text.split('\n');
      for (const line of outputLines) {
        if (line.startsWith('NEED_INSTALL:')) {
          try {
            packagesToInstall = JSON.parse(line.substring('NEED_INSTALL:'.length));
          } catch (e) {
            console.error('Failed to parse packages to install:', e);
          }
        }
      }
    }
    
    if (packagesToInstall.length === 0) {
      console.log('[install-packages-sync] All packages already installed');
      return NextResponse.json({
        success: true,
        installed: [],
        alreadyInstalled: packages,
        message: 'All packages are already installed'
      });
    }
    
    // Install packages in a single batch command for efficiency (Requirement 13.6)
    console.log('[install-packages-sync] Installing:', packagesToInstall);
    const installResult = await sandbox.runCode(`
import subprocess
import os
import json

os.chdir('/home/user/app')

# Run npm install with output capture
packages_to_install = ${JSON.stringify(packagesToInstall)}
cmd_args = ['npm', 'install', '--legacy-peer-deps'] + packages_to_install

print(f"Running command: {' '.join(cmd_args)}")

process = subprocess.Popen(
    cmd_args,
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True
)

# Wait for completion
stdout, stderr = process.communicate()
rc = process.returncode

print("STDOUT:", stdout)
if stderr:
    print("STDERR:", stderr)

# Capture full npm error output for error reporting (Requirement 11.7)
print(f"NPM_OUTPUT_START")
print(stdout)
print(f"NPM_OUTPUT_END")
print(f"NPM_ERROR_START")
print(stderr)
print(f"NPM_ERROR_END")

print(f"Installation completed with code: {rc}")

# Verify packages were installed by checking node_modules and versions
installed = []
failed = []

for pkg in packages_to_install:
    # Extract package name and version (handle scoped packages)
    if pkg.startswith('@'):
        # Scoped package like @types/node or @types/node@1.0.0
        parts = pkg.split('@')
        if len(parts) >= 3:
            # Has version: @scope/package@version
            pkg_name = '@' + parts[1]
            requested_version = parts[2] if len(parts) > 2 else None
        else:
            # No version: @scope/package
            pkg_name = pkg
            requested_version = None
    else:
        # Regular package, extract name and version
        parts = pkg.split('@')
        pkg_name = parts[0]
        requested_version = parts[1] if len(parts) > 1 else None
    
    # Check if package exists in node_modules
    node_modules_path = f'/home/user/app/node_modules/{pkg_name}'
    if os.path.exists(node_modules_path):
        # If version was specified, verify it matches
        if requested_version:
            try:
                package_json_path = f'{node_modules_path}/package.json'
                with open(package_json_path, 'r') as f:
                    pkg_json = json.load(f)
                    installed_version = pkg_json.get('version', '')
                    
                    if installed_version == requested_version:
                        installed.append(pkg)
                        print(f"✓ Verified {pkg} with version {installed_version}")
                    else:
                        failed.append(pkg)
                        print(f"✗ Version mismatch for {pkg_name}: requested {requested_version}, got {installed_version}")
            except Exception as e:
                failed.append(pkg)
                print(f"✗ Failed to verify version for {pkg}: {e}")
        else:
            # No version specified, just check existence
            installed.append(pkg)
            print(f"✓ Verified {pkg} in node_modules")
    else:
        failed.append(pkg)
        print(f"✗ Package {pkg} not found in node_modules")

print(f"INSTALL_RESULT:{json.dumps({'installed': installed, 'failed': failed, 'returnCode': rc})}")
    `, { timeout: 60000 }); // 60 second timeout
    
    // Parse installation result and capture npm error output (Requirement 11.7)
    let installed: string[] = [];
    let failed: string[] = [];
    let returnCode = 1;
    let npmOutput = '';
    let npmError = '';
    
    if (installResult && installResult.results && installResult.results[0] && installResult.results[0].text) {
      const outputLines = installResult.results[0].text.split('\n');
      let captureOutput = false;
      let captureError = false;
      
      for (const line of outputLines) {
        // Capture npm stdout
        if (line.startsWith('NPM_OUTPUT_START')) {
          captureOutput = true;
          continue;
        }
        if (line.startsWith('NPM_OUTPUT_END')) {
          captureOutput = false;
          continue;
        }
        if (captureOutput) {
          npmOutput += line + '\n';
        }
        
        // Capture npm stderr
        if (line.startsWith('NPM_ERROR_START')) {
          captureError = true;
          continue;
        }
        if (line.startsWith('NPM_ERROR_END')) {
          captureError = false;
          continue;
        }
        if (captureError) {
          npmError += line + '\n';
        }
        
        // Parse install result
        if (line.startsWith('INSTALL_RESULT:')) {
          try {
            const result = JSON.parse(line.substring('INSTALL_RESULT:'.length));
            installed = result.installed || [];
            failed = result.failed || [];
            returnCode = result.returnCode || 0;
          } catch (e) {
            console.error('Failed to parse install result:', e);
          }
        }
      }
    }
    
    // Restart Vite dev server
    await sandbox.runCode(`
import subprocess
import os
import time

os.chdir('/home/user/app')

# Kill any existing Vite processes
subprocess.run(['pkill', '-f', 'vite'], capture_output=True)
time.sleep(1)

# Start Vite dev server
env = os.environ.copy()
env['FORCE_COLOR'] = '0'

process = subprocess.Popen(
    ['npm', 'run', 'dev'],
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    env=env
)

print(f'✓ Vite dev server restarted with PID: {process.pid}')

# Store process info for later
with open('/tmp/vite-process.pid', 'w') as f:
    f.write(str(process.pid))

# Wait a bit for Vite to start up
time.sleep(2)
    `);
    
    // Return result with detailed error information (Requirement 11.7)
    if (failed.length > 0) {
      // Parse npm errors for each failed package
      const failedPackagesDetails = failed.map(pkg => {
        const parsedError = parseNpmError(npmError, pkg);
        return {
          package: pkg,
          issueType: parsedError.issueType,
          details: parsedError.details,
          suggestion: parsedError.suggestion,
        };
      });
      
      // Store for tracking
      installedPackages = installed;
      
      return NextResponse.json({
        success: false,
        installed,
        failed,
        failedPackagesDetails,
        npmOutput: npmOutput.trim(),
        npmError: npmError.trim(),
        error: `Failed to install ${failed.length} package(s): ${failed.join(', ')}`
      }, { status: 500 });
    }
    
    // Store for tracking
    installedPackages = installed;
    
    return NextResponse.json({
      success: true,
      installed,
      failed: []
    });
    
  } catch (error) {
    console.error('[install-packages-sync] Error:', error);
    
    // Parse error for common issues
    const errorMessage = (error as Error).message;
    const failedPackagesDetails = packages.map(pkg => {
      const parsedError = parseNpmError(errorMessage, pkg);
      return {
        package: pkg,
        issueType: parsedError.issueType,
        details: parsedError.details,
        suggestion: parsedError.suggestion,
      };
    });
    
    return NextResponse.json({
      success: false,
      installed: [],
      failed: packages,
      failedPackagesDetails,
      npmError: errorMessage,
      error: (error as Error).message
    }, { status: 500 });
  } finally {
    // Requirements: 15.2, 15.6 - Track dependency installations in sandbox state
    if (installedPackages && installedPackages.length > 0) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/conversation-state`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'update-sandbox',
            data: {
              modification: {
                type: 'dependency_install',
                description: `Installed ${installedPackages.length} package(s)`,
                packages: installedPackages,
              },
            },
          }),
        });
      } catch (trackError) {
        console.warn('[install-packages-sync] Failed to track dependency installation:', trackError);
        // Non-critical, continue
      }
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { packages, sandboxId, stream = true } = await request.json();
    
    if (!packages || !Array.isArray(packages) || packages.length === 0) {
      return NextResponse.json(
        createValidationError(
          'Packages array is required and must contain at least one package',
          'packages'
        ),
        { status: 400 }
      );
    }
    
    // Validate and deduplicate package names
    const validPackages = [...new Set(packages)]
      .filter(pkg => pkg && typeof pkg === 'string' && pkg.trim() !== '')
      .map(pkg => pkg.trim());
    
    if (validPackages.length === 0) {
      return NextResponse.json(
        createValidationError(
          'No valid package names provided',
          'packages',
          {
            providedPackages: packages,
          }
        ),
        { status: 400 }
      );
    }
    
    // Log if duplicates were found
    if (packages.length !== validPackages.length) {
      console.log(`[install-packages] Cleaned packages: removed ${packages.length - validPackages.length} invalid/duplicate entries`);
      console.log(`[install-packages] Original:`, packages);
      console.log(`[install-packages] Cleaned:`, validPackages);
    }
    
    // Try to get sandbox - either from global or reconnect
    let sandbox = global.activeSandbox;
    
    if (!sandbox && sandboxId) {
      console.log(`[install-packages] Reconnecting to sandbox ${sandboxId}...`);
      try {
        sandbox = await Sandbox.connect(sandboxId, { apiKey: process.env.E2B_API_KEY });
        global.activeSandbox = sandbox;
        console.log(`[install-packages] Successfully reconnected to sandbox ${sandboxId}`);
      } catch (error) {
        console.error(`[install-packages] Failed to reconnect to sandbox:`, error);
        return NextResponse.json(
          createSandboxError(
            ErrorCodes.SANDBOX_CONNECTION_ERROR,
            `Failed to reconnect to sandbox: ${(error as Error).message}`,
            sandboxId
          ),
          { status: 500 }
        );
      }
    }
    
    if (!sandbox) {
      return NextResponse.json(
        createSandboxError(
          ErrorCodes.NO_ACTIVE_SANDBOX,
          'No active sandbox available. Please create a sandbox first.',
          undefined
        ),
        { status: 400 }
      );
    }
    
    console.log('[install-packages] Installing packages:', packages);
    
    // If non-streaming mode is requested, perform installation synchronously
    if (!stream) {
      return await installPackagesSync(sandbox, validPackages);
    }
    
    // Create a response stream for real-time updates
    const encoder = new TextEncoder();
    const streamTransform = new TransformStream();
    const writer = streamTransform.writable.getWriter();
    
    // Function to send progress updates
    const sendProgress = async (data: any) => {
      const message = `data: ${JSON.stringify(data)}\n\n`;
      await writer.write(encoder.encode(message));
    };
    
    // Start installation in background
    (async (sandboxInstance) => {
      try {
        await sendProgress({ 
          type: 'start', 
          message: `Installing ${validPackages.length} package${validPackages.length > 1 ? 's' : ''}...`,
          packages: validPackages 
        });
        
        // Kill any existing Vite process first
        await sendProgress({ type: 'status', message: 'Stopping development server...' });
        
        await sandboxInstance.runCode(`
import subprocess
import os
import signal

# Try to kill any existing Vite process
try:
    with open('/tmp/vite-process.pid', 'r') as f:
        pid = int(f.read().strip())
        os.kill(pid, signal.SIGTERM)
        print("Stopped existing Vite process")
except:
    print("No existing Vite process found")
        `);
        
        // Check which packages are already installed
        await sendProgress({ 
          type: 'status', 
          message: 'Checking installed packages...' 
        });
        
        const checkResult = await sandboxInstance.runCode(`
import os
import json

os.chdir('/home/user/app')

# Read package.json to check installed packages
try:
    with open('package.json', 'r') as f:
        package_json = json.load(f)
    
    dependencies = package_json.get('dependencies', {})
    dev_dependencies = package_json.get('devDependencies', {})
    all_deps = {**dependencies, **dev_dependencies}
    
    # Check which packages need to be installed
    packages_to_check = ${JSON.stringify(validPackages)}
    already_installed = []
    need_install = []
    
    for pkg in packages_to_check:
        # Handle scoped packages
        if pkg.startswith('@'):
            pkg_name = pkg
        else:
            # Extract package name without version
            pkg_name = pkg.split('@')[0]
        
        if pkg_name in all_deps:
            already_installed.append(pkg_name)
        else:
            need_install.append(pkg)
    
    print(f"Already installed: {already_installed}")
    print(f"Need to install: {need_install}")
    print(f"NEED_INSTALL:{json.dumps(need_install)}")
    
except Exception as e:
    print(f"Error checking packages: {e}")
    print(f"NEED_INSTALL:{json.dumps(packages_to_check)}")
        `);
        
        // Parse packages that need installation
        let packagesToInstall = validPackages;
        
        // Check if checkResult has the expected structure
        if (checkResult && checkResult.results && checkResult.results[0] && checkResult.results[0].text) {
          const outputLines = checkResult.results[0].text.split('\n');
          for (const line of outputLines) {
            if (line.startsWith('NEED_INSTALL:')) {
              try {
                packagesToInstall = JSON.parse(line.substring('NEED_INSTALL:'.length));
              } catch (e) {
                console.error('Failed to parse packages to install:', e);
              }
            }
          }
        } else {
          console.error('[install-packages] Invalid checkResult structure:', checkResult);
          // If we can't check, just try to install all packages
          packagesToInstall = validPackages;
        }
        
        
        if (packagesToInstall.length === 0) {
          await sendProgress({ 
            type: 'success', 
            message: 'All packages are already installed',
            installedPackages: [],
            alreadyInstalled: validPackages
          });
          return;
        }
        
        // Install packages in a single batch command for efficiency (Requirement 13.6)
        await sendProgress({ 
          type: 'info', 
          message: `Installing ${packagesToInstall.length} package(s) in batch: ${packagesToInstall.join(', ')}`
        });
        
        const installResult = await sandboxInstance.runCode(`
import subprocess
import os

os.chdir('/home/user/app')

# Run npm install with output capture
packages_to_install = ${JSON.stringify(packagesToInstall)}
cmd_args = ['npm', 'install', '--legacy-peer-deps'] + packages_to_install

print(f"Running command: {' '.join(cmd_args)}")

process = subprocess.Popen(
    cmd_args,
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True
)

# Stream output
while True:
    output = process.stdout.readline()
    if output == '' and process.poll() is not None:
        break
    if output:
        print(output.strip())

# Get the return code
rc = process.poll()

# Capture any stderr for error reporting (Requirement 11.7)
stderr = process.stderr.read()
print(f"NPM_ERROR_START")
if stderr:
    print(stderr)
print(f"NPM_ERROR_END")

if stderr:
    print("STDERR:", stderr)
    if 'ERESOLVE' in stderr:
        print("ERESOLVE_ERROR: Dependency conflict detected - using --legacy-peer-deps flag")

print(f"\\nInstallation completed with code: {rc}")

# Verify packages were installed with correct versions
import json
import os

installed = []
failed = []

for pkg in ${JSON.stringify(packagesToInstall)}:
    # Extract package name and version (handle scoped packages)
    if pkg.startswith('@'):
        # Scoped package like @types/node or @types/node@1.0.0
        parts = pkg.split('@')
        if len(parts) >= 3:
            # Has version: @scope/package@version
            pkg_name = '@' + parts[1]
            requested_version = parts[2] if len(parts) > 2 else None
        else:
            # No version: @scope/package
            pkg_name = pkg
            requested_version = None
    else:
        # Regular package, extract name and version
        parts = pkg.split('@')
        pkg_name = parts[0]
        requested_version = parts[1] if len(parts) > 1 else None
    
    # Check if package exists in node_modules and verify version
    node_modules_path = f'/home/user/app/node_modules/{pkg_name}'
    if os.path.exists(node_modules_path):
        # If version was specified, verify it matches
        if requested_version:
            try:
                package_json_path = f'{node_modules_path}/package.json'
                with open(package_json_path, 'r') as f:
                    pkg_json = json.load(f)
                    installed_version = pkg_json.get('version', '')
                    
                    if installed_version == requested_version:
                        installed.append(pkg)
                        print(f"✓ Verified {pkg} with version {installed_version}")
                    else:
                        failed.append(pkg)
                        print(f"✗ Version mismatch for {pkg_name}: requested {requested_version}, got {installed_version}")
            except Exception as e:
                failed.append(pkg)
                print(f"✗ Failed to verify version for {pkg}: {e}")
        else:
            # No version specified, just check existence
            installed.append(pkg)
            print(f"✓ Verified {pkg}")
    else:
        failed.append(pkg)
        print(f"✗ Package {pkg} not found in node_modules")
        
print(f"\\nVerified installed packages: {installed}")
if failed:
    print(f"Failed packages: {failed}")
        `, { timeout: 60000 }); // 60 second timeout for npm install
        
        // Send npm output and parse errors (Requirement 11.7)
        const output = installResult?.output || installResult?.logs?.stdout?.join('\n') || '';
        const npmOutputLines = output.split('\n').filter((line: string) => line.trim());
        
        let npmError = '';
        let captureError = false;
        
        for (const line of npmOutputLines) {
          // Capture npm error output
          if (line.includes('NPM_ERROR_START')) {
            captureError = true;
            continue;
          }
          if (line.includes('NPM_ERROR_END')) {
            captureError = false;
            continue;
          }
          if (captureError) {
            npmError += line + '\n';
          }
          
          // Send output messages
          if (line.includes('STDERR:')) {
            const errorMsg = line.replace('STDERR:', '').trim();
            if (errorMsg && errorMsg !== 'undefined') {
              await sendProgress({ type: 'error', message: errorMsg });
            }
          } else if (line.includes('ERESOLVE_ERROR:')) {
            const msg = line.replace('ERESOLVE_ERROR:', '').trim();
            await sendProgress({ 
              type: 'warning', 
              message: `Dependency conflict resolved with --legacy-peer-deps: ${msg}` 
            });
          } else if (line.includes('npm WARN')) {
            await sendProgress({ type: 'warning', message: line });
          } else if (line.trim() && !line.includes('undefined')) {
            await sendProgress({ type: 'output', message: line });
          }
        }
        
        // Check if installation was successful and parse errors for failed packages (Requirement 11.7)
        const installedMatch = output.match(/Verified installed packages: \[(.*?)\]/);
        const failedMatch = output.match(/Failed packages: \[(.*?)\]/);
        let installedPackages: string[] = [];
        let failedPackages: string[] = [];
        
        if (installedMatch && installedMatch[1]) {
          installedPackages = installedMatch[1]
            .split(',')
            .map((p: string) => p.trim().replace(/'/g, ''))
            .filter((p: string) => p.length > 0);
        }
        
        if (failedMatch && failedMatch[1]) {
          failedPackages = failedMatch[1]
            .split(',')
            .map((p: string) => p.trim().replace(/'/g, ''))
            .filter((p: string) => p.length > 0);
        }
        
        if (installedPackages.length > 0) {
          await sendProgress({ 
            type: 'success', 
            message: `Successfully installed: ${installedPackages.join(', ')}`,
            installedPackages 
          });
        }
        
        if (failedPackages.length > 0) {
          // Parse npm errors for each failed package
          const failedPackagesDetails = failedPackages.map(pkg => {
            const parsedError = parseNpmError(npmError, pkg);
            return {
              package: pkg,
              issueType: parsedError.issueType,
              details: parsedError.details,
              suggestion: parsedError.suggestion,
            };
          });
          
          await sendProgress({ 
            type: 'error', 
            message: `Failed to install ${failedPackages.length} package(s): ${failedPackages.join(', ')}`,
            failedPackages,
            failedPackagesDetails,
            npmError: npmError.trim()
          });
        } else if (installedPackages.length === 0) {
          await sendProgress({ 
            type: 'error', 
            message: 'Failed to verify package installation',
            npmError: npmError.trim()
          });
        }
        
        // Restart Vite dev server
        await sendProgress({ type: 'status', message: 'Restarting development server...' });
        
        await sandboxInstance.runCode(`
import subprocess
import os
import time

os.chdir('/home/user/app')

# Kill any existing Vite processes
subprocess.run(['pkill', '-f', 'vite'], capture_output=True)
time.sleep(1)

# Start Vite dev server
env = os.environ.copy()
env['FORCE_COLOR'] = '0'

process = subprocess.Popen(
    ['npm', 'run', 'dev'],
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    env=env
)

print(f'✓ Vite dev server restarted with PID: {process.pid}')

# Store process info for later
with open('/tmp/vite-process.pid', 'w') as f:
    f.write(str(process.pid))

# Wait a bit for Vite to start up
time.sleep(3)

# Touch files to trigger Vite reload
subprocess.run(['touch', '/home/user/app/package.json'])
subprocess.run(['touch', '/home/user/app/vite.config.js'])

print("Vite restarted and should now recognize all packages")
        `);
        
        await sendProgress({ 
          type: 'complete', 
          message: 'Package installation complete and dev server restarted!',
          installedPackages 
        });
        
      } catch (error) {
        const errorMessage = (error as Error).message;
        if (errorMessage && errorMessage !== 'undefined') {
          // Parse error for common issues (Requirement 11.7)
          const failedPackagesDetails = validPackages.map(pkg => {
            const parsedError = parseNpmError(errorMessage, pkg);
            return {
              package: pkg,
              issueType: parsedError.issueType,
              details: parsedError.details,
              suggestion: parsedError.suggestion,
            };
          });
          
          await sendProgress({ 
            type: 'error', 
            message: errorMessage,
            failedPackages: validPackages,
            failedPackagesDetails,
            npmError: errorMessage
          });
        }
      } finally {
        await writer.close();
      }
    })(sandbox);
    
    // Return the stream
    return new Response(streamTransform.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
    
  } catch (error) {
    console.error('[install-packages] Error:', error);
    
    // This catch handles unexpected errors before package validation
    // For package-specific errors, see the error handling in installPackagesSync and streaming mode
    const errorMessage = (error as Error).message;
    
    return NextResponse.json(
      createPackageInstallationError(
        'Failed to process package installation request',
        'unknown',
        errorMessage
      ),
      { status: 500 }
    );
  }
}