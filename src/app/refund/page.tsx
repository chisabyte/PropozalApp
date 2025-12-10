export default function RefundPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-3xl">
            <h1 className="text-3xl font-bold mb-6">Refund Policy</h1>
            <p className="mb-4 text-muted-foreground">Last updated: December 8, 2024</p>

            <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
                <section>
                    <h2 className="text-xl font-semibold mb-2">Satisfaction Guarantee</h2>
                    <p>We stand behind our product. If you are not satisfied with ProposalForge, you may request a refund within 30 days of your first payment.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">Eligibility</h2>
                    <p>Refunds are applicable for the first month of your subscription only. To be eligible for a refund, you must submit your request within 30 days of the charge date.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">How to Request a Refund</h2>
                    <p>To request a refund, please contact our support team with your account email and the reason for your request. We process eligible refunds within 5-10 business days.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">Cancellation</h2>
                    <p>You may cancel your subscription at any time via your account dashboard. Cancellation stops future billing but does not automatically trigger a refund for unused time in the current billing cycle, unless requested under the 30-day guarantee.</p>
                </section>
            </div>
        </div>
    )
}
