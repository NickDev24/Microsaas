import { createHmac } from 'crypto';
import { supabaseAdmin } from './supabase';

interface WebhookDispatchResult {
  success: boolean;
  status?: number;
  body?: string;
  error?: string;
  signature?: string;
}

/**
 * Generate HMAC signature for webhook payload
 */
function generateSignature(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

/**
 * Dispatch webhook with HMAC signature and retry logic
 */
export async function dispatchWebhook(
  eventType: string,
  entityType: string,
  entityId: string,
  data: Record<string, unknown>,
  options?: {
    retries?: number;
    timeout?: number;
  }
): Promise<WebhookDispatchResult> {
  const webhookUrl = process.env.WEBHOOK_N8N_URL;
  const webhookSecret = process.env.WEBHOOK_SECRET_TOKEN;

  if (!webhookUrl || !webhookSecret) {
    console.error('Webhook configuration missing');
    return { success: false, error: 'Webhook not configured' };
  }

  const maxRetries = options?.retries ?? 3;
  const timeout = options?.timeout ?? 30000;

  // Prepare payload
  const payload = {
    event: eventType,
    entity_type: entityType,
    entity_id: entityId,
    timestamp: new Date().toISOString(),
    data,
  };

  const payloadString = JSON.stringify(payload);
  const signature = generateSignature(payloadString, webhookSecret);

  // Try with retries and exponential backoff
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': `sha256=${signature}`,
          'X-Webhook-Event': eventType,
          'X-Webhook-Attempt': String(attempt),
          'User-Agent': 'ModaShop-Webhook/1.0',
        },
        body: payloadString,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseBody = await response.text();
      const success = response.ok;

      // Log the outcome
      await supabaseAdmin.from('webhook_logs').insert({
        event_type: eventType,
        entity_type: entityType,
        entity_id: entityId,
        status: success ? 'success' : (attempt < maxRetries ? 'pending' : 'failed'),
        response_code: response.status,
        response_time: 0, // Could track actual time
        response_body: responseBody.substring(0, 1000), // Limit size
        attempt: attempt,
        payload: payload,
      });

      if (success) {
        return {
          success: true,
          status: response.status,
          body: responseBody,
          signature,
        };
      }

      // If not successful and we have retries left, wait before retry
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt - 1) * 1000; // Exponential backoff: 1s, 2s, 4s
        console.log(`Webhook attempt ${attempt} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Webhook attempt ${attempt} error:`, errorMessage);

      // Log error
      await supabaseAdmin.from('webhook_logs').insert({
        event_type: eventType,
        entity_type: entityType,
        entity_id: entityId,
        status: attempt < maxRetries ? 'pending' : 'failed',
        error: errorMessage.substring(0, 500),
        attempt: attempt,
        payload: payload,
      });

      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt - 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        return {
          success: false,
          error: errorMessage,
          signature,
        };
      }
    }
  }

  return {
    success: false,
    error: `Failed after ${maxRetries} attempts`,
    signature,
  };
}

/**
 * Verify webhook signature (for incoming webhooks)
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = generateSignature(payload, secret);
  const providedSignature = signature.replace('sha256=', '');
  
  // Use timing-safe comparison to prevent timing attacks
  try {
    return createHmac('sha256', secret).update(payload).digest().equals(
      Buffer.from(providedSignature, 'hex')
    );
  } catch {
    // Fallback for environments without Buffer.equals
    return expectedSignature === providedSignature;
  }
}
