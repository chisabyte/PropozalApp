import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 flex flex-col items-center justify-center px-4">
            <div className="text-center max-w-md">
                {/* 404 Number */}
                <div className="mb-8">
                    <span className="text-[150px] font-bold leading-none bg-gradient-to-r from-primary to-teal-500 bg-clip-text text-transparent">
                        404
                    </span>
                </div>
                
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-teal-500/10 flex items-center justify-center">
                        <span className="text-4xl">🔍</span>
                    </div>
                </div>
                
                <h1 className="text-2xl font-bold tracking-tight text-foreground mb-3">
                    Page not found
                </h1>
                <p className="text-muted-foreground mb-8">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                    <Button asChild className="shadow-lg shadow-primary/25">
                        <Link href="/dashboard">
                            <Home className="mr-2 h-4 w-4" />
                            Go to Dashboard
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back Home
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
