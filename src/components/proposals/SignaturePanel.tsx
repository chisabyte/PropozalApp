'use client';

import { useState, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SignaturePanelProps {
  proposalId: string;
}

export default function SignaturePanel({ proposalId }: SignaturePanelProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const signatureRef = useRef<SignatureCanvas>(null);

  const clearSignature = () => {
    signatureRef.current?.clear();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (!agreedToTerms) {
      setError('You must agree to the terms to sign this proposal');
      return;
    }

    setLoading(true);

    try {
      // Get signature image if canvas has content
      let signatureImage: string | undefined;
      if (signatureRef.current && !signatureRef.current.isEmpty()) {
        signatureImage = signatureRef.current.toDataURL();
      }

      const response = await fetch(`/api/proposals/${proposalId}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          agreed_to_terms: agreedToTerms,
          signature_image: signatureImage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign proposal');
      }

      setSuccess(true);
      
      // Reload page after 2 seconds to show signed state
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <AlertDescription className="text-green-800">
          ✓ Proposal signed successfully! Refreshing...
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign & Accept Proposal</CardTitle>
        <CardDescription>
          By signing below, you agree to the terms and conditions outlined in this proposal.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label>Signature (Optional)</Label>
            <div className="border border-gray-300 rounded-lg bg-white">
              <SignatureCanvas
                ref={signatureRef}
                canvasProps={{
                  className: 'w-full h-32 rounded-lg',
                }}
                backgroundColor="rgb(255, 255, 255)"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearSignature}
              disabled={loading}
            >
              Clear Signature
            </Button>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
              disabled={loading}
            />
            <Label htmlFor="terms" className="text-sm leading-tight cursor-pointer">
              I agree to the terms and conditions outlined in this proposal and authorize 
              the commencement of work as described.
            </Label>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Signing...' : 'Accept & Sign Proposal'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
