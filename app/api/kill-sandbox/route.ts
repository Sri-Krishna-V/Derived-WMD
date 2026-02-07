import { NextResponse } from 'next/server';

declare global {
  var activeSandbox: any;
  var sandboxData: any;
  var existingFiles: Set<string>;
}

export async function POST() {
  try {
    console.log('[kill-sandbox] Killing active sandbox...');
    
    let sandboxKilled = false;
    
    // Kill existing sandbox if any
    if (global.activeSandbox) {
      try {
        await global.activeSandbox.close();
        sandboxKilled = true;
        console.log('[kill-sandbox] Sandbox closed successfully');
      } catch (e) {
        console.error('[kill-sandbox] Failed to close sandbox:', e);
      }
      global.activeSandbox = null;
      global.sandboxData = null;
    }
    
    // Clear existing files tracking
    if (global.existingFiles) {
      global.existingFiles.clear();
    }
    
    return NextResponse.json({
      success: true,
      sandboxKilled,
      message: 'Sandbox cleaned up successfully'
    });
    
  } catch (error) {
    console.error('[kill-sandbox] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: (error as Error).message 
      }, 
      { status: 500 }
    );
  }
}