import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface InvoiceData {
  // Invoice Header
  invoiceNumber: string;
  invoiceDate: Date;

  // Company/Store Details
  companyName: string;
  companyAddress: string;
  companyCity: string;
  companyState: string;
  companyPincode: string;
  companyCountry: string;
  companyPhone: string;
  companyEmail: string;
  companyTaxId?: string;
  companyGST?: string;

  // Customer Details
  customerName: string;
  customerAddress: string;
  customerCity: string;
  customerState: string;
  customerPincode: string;
  customerCountry: string;
  customerPhone: string;
  customerEmail?: string;

  // Order Details
  orderNumber: string;
  orderDate: Date;
  orderStatus: string;

  // Shipping Address (if different from customer)
  shippingAddress?: {
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    phone: string;
  };

  // Items
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
    total: number;
    size?: string;
    color?: string;
  }>;

  // Pricing
  subtotal: number;
  tax: number;
  shippingCharges: number;
  discount: number;
  total: number;

  // Payment Info
  paymentMethod: string;
  transactionId: string;
  paymentDate: Date;

  // Additional Info
  trackingNumber?: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  generateInvoice(data: InvoiceData): void {
    const doc = new jsPDF();

    // Color scheme - Modern design with black and red
    const black: [number, number, number] = [0, 0, 0]; // Black
    const red: [number, number, number] = [220, 38, 38]; // Red #dc2626
    const white: [number, number, number] = [255, 255, 255];
    const textColor: [number, number, number] = [50, 50, 50];
    const lightGray: [number, number, number] = [240, 240, 240];

    // ========== HEADER SECTION WITH RECTANGLES ==========
    const headerHeight = 35;
    const pageWidth = doc.internal.pageSize.width;
    
    // Left black rectangle (Company Logo/Name)
    doc.setFillColor(...black);
    doc.rect(0, 0, pageWidth * 0.55, headerHeight, 'F');
    
    // Right black rectangle (Invoice Title)
    doc.setFillColor(...black);
    doc.rect(pageWidth * 0.55, 0, pageWidth * 0.45, headerHeight, 'F');
    
    // Red diagonal stripe (overlapping rectangle for visual effect)
    doc.setFillColor(...red);
    const stripeX = pageWidth * 0.55;
    doc.rect(stripeX - 8, 0, 20, headerHeight, 'F');
    
    // Company Name/Logo (Left rectangle - white text)
    doc.setTextColor(...white);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(data.companyName || 'GC CLOTHS', 10, 15);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Premium Fashion & Clothing', 10, 22);
    
    // Invoice Title (Right rectangle - white text)
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', pageWidth - 10, 15, { align: 'right' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`ID NO: ${data.invoiceNumber}`, pageWidth - 10, 25, { align: 'right' });

    let yPosition = headerHeight + 15;

    // ========== INVOICE TO & FROM SECTIONS ==========
    const leftX = 14;
    const rightX = 105; // Consistent right side position
    
    // Add padding at the top of Invoice To section
    yPosition += 10; // Add 10 units of padding
    
    // Invoice To (Left Side)
    const invoiceToStartY = yPosition;
    doc.setTextColor(...black);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice To:', leftX, invoiceToStartY);
    
    let invoiceToY = invoiceToStartY + 7;
    doc.setTextColor(...textColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(data.customerName, leftX, invoiceToY);
    invoiceToY += 5;
    doc.text(data.customerAddress, leftX, invoiceToY);
    invoiceToY += 5;
    doc.text(`${data.customerCity}, ${data.customerState} ${data.customerPincode}`, leftX, invoiceToY);
    invoiceToY += 5;
    doc.text(data.customerCountry, leftX, invoiceToY);
    invoiceToY += 5;
    doc.text(`Phone: ${data.customerPhone}`, leftX, invoiceToY);
    if (data.customerEmail) {
      invoiceToY += 5;
      doc.text(`Email: ${data.customerEmail}`, leftX, invoiceToY);
    }
    
    const leftSectionEnd = invoiceToY;
    
    // Invoice From (Right Side) - Company details
    // Start "Invoice From" header on the same line as "Invoice To" header
    const invoiceFromStartY = invoiceToStartY; // Same Y position as Invoice To
    doc.setTextColor(...black);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice From:', rightX, invoiceFromStartY);
    
    let invoiceFromY = invoiceFromStartY + 7;
    doc.setTextColor(...textColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(data.companyName || 'GC CLOTHS', rightX, invoiceFromY);
    invoiceFromY += 5;
    doc.text(data.companyAddress || '123 Fashion Street', rightX, invoiceFromY);
    invoiceFromY += 5;
    doc.text(`${data.companyCity || 'Chennai'}, ${data.companyState || 'Tamil Nadu'} ${data.companyPincode || '600001'}`, rightX, invoiceFromY);
    invoiceFromY += 5;
    doc.text(data.companyCountry || 'India', rightX, invoiceFromY);
    invoiceFromY += 5;
    doc.text(`Phone: ${data.companyPhone || '+91 9876543210'}`, rightX, invoiceFromY);
    if (data.companyEmail) {
      invoiceFromY += 5;
      doc.text(`Email: ${data.companyEmail}`, rightX, invoiceFromY);
    }
    
    const rightSectionEnd = invoiceFromY;
    yPosition = Math.max(leftSectionEnd, rightSectionEnd) + 15;

    // ========== ITEMS TABLE WITH ORANGE HEADER ==========
    const tableData = data.items.map(item => [
      item.productName + (item.size ? ` (Size: ${item.size})` : '') + (item.color ? ` (Color: ${item.color})` : ''),
      item.quantity.toString(),
      this.formatCurrency(item.unitPrice),
      this.formatCurrency(item.total)
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [['DESCRIPTION', 'QTY', 'UNIT PRICE', 'TOTAL']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: red,
        textColor: white,
        fontStyle: 'bold',
        fontSize: 10,
        halign: 'left'
      },
      bodyStyles: {
        fontSize: 9,
        textColor: textColor
      },
      columnStyles: {
        0: { cellWidth: 90, halign: 'left' },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 30, halign: 'right' },
        3: { cellWidth: 30, halign: 'right' }
      },
      margin: { left: 14, right: 14 },
      alternateRowStyles: {
        fillColor: lightGray
      }
    });

    const finalY = (doc as any).lastAutoTable.finalY || yPosition + 50;
    let currentY = finalY + 15;

    // ========== PAYMENT METHOD & CONTACT INFO (LEFT SIDE) ==========
    const paymentLeftX = 14;
    let paymentY = currentY;
    
    // Payment Method Section
    doc.setTextColor(...black);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Method:', paymentLeftX, paymentY);
    
    paymentY += 7;
    doc.setTextColor(...textColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Method: ${data.paymentMethod}`, paymentLeftX, paymentY);
    paymentY += 5;
    doc.text(`Transaction ID: ${data.transactionId}`, paymentLeftX, paymentY);
    paymentY += 5;
    doc.text(`Payment Date: ${this.formatDate(data.paymentDate)}`, paymentLeftX, paymentY);
    
    paymentY += 10;
    
    // Contact Info Section
    doc.setTextColor(...black);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Contact Info:', paymentLeftX, paymentY);
    
    paymentY += 7;
    doc.setTextColor(...textColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Phone: ${data.companyPhone || '+91 9876543210'}`, paymentLeftX, paymentY);
    paymentY += 5;
    doc.text(`Email: ${data.companyEmail || 'support@gccloths.com'}`, paymentLeftX, paymentY);
    if (data.companyGST) {
      paymentY += 5;
      doc.text(`GSTIN: ${data.companyGST}`, paymentLeftX, paymentY);
    }

    // ========== PRICE BREAKDOWN (RIGHT SIDE) ==========
    const priceBreakdownX = rightX;
    const priceValueX = 190;
    let priceY = currentY;
    
    doc.setFontSize(10);
    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'normal');
    
    doc.text('Subtotal:', priceBreakdownX, priceY, { align: 'right' });
    doc.text(this.formatCurrency(data.subtotal), priceValueX, priceY, { align: 'right' });
    priceY += 6;
    
    if (data.shippingCharges > 0) {
      doc.text('Shipping:', priceBreakdownX, priceY, { align: 'right' });
      doc.text(this.formatCurrency(data.shippingCharges), priceValueX, priceY, { align: 'right' });
      priceY += 6;
    }
    
    if (data.tax > 0) {
      doc.text('Tax:', priceBreakdownX, priceY, { align: 'right' });
      doc.text(this.formatCurrency(data.tax), priceValueX, priceY, { align: 'right' });
      priceY += 6;
    }
    
    if (data.discount > 0) {
      doc.text('Discount:', priceBreakdownX, priceY, { align: 'right' });
      doc.text(`-${this.formatCurrency(data.discount)}`, priceValueX, priceY, { align: 'right' });
      priceY += 6;
    }
    
    priceY += 5;
    
    // TOTAL in red box
    const totalBoxY = priceY - 2;
    const totalBoxHeight = 12;
    const totalBoxWidth = 60;
    doc.setFillColor(...red);
    doc.roundedRect(priceValueX - totalBoxWidth, totalBoxY, totalBoxWidth, totalBoxHeight, 2, 2, 'F');
    
    doc.setFontSize(12);
    doc.setTextColor(...white);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', priceBreakdownX, priceY + 4, { align: 'right' });
    doc.text(this.formatCurrency(data.total), priceValueX - 5, priceY + 4, { align: 'right' });
    
    // Use the maximum Y position from both sides
    currentY = Math.max(paymentY, priceY + 15) + 10;

    // ========== FOOTER ==========
    // Calculate footer bar position first (at the very bottom)
    const footerBarHeight = 15;
    const footerBarY = doc.internal.pageSize.height - footerBarHeight;
    
    // Position footer text and signature on the same line, just above the colored footer bar
    const footerLineY = footerBarY - 20; // Same Y position for both left and right content
    
    // Footer text (left side) - "Thanks for your business!" and notes
    doc.setTextColor(...textColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Thanks for your business!', paymentLeftX, footerLineY);
    
    const notesY = footerLineY + 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    if (data.notes) {
      doc.text(data.notes, paymentLeftX, notesY);
    }
    
    // Signature area (right aligned) - on the same line as "Thanks for your business!"
    doc.setFontSize(9);
    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'normal');
    doc.text(data.customerName || 'Customer', pageWidth - 10, footerLineY, { align: 'right' });
    const signatureLabelY = footerLineY + 5;
    doc.setFontSize(8);
    doc.setTextColor(...black);
    doc.setFont('helvetica', 'bold');
    doc.text('SIGNATURE', pageWidth - 10, signatureLabelY, { align: 'right' });
    
    // Footer bar (colored design at the bottom) - drawn last
    doc.setFillColor(...black);
    doc.rect(0, footerBarY, pageWidth * 0.7, footerBarHeight, 'F');
    doc.setFillColor(...red);
    doc.rect(pageWidth * 0.7, footerBarY, pageWidth * 0.3, footerBarHeight, 'F');

    // ========== DOWNLOAD PDF ==========
    const fileName = `Invoice_${data.invoiceNumber}_${data.orderNumber}.pdf`;
    doc.save(fileName);
  }

  private formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  private formatCurrency(amount: number): string {
    return `$${amount.toFixed(2)}`;
  }
}

