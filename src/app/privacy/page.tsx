export default function PrivacyPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-3xl">
            <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
            <p className="mb-4 text-muted-foreground">Last updated: December 8, 2024</p>

            <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
                <section>
                    <h2 className="text-xl font-semibold mb-2">1. Information We Collect</h2>
                    <p>We collect information you provide directly to us, including your name, email address, company information, portfolio items, and the text of RFPs you process.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">2. How We Use Your Information</h2>
                    <p>We use your information to provide and improve our services, process payments, generate AI proposals, and communicate with you.</p>
                    <p className="mt-2 text-sm bg-muted p-4 rounded-md">
                        <strong>Note on AI Processing:</strong> Data submitted for AI generation is processed by OpenAI via their API. We do not use your data to train public AI models.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">3. Data Security</h2>
                    <p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">4. Third-Party Services</h2>
                    <p>We share necessary data with trusted third-party service providers, including:</p>
                    <ul className="list-disc pl-5 mt-2">
                        <li>Clerk (Authentication)</li>
                        <li>Stripe (Payments)</li>
                        <li>OpenAI (AI Processing)</li>
                        <li>Supabase (Database)</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">5. Your Rights</h2>
                    <p>You have the right to access, correct, or delete your personal data. You can manage your data directly within the application or contact support for assistance.</p>
                </section>
            </div>
        </div>
    )
}
