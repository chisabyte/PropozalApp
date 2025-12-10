"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Check, Zap } from "lucide-react"

interface UpgradeModalProps {
    open: boolean
    onClose: () => void
    plan: string
    used: number
    limit: number
}

export function UpgradeModal({ open, onClose, plan, used, limit }: UpgradeModalProps) {
    const isFreePlan = plan === 'free'
    const targetPlan = isFreePlan ? 'Starter' : 'Pro'
    const targetPrice = isFreePlan ? 19 : 39
    const targetLimit = isFreePlan ? 100 : 300

    const benefits = isFreePlan
        ? [
            '100 proposals per month',
            'Public share links',
            'PDF export',
            'GPT-4o AI generation',
        ]
        : [
            '300 proposals per month',
            'Analytics Dashboard',
            'Everything in Starter',
            'Advanced features',
        ]

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-primary" />
                        You've Hit Your {plan.charAt(0).toUpperCase() + plan.slice(1)} Limit
                    </DialogTitle>
                    <DialogDescription>
                        You've used all {limit} proposals this month. Upgrade to {targetPlan} to keep generating!
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <div className="rounded-lg border bg-primary/5 p-4">
                        <div className="flex items-baseline gap-1 mb-3">
                            <span className="text-2xl font-bold">${targetPrice}</span>
                            <span className="text-muted-foreground">/month</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                            {typeof targetLimit === 'number' ? `${targetLimit} proposals/month` : targetLimit}
                        </p>
                        <ul className="space-y-2">
                            {benefits.map((benefit, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm">
                                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                                    {benefit}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
                        Maybe Later
                    </Button>
                    <Button asChild className="w-full sm:w-auto">
                        <Link href="/dashboard/billing">
                            Upgrade to {targetPlan}
                        </Link>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
