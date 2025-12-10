import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { extractRFPData } from "@/lib/rfp-extractor"

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { rfpText } = body

    if (!rfpText || typeof rfpText !== 'string' || rfpText.length < 50) {
      return NextResponse.json(
        { error: "RFP text must be at least 50 characters" },
        { status: 400 }
      )
    }

    const extracted = await extractRFPData(rfpText)

    return NextResponse.json({
      success: true,
      data: extracted,
    })
  } catch (error: any) {
    console.error("RFP extraction error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to extract RFP data" },
      { status: 500 }
    )
  }
}

