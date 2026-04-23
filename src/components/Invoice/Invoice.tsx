import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '../../components/Button/button';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import dayjs from 'dayjs';
import { getServiceTitle } from '../Common/Booking/BookingUtils';

interface InvoiceProps {
  booking: any;
}

const Invoice: React.FC<InvoiceProps> = ({ booking }) => {
  const [isGeneratingInvoice, setIsGeneratingInvoice] = React.useState(false);

  const formatTimeToAMPM = (timeString?: string): string => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const minute = parseInt(minutes, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    const displayMinute = minute.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${period}`;
  };

  const formatDate = (dateString?: string) => dayjs(dateString).format('DD MMM YYYY');
  const formatDateLong = (dateString?: string) => dayjs(dateString).format('MMMM D, YYYY');

  const toNumber = (value: any): number => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  // ----- CUSTOMER NAME (robust) -----
  const getCustomerName = (): string => {
    if (booking.customerName) return booking.customerName;
    if (booking.name) return booking.name;
    if (booking.customer) {
      const { firstname, lastname } = booking.customer;
      if (firstname) return `${firstname} ${lastname || ''}`.trim();
    }
    return 'Customer';
  };
  const customerName = getCustomerName();

  // ----- ADDRESS -----
  const address = booking.address ?? booking.serviceAddress ?? 'Address not provided';
  const city = booking.city ?? 'Bengaluru';
  const pincode = booking.pincode ?? '560037';
  const fullAddress = `${address}, ${city} - ${pincode}`;
  const serviceAddress = booking.serviceAddress ?? address;

  // ----- BOOKING DETAILS -----
  const bookingId = booking.id;
  const bookingDate = booking.bookingDate ?? new Date().toISOString();

  // ----- SERVICE PROVIDER -----
  const providerName = booking.serviceProviderName && booking.serviceProviderName !== 'Not Assigned'
    ? booking.serviceProviderName
    : 'Not Assigned';

  // ----- BOOKING TYPE (Monthly / Short Term / On Demand) -----
  const getBookingTypeLabel = (): string => {
    const raw = (booking.bookingType || '').toUpperCase();
    switch (raw) {
      case 'MONTHLY':
        return 'Monthly';
      case 'SHORT_TERM':
        return 'Short Term';
      case 'ONDEMAND':
        return 'On Demand';
      default:
        return booking.bookingType || 'On Demand';
    }
  };
  const bookingTypeLabel = getBookingTypeLabel();

  // ----- SERVICE DETAILS -----
  const serviceType = booking.service_type ?? 'cleaning';
  const serviceDisplayName = getServiceTitle(serviceType) ?? 'Cleaning Service';
  let taskType = 'Deep Cleaning';
  if (booking.responsibilities?.tasks?.length) {
    taskType = booking.responsibilities.tasks.map((t: any) => t.taskType).join(', ');
  }

  // ----- DATES & TIMES -----
  const startDate = booking.startDate ?? new Date().toISOString();
  const endDate = booking.endDate ?? startDate;
  const startTime = booking.start_time ?? '09:00';
  const endTime = booking.end_time ?? '17:00';

  // ----- PAYMENT -----
  const baseAmount = toNumber(booking.payment?.base_amount);
  const discount = toNumber(booking.payment?.discount);
  const platformFee = toNumber(booking.payment?.platform_fee);
  const gst = toNumber(booking.payment?.gst);
  const totalAmount = toNumber(booking.payment?.total_amount);

  // ----- COMPANY STATIC INFO (UPDATED ADDRESS) -----
  const companyName = 'ServEaso Private Limited';
  const companyAddress = '#58, 5th Main, Sir MV Nagar, Ramamurthy Nagar, Bengaluru – 560016';
  const companyPan = 'ABPCS0218M';
  const companyGst = '29AAGCP05621PZV';
  const companyTan = 'BLRS43846E';
  const companyCin = 'U74900KA2021PTC152324';
  const companyWebsite = 'www.serveaso.com';
  const supportPhone = '080-123456789';
  const supportEmail = 'support@serveaso.com';
  const logoSrc = '/ServEaso_Logo.png';

  const invoiceNumber = `INV-${bookingId}-${dayjs().format('YYYYMMDD')}`;
  const invoiceDate = dayjs().format('DD MMM YYYY');
  const scheduleDisplay = `${formatDateLong(startDate)} - ${formatDateLong(endDate)}`;
  const timeDisplay = `${formatTimeToAMPM(startTime)} to ${formatTimeToAMPM(endTime)}`;

  const generateInvoiceHTML = () => `
    <!DOCTYPE html>
    <html>
      <head><title>Invoice #${invoiceNumber}</title><meta charset="utf-8"><style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'Segoe UI',Arial,sans-serif; background:#eef2f5; padding:30px 20px; color:#1a1a1a; }
        .invoice-container { max-width:1000px; margin:0 auto; background:white; box-shadow:0 4px 12px rgba(0,0,0,0.1); border-radius:4px; overflow:hidden; }
        .blue-header { background:#1e3c72; color:white; padding:12px 32px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; }
        .brand-section { display:flex; align-items:center; gap:10px; }
        .logo-container { display:flex; align-items:center; margin-left: -20px; }
        .logo-image { height:100px; width:auto; object-fit:contain; }
        .brand-text h1 { font-size:24px; font-weight:700; letter-spacing:1px; margin-bottom:4px; }
        .invoice-title { font-size:12px; font-weight:500; opacity:0.9; }
        .invoice-details-right { text-align:right; }
        .invoice-number { font-size:14px; font-weight:600; margin-bottom:4px; }
        .invoice-date { font-size:13px; opacity:0.9; }
        .support-contact { margin-top:6px; font-size:11px; opacity:0.85; }
        .address-section { padding:24px 32px; border-bottom:1px solid #e5e7eb; display:flex; justify-content:space-between; flex-wrap:wrap; gap:32px; background:#fafbfc; }
        .address-box { flex:1; }
        .address-title { font-weight:700; font-size:14px; color:#1e3c72; margin-bottom:10px; }
        .address-text { font-size:13px; line-height:1.5; color:#333; }
        .order-info { padding:16px 32px; background:white; border-bottom:1px solid #e5e7eb; display:flex; flex-wrap:wrap; gap:24px; font-size:13px; }
        .order-info-item { flex:1; min-width:180px; }
        .order-info-label { font-weight:600; color:#4b5563; margin-right:8px; }
        .content-section { padding:8px 32px 24px 32px; }
        .info-table { width:100%; border-collapse:collapse; margin-bottom:28px; font-size:13px; }
        .info-table th, .info-table td { padding:12px 16px; border:1px solid #e2e8f0; vertical-align:top; text-align:left; }
        .info-table th { background:#f8fafc; font-weight:700; color:#1e3c72; }
        .payment-table { width:100%; border-collapse:collapse; margin-top:8px; margin-bottom:16px; }
        .payment-table td { padding:10px 16px; border:none; border-bottom:1px solid #f0f2f5; }
        .payment-table .label { text-align:left; font-weight:500; color:#4b5563; }
        .payment-table .value { text-align:right; font-weight:500; color:#1f2937; }
        .payment-table .total-row { border-top:2px solid #1e3c72; font-weight:800; background:#f9fafb; }
        .invoice-footer { padding:20px 32px; border-top:1px solid #e5e7eb; background:#fafbfc; font-size:11px; color:#4b5563; text-align:center; }
        .footer-company { font-weight:700; margin-bottom:6px; color:#1e3c72; }
        hr { margin:12px 0; border:none; border-top:1px solid #e5e7eb; }
        .thankyou { margin-top:12px; font-size:11px; font-weight:500; }
      </style></head>
      <body>
        <div class="invoice-container" id="invoice-content">
          <div class="blue-header">
            <div class="brand-section">
              <div class="logo-container"><img src="${logoSrc}" class="logo-image" onerror="this.style.display='none';" /></div>
              <div class="brand-text"><div class="invoice-title">Tax Invoice / Cash Memo / Bill of Supply</div></div>
            </div>
            <div class="invoice-details-right">
              <div class="invoice-number">Invoice No: ${invoiceNumber}</div>
              <div class="invoice-date">Invoice Date: ${invoiceDate}</div>
              <div class="support-contact">📞 ${supportPhone} &nbsp;| ✉️ ${supportEmail}</div>
            </div>
          </div>
          <div class="address-section">
            <div class="address-box">
              <div class="address-title">ServEaso Private Limited</div>
              <div class="address-text">${companyAddress}<br />PAN: ${companyPan}<br />GST: ${companyGst}</div>
            </div>
            <div class="address-box">
              <div class="address-title">Customer / Communication Address</div>
              <div class="address-text"><strong>${customerName}</strong><br />${address}<br />${city}, ${pincode}</div>
              <div class="address-title" style="margin-top:12px;">Service Address</div>
              <div class="address-text">${serviceAddress}</div>
            </div>
          </div>
          <div class="order-info">
            <div class="order-info-item"><span class="order-info-label">Booking ID :</span>${bookingId}</div>
            <div class="order-info-item"><span class="order-info-label">Booking Date :</span>${formatDate(bookingDate)}</div>
          </div>
          <div class="content-section">
            <table class="info-table"><thead><tr><th>Name</th><th>Area / Locality</th></tr></thead><tbody><tr><td><strong>${customerName}</strong></td><td>${fullAddress}</td></tr></tbody></table>
            <table class="info-table"><thead><tr><th>Service Type</th><th>Task Type / Details</th><th>Schedule</th><th>Type</th><th>Provider</th></tr></thead><tbody><tr>
              <td>${serviceDisplayName}</td>
              <td>${taskType}</td>
              <td>${scheduleDisplay}<br />${timeDisplay}</td>
              <td>${bookingTypeLabel}</td>
              <td>${providerName}</td>
            </tr></tbody></table>
            <table class="payment-table"><tbody>
              <tr><td class="label">Base Amount</td><td class="value">₹${baseAmount.toFixed(2)}</td></tr>
              ${discount > 0 ? `<tr><td class="label">Coupon Applied</td><td class="value">- ₹${discount.toFixed(2)}</td></tr>` : ''}
              <tr><td class="label">Platform Fee</td><td class="value">₹${platformFee.toFixed(2)}</td></tr>
              <tr><td class="label">GST (18%)</td><td class="value">₹${gst.toFixed(2)}</td></tr>
              <tr class="total-row"><td class="label"><strong>Total Amount</strong></td><td class="value"><strong>₹${totalAmount.toFixed(2)}</strong></td></tr>
            </tbody></table>
            <div style="font-size:12px; color:#4b5563; text-align:right; margin-top:8px;">
              Payment Status: ${booking.payment?.status || 'Completed'} | Mode: ${booking.payment?.payment_mode?.toUpperCase() || 'ONLINE'}
              ${booking.payment?.transaction_id ? ` | TXN: ${booking.payment.transaction_id}` : ''}
            </div>
          </div>
          <div class="invoice-footer">
            <div class="footer-company">${companyName}</div>
            <div>${companyAddress}</div>
            <div>CIN: ${companyCin} | PAN: ${companyPan} | GST: ${companyGst} | TAN: ${companyTan}</div>
            <div>📞 ${supportPhone} &nbsp;| ✉️ ${supportEmail} &nbsp;| 🌐 ${companyWebsite}</div>
            <hr /><div class="thankyou">Thank you for choosing ServEaso!</div>
            <div>For any queries, contact us at ${supportEmail} or ${supportPhone}</div>
            <div style="margin-top:6px; font-size:10px;">This is a computer generated invoice and does not require a physical signature.</div>
          </div>
        </div>
      </body>
    </html>
  `;

  const handleDownloadInvoice = async () => {
    try {
      setIsGeneratingInvoice(true);
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.width = '1000px';
      tempDiv.style.backgroundColor = '#ffffff';
      document.body.appendChild(tempDiv);
      tempDiv.innerHTML = generateInvoiceHTML();

      const invoiceElement = tempDiv.querySelector('#invoice-content') as HTMLElement;
      if (!invoiceElement) throw new Error('Invoice element not found');

      const images = invoiceElement.querySelectorAll('img');
      await Promise.all(Array.from(images).map(img => new Promise((resolve, reject) => {
        if (img.complete && img.naturalWidth > 0) resolve(true);
        else { img.onload = () => resolve(true); img.onerror = () => reject(new Error(`Image load error: ${img.src}`)); }
      })));

      await new Promise(r => setTimeout(r, 100));
      const canvas = await html2canvas(invoiceElement, { scale: 3, useCORS: true, backgroundColor: '#ffffff', windowWidth: 1000 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
      const imgWidth = 190;
      const pageHeight = 277;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft > 0) {
        pdf.addPage();
        position = heightLeft - imgHeight;
        pdf.addImage(imgData, 'PNG', 10, position - (heightLeft - pageHeight) + 10, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save(`invoice-${bookingId}.pdf`);
      document.body.removeChild(tempDiv);
    } catch (error) {
      console.error('Invoice generation error:', error);
      alert(`Failed to generate invoice: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <Button variant="outline" size="lg" onClick={handleDownloadInvoice} disabled={isGeneratingInvoice}
        className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3">
        <Download className="h-5 w-5 mr-2" />
        {isGeneratingInvoice ? 'Generating PDF...' : 'Download Invoice (PDF)'}
      </Button>
      <p className="text-xs text-gray-500 text-center mt-2">PDF will be downloaded automatically</p>
    </div>
  );
};

export default Invoice;