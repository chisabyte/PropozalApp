import { jsPDF } from 'jspdf';
import { Proposal } from '@/types';

export async function generateProposalPDF(proposal: Proposal): Promise<Blob> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc = new jsPDF() as any;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Header
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('PROPOSAL', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Proposal Details
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Proposal #: ${proposal.id.slice(0, 8).toUpperCase()}`, 20, yPosition);
  yPosition += 7;
  doc.text(`Date: ${new Date(proposal.created_at).toLocaleDateString()}`, 20, yPosition);
  yPosition += 7;
  
  if (proposal.expires_at) {
    doc.text(`Valid Until: ${new Date(proposal.expires_at).toLocaleDateString()}`, 20, yPosition);
    yPosition += 7;
  }
  yPosition += 5;

  // Client Information
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Prepared For:', 20, yPosition);
  yPosition += 7;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  // Handle optional client fields gracefully
  if (proposal.client_name) {
    doc.text(proposal.client_name, 20, yPosition);
    yPosition += 7;
  }
  if (proposal.client_email) {
    doc.text(proposal.client_email, 20, yPosition);
    yPosition += 10;
  }

  // Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(proposal.title, 20, yPosition);
  yPosition += 10;

  // Content (simplified - adapt to your actual content structure)
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const contentText = proposal.generated_proposal || "";
  
  const splitContent = doc.splitTextToSize(contentText, pageWidth - 40);
  doc.text(splitContent, 20, yPosition);
  yPosition += splitContent.length * 5 + 10;

  // Total Amount (if available)
  if (proposal.project_value) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    // Default currency to USD if not in proposal
    const currency = '$'; 
    const totalText = `Total: ${currency} ${proposal.project_value.toLocaleString()}`;
    doc.text(totalText, pageWidth - 20, yPosition, { align: 'right' });
    yPosition += 15;
  }

  // Signature Section (if signed)
  if (proposal.signed_status === 'signed' && proposal.signed_at) {
    // Add new page if needed
    if (yPosition > pageHeight - 80) {
      doc.addPage();
      yPosition = 20;
    }

    // Separator line
    doc.setLineWidth(0.5);
    doc.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 10;

    // Signature header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('SIGNATURE & ACCEPTANCE', 20, yPosition);
    yPosition += 10;

    // Signature image if present
    if (proposal.signed_signature_image) {
      try {
        doc.addImage(
          proposal.signed_signature_image,
          'PNG',
          20,
          yPosition,
          80,
          30
        );
        yPosition += 35;
      } catch (err) {
        console.error('Error adding signature image:', err);
      }
    }

    // Signature details
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    doc.text(`Signed by: ${proposal.signed_by_name}`, 20, yPosition);
    yPosition += 6;
    
    doc.text(`Email: ${proposal.signed_by_email}`, 20, yPosition);
    yPosition += 6;
    
    doc.text(
      `Date: ${new Date(proposal.signed_at).toLocaleString()}`,
      20,
      yPosition
    );
    yPosition += 6;
    
    doc.text(`IP Address: ${proposal.signed_ip}`, 20, yPosition);
    yPosition += 10;

    // Legal disclaimer
    doc.setFontSize(8);
    doc.setTextColor(100);
    const disclaimer = doc.splitTextToSize(
      'This document has been electronically signed and is legally binding. ' +
      'The signature details above serve as proof of acceptance.',
      pageWidth - 40
    );
    doc.text(disclaimer, 20, yPosition);
  }

  // Return Blob for consistent API response
  // In Node.js environments, we might need to handle this differently,
  // but let's try standard Blob first.
  return doc.output('blob');
}
