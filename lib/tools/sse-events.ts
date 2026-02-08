/**
 * Shared SSE (Server-Sent Events) event schemas for streaming responses
 */

import { z } from 'zod';

/**
 * Base SSE event schema
 */
const BaseSSEEventSchema = z.object({
  type: z.string(),
});

/**
 * Log event - informational message
 */
export const SSELogEventSchema = BaseSSEEventSchema.extend({
  type: z.literal('log'),
  message: z.string(),
});

/**
 * Step event - build/deployment step progress
 */
export const SSEStepEventSchema = BaseSSEEventSchema.extend({
  type: z.literal('step'),
  step: z.string(),
  status: z.enum(['pending', 'in_progress', 'complete', 'error']),
  message: z.string().optional(),
});

/**
 * Error event - error occurred during processing
 */
export const SSEErrorEventSchema = BaseSSEEventSchema.extend({
  type: z.literal('error'),
  message: z.string(),
  code: z.string().optional(),
});

/**
 * Final event - final result of the operation
 */
export const SSEFinalEventSchema = BaseSSEEventSchema.extend({
  type: z.literal('final'),
  result: z.any(), // The actual result payload
});

/**
 * Discriminated union of all SSE event types
 */
export const SSEEventSchema = z.discriminatedUnion('type', [
  SSELogEventSchema,
  SSEStepEventSchema,
  SSEErrorEventSchema,
  SSEFinalEventSchema,
]);

export type SSEEvent = z.infer<typeof SSEEventSchema>;
export type SSELogEvent = z.infer<typeof SSELogEventSchema>;
export type SSEStepEvent = z.infer<typeof SSEStepEventSchema>;
export type SSEErrorEvent = z.infer<typeof SSEErrorEventSchema>;
export type SSEFinalEvent = z.infer<typeof SSEFinalEventSchema>;

/**
 * Parse SSE data line-by-line according to the SSE spec
 * Handles multi-line data fields properly
 */
export function parseSSEStream(text: string): SSEEvent[] {
  const events: SSEEvent[] = [];
  const lines = text.split('\n');
  let currentData = '';
  
  for (const line of lines) {
    // Empty line signals end of event
    if (line.trim() === '') {
      if (currentData) {
        try {
          const parsed = JSON.parse(currentData);
          const validated = SSEEventSchema.parse(parsed);
          events.push(validated);
        } catch (error) {
          console.warn('[SSE] Failed to parse event:', error, currentData);
        }
        currentData = '';
      }
      continue;
    }
    
    // Parse SSE field
    if (line.startsWith('data: ')) {
      const data = line.substring(6);
      currentData += (currentData ? '\n' : '') + data;
    }
    // Ignore other SSE fields (event:, id:, retry:)
  }
  
  // Handle any remaining data
  if (currentData) {
    try {
      const parsed = JSON.parse(currentData);
      const validated = SSEEventSchema.parse(parsed);
      events.push(validated);
    } catch (error) {
      console.warn('[SSE] Failed to parse final event:', error, currentData);
    }
  }
  
  return events;
}

/**
 * Format data as SSE message
 */
export function formatSSEMessage(event: SSEEvent): string {
  const data = JSON.stringify(event);
  // Split long data into multiple data: lines if needed
  const lines = data.split('\n');
  return lines.map(line => `data: ${line}`).join('\n') + '\n\n';
}
