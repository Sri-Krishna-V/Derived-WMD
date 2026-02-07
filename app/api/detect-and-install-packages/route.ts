import { NextRequest, NextResponse } from 'next/server';

declare global {
  var activeSandbox: any;
}

export async function POST(request: NextRequest) {
  try {
    const { files } = await request.json();
    
    if (!files || typeof files !== 'object') {
      return NextResponse.json({ 
        success: false, 
        error: 'Files object is required' 
      }, { status: 400 });
    }

    if (!global.activeSandbox) {
      return NextResponse.json({
        success: false,
        error: 'No active sandbox'
      }, { status: 404 });
    }

    console.log('[detect-and-install-packages] Processing files:', Object.keys(files));

    // Extract all import statements from the files
    const imports = new Set<string>();
    const importRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s*,?\s*)*(?:from\s+)?['"]([^'"]+)['"]/g;
    const requireRegex = /require\s*\(['"]([^'"]+)['"]\)/g;

    for (const [filePath, content] of Object.entries(files)) {
      if (typeof content !== 'string') continue;
      
      // Skip non-JS/JSX/TS/TSX files
      if (!filePath.match(/\.(jsx?|tsx?)$/)) continue;

      // Find ES6 imports
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        imports.add(match[1]);
      }

      // Find CommonJS requires
      while ((match = requireRegex.exec(content)) !== null) {
        imports.add(match[1]);
      }
    }

    console.log('[detect-and-install-packages] Found imports:', Array.from(imports));
    
    // Log specific heroicons imports
    const heroiconImports = Array.from(imports).filter(imp => imp.includes('heroicons'));
    if (heroiconImports.length > 0) {
      console.log('[detect-and-install-packages] Heroicon imports:', heroiconImports);
    }

    // Filter out relative imports and built-in modules
    const packages = Array.from(imports).filter(imp => {
      // Skip relative imports
      if (imp.startsWith('.') || imp.startsWith('/')) return false;
      
      // Skip built-in Node modules
      const builtins = ['fs', 'path', 'http', 'https', 'crypto', 'stream', 'util', 'os', 'url', 'querystring', 'child_process'];
      if (builtins.includes(imp)) return false;
      
      // Extract package name (handle scoped packages and subpaths)
      const parts = imp.split('/');
      if (imp.startsWith('@')) {
        // Scoped package like @vitejs/plugin-react
        return true;
      } else {
        // Regular package, return just the first part
        return true;
      }
    });

    // Extract just the package names (without subpaths)
    const packageNames = packages.map(pkg => {
      if (pkg.startsWith('@')) {
        // Scoped package: @scope/package or @scope/package/subpath
        const parts = pkg.split('/');
        return parts.slice(0, 2).join('/');
      } else {
        // Regular package: package or package/subpath
        return pkg.split('/')[0];
      }
    });

    // Remove duplicates
    const uniquePackages = [...new Set(packageNames)];

    console.log('[detect-and-install-packages] Packages to install:', uniquePackages);

    if (uniquePackages.length === 0) {
      return NextResponse.json({
        success: true,
        packagesInstalled: [],
        message: 'No new packages to install'
      });
    }

    // Check which packages are already installed
    const checkResult = await global.activeSandbox.runCode(`
import os
import json

installed = []
missing = []

packages = ${JSON.stringify(uniquePackages)}

for package in packages:
    # Handle scoped packages
    if package.startswith('@'):
        package_path = f"/home/user/app/node_modules/{package}"
    else:
        package_path = f"/home/user/app/node_modules/{package}"
    
    if os.path.exists(package_path):
        installed.append(package)
    else:
        missing.append(package)

result = {
    'installed': installed,
    'missing': missing
}

print(json.dumps(result))
    `);

    const status = JSON.parse(checkResult.logs.stdout.join(''));
    console.log('[detect-and-install-packages] Package status:', status);

    if (status.missing.length === 0) {
      return NextResponse.json({
        success: true,
        packagesInstalled: [],
        packagesAlreadyInstalled: status.installed,
        message: 'All packages already installed'
      });
    }

    // Install missing packages
    console.log('[detect-and-install-packages] Installing packages:', status.missing);
    
    const installResult = await global.activeSandbox.runCode(`
import subprocess
import os
import json

os.chdir('/home/user/app')
packages_to_install = ${JSON.stringify(status.missing)}

# Join packages into a single install command
packages_str = ' '.join(packages_to_install)
cmd = f'npm install {packages_str} --save'

print(f"Running: {cmd}")

# Run npm install with explicit save flag
result = subprocess.run(['npm', 'install', '--save'] + packages_to_install, 
                       capture_output=True, 
                       text=True, 
                       cwd='/home/user/app',
                       timeout=60)

print("stdout:", result.stdout)
if result.stderr:
    print("stderr:", result.stderr)

# Verify installation
installed = []
failed = []

for package in packages_to_install:
    # Handle scoped packages correctly
    if package.startswith('@'):
        # For scoped packages like @heroicons/react
        package_path = f"/home/user/app/node_modules/{package}"
    else:
        package_path = f"/home/user/app/node_modules/{package}"
    
    if os.path.exists(package_path):
        installed.append(package)
        print(f"✓ Verified installation of {package}")
    else:
        # Check if it's a submodule of an installed package
        base_package = package.split('/')[0]
        if package.startswith('@'):
            # For @scope/package, the base is @scope/package
            base_package = '/'.join(package.split('/')[:2])
        
        base_path = f"/home/user/app/node_modules/{base_package}"
        if os.path.exists(base_path):
            installed.append(package)
            print(f"✓ Verified installation of {package} (via {base_package})")
        else:
            failed.append(package)
            print(f"✗ Failed to verify installation of {package}")

result_data = {
    'installed': installed,
    'failed': failed,
    'returncode': result.returncode
}

print("\\nResult:", json.dumps(result_data))
    `, { timeout: 60000 });

    // Parse the result more safely
    let installStatus;
    try {
      const stdout = installResult.logs.stdout.join('');
      const resultMatch = stdout.match(/Result:\s*({.*})/);
      if (resultMatch) {
        installStatus = JSON.parse(resultMatch[1]);
      } else {
        // Fallback parsing
        const lines = stdout.split('\n');
        const resultLine = lines.find((line: string) => line.includes('Result:'));
        if (resultLine) {
          installStatus = JSON.parse(resultLine.split('Result:')[1].trim());
        } else {
          throw new Error('Could not find Result in output');
        }
      }
    } catch (parseError) {
      console.error('[detect-and-install-packages] Failed to parse install result:', parseError);
      console.error('[detect-and-install-packages] stdout:', installResult.logs.stdout.join(''));
      // Fallback to assuming all packages were installed
      installStatus = {
        installed: status.missing,
        failed: [],
        returncode: 0
      };
    }

    if (installStatus.failed.length > 0) {
      console.error('[detect-and-install-packages] Failed to install:', installStatus.failed);
    }

    return NextResponse.json({
      success: true,
      packagesInstalled: installStatus.installed,
      packagesFailed: installStatus.failed,
      packagesAlreadyInstalled: status.installed,
      message: `Installed ${installStatus.installed.length} packages`,
      logs: installResult.logs.stdout.join('\n')
    });

  } catch (error) {
    console.error('[detect-and-install-packages] Error:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}