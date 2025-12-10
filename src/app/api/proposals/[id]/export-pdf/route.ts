import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getCurrentUser } from "@/lib/auth"
import { createServerClient } from "@/lib/db"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const supabase = createServerClient()
    const { data: proposal, error } = await supabase
      .from("proposals")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single()

    if (error || !proposal) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 }
      )
    }

    // For now, return a simple text response
    // PDF generation can be implemented later with a proper PDF library
    // or moved to a client-side component

    const plainText = proposal.generated_proposal
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")

    // Return as plain text for now - PDF generation will be implemented
    // with a proper server-side PDF library
    return new Response(
      `PROPOSAL: ${proposal.title}\n\n${plainText}\n\nGenerated with Propozzy`,
      {
        headers: {
          "Content-Type": "text/plain",
          "Content-Disposition": `attachment; filename="${proposal.title.replace(/[^a-z0-9]/gi, '_')}.txt"`,
        },
      }
    )
  } catch (error: any) {
    console.error("PDF export error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to generate PDF" },
      { status: 500 }
    )
  }
}
