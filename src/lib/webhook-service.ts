import { getSupabaseAdmin } from "@/lib/db"
import { WebhookEvent, WebhookPayload } from "@/types/webhook-events"
import crypto from "crypto"

export async function sendWebhook(
  userId: string,
  eventType: WebhookEvent,
  data: any
) {
  const supabase = getSupabaseAdmin()
  
  // Get user's webhook settings
  const { data: settings } = await supabase
    .from("webhook_settings")
    .select("*")
    .eq("user_id", userId)
    .eq("enabled", true)
    .single()
  
  if (!settings) return
  
  // Check if event type is enabled
  // If events array is empty or doesn't contain the event, skip
  // Note: We'll assume if events is empty/null, nothing is enabled. 
  // Or we could default to all enabled, but specific selection is better.
  const enabledEvents = Array.isArray(settings.events) ? settings.events : []
  if (!enabledEvents.includes(eventType)) return
  
  // Construct payload
  const payload: WebhookPayload = {
    event: eventType,
    timestamp: new Date().toISOString(),
    data: data,
    user_id: userId
  }
  
  // Generate HMAC signature for security
  const signature = generateSignature(payload, settings.secret)
  
  let responseStatus = 0
  let responseBody = ""
  let failed = false
  
  try {
    // Send POST request
    const response = await fetch(settings.webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Propozzy-Signature': signature,
        'X-Propozzy-Event': eventType,
      },
      body: JSON.stringify(payload)
    })
    
    responseStatus = response.status
    responseBody = await response.text()
    failed = !response.ok
    
    // Simple retry logic (1 retry for now to keep it fast)
    if (failed) {
      console.warn(`Webhook failed with status ${responseStatus}. Retrying once...`)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const retryResponse = await fetch(settings.webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Propozzy-Signature': signature,
          'X-Propozzy-Event': eventType,
        },
        body: JSON.stringify(payload)
      })
      
      responseStatus = retryResponse.status
      responseBody = await retryResponse.text()
      failed = !retryResponse.ok
    }
  } catch (error: any) {
    console.error("Webhook sending failed:", error)
    responseStatus = 0
    responseBody = error.message || "Network error"
    failed = true
  }
  
  // Log delivery
  await supabase.from("webhook_deliveries").insert({
    user_id: userId,
    webhook_settings_id: settings.id,
    event_type: eventType,
    payload: payload,
    response_status: responseStatus,
    response_body: responseBody.substring(0, 5000), // Limit size
    failed: failed,
    delivered_at: new Date().toISOString()
  })
}

function generateSignature(payload: any, secret: string): string {
  if (!secret) return ""
  return crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex')
}
