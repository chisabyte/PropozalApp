"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, Home } from "lucide-react"
import Link from "next/link"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50/30 flex flex-col items-center justify-center px-4">
            <div className="text-center max-w-md">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/20">
                        <span className="text-4xl">⚠️</span>
                    </div>
                </div>
                
                <h1 className="text-2xl font-bold tracking-tight text-foreground mb-3">
                    Something went wrong
                </h1>
                <p className="text-muted-foreground mb-8">
                    We encountered an unexpected error. Please try again or return to the homepage.
                </p>
                
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                    <Button onClick={() => reset()} className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Try Again
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/">
                            <Home className="mr-2 h-4 w-4" />
                            Back Home
                        </Link>
                    </Button>
                </div>
                
                {error.digest && (
                    <p className="mt-8 text-xs text-muted-foreground">
                        Error ID: {error.digest}
                    </p>
                )}
            </div>
        </div>
    )
}
