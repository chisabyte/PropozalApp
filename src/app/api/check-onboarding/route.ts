import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ completed: false }, { status: 200 })
    }

    const user = await getCurrentUser()
    
    // User has completed onboarding if they have industry set
    const completed = !!user?.industry

    return NextResponse.json({ completed })
  } catch (error: any) {
    return NextResponse.json({ completed: false }, { status: 200 })
  }
}

