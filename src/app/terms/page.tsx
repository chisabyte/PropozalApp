export default function TermsPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-3xl">
            <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
            <p className="mb-4 text-muted-foreground">Last updated: December 8, 2024</p>

            <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
                <section>
                    <h2 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h2>
                    <p>By accessing and using Propozzy ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">2. Description of Service</h2>
                    <p>Propozzy provides AI-powered proposal generation tools for freelancers and agencies. We reserve the right to modify, suspend, or discontinue any part of the Service at any time.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">3. User Accounts</h2>
                    <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">4. User Content & AI Generation</h2>
                    <p>You retain ownership of the content you input (RFPs, portfolio items) and the proposals generated. You are responsible for reviewing and verifying the accuracy of all AI-generated content before use.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">5. Subscription & Billing</h2>
                    <p>Services are billed on a subscription basis. You may cancel your subscription at any time. Refunds are governed by our Refund Policy.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">6. Limitation of Liability</h2>
                    <p>Propozzy is provided "as is" without warranties of any kind. We are not liable for any direct, indirect, incidental, or consequential damages arising from your use of the Service.</p>
                </section>
            </div>
        </div>
    )
}
