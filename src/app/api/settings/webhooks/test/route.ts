import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getSupabaseAdmin } from "@/lib/db"
import crypto from "crypto"

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { webhook_url, secret } = body
    
    if (!webhook_url) {
      return NextResponse.json({ error: "Webhook URL is required" }, { status: 400 })
    }
    
    // Create test payload
    const payload = {
      event: "test.ping",
      timestamp: new Date().toISOString(),
      data: {
        message: "This is a test event from Propozzy",
        triggered_by: userId
      },
      user_id: userId
    }
    
    // Use provided secret or generate a temporary one for the test
    const signatureSecret = secret || "test_secret"
    const signature = crypto
      .createHmac('sha256', signatureSecret)
      .update(JSON.stringify(payload))
      .digest('hex')
      
    // Send request
    const response = await fetch(webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Propozzy-Signature': signature,
        'X-Propozzy-Event': 'test.ping',
      },
      body: JSON.stringify(payload)
    })
    
    const responseBody = await response.text()
    
    return NextResponse.json({
      success: response.ok,
      status: response.status,
      body: responseBody
    })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
