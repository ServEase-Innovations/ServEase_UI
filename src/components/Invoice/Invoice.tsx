import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '../../components/Button/button';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import dayjs from 'dayjs';
import { getServiceTitle } from '../Common/Booking/BookingUtils';

interface InvoiceProps {
  booking: any; // Replace with proper Booking type
}

const Invoice: React.FC<InvoiceProps> = ({ booking }) => {
  const [isGeneratingInvoice, setIsGeneratingInvoice] = React.useState(false);

  const formatTimeToAMPM = (timeString: string): string => {
    if (!timeString) return '';
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours, 10);
      const minute = parseInt(minutes, 10);
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      const displayMinute = minute.toString().padStart(2, '0');
      return `${displayHour}:${displayMinute} ${period}`;
    } catch {
      return timeString;
    }
  };

  const formatDate = (dateString: string) => dayjs(dateString).format('MMMM D, YYYY');

  const generateInvoiceHTML = () => {
    const invoiceNumber = `INV-${booking.id}-${dayjs().format('YYYYMMDD')}`;
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice #${booking.id}</title>
          <meta charset="utf-8">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: white;
              padding: 20px;
              color: #333;
            }
            .invoice-container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              border-radius: 12px;
              overflow: hidden;
            }
            .invoice-header {
              background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
              color: white;
              padding: 40px;
              text-align: center;
            }
            .company-name {
              font-size: 32px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .invoice-title {
              font-size: 24px;
              opacity: 0.9;
              margin-top: 10px;
            }
            .invoice-details {
              padding: 30px 40px;
              background: #f8f9fa;
              display: flex;
              justify-content: space-between;
              border-bottom: 1px solid #e0e0e0;
            }
            .info-label {
              font-size: 12px;
              font-weight: 600;
              color: #666;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 5px;
            }
            .info-value {
              font-size: 16px;
              font-weight: 500;
              color: #333;
            }
            .content-section {
              padding: 30px 40px;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 20px;
              padding-bottom: 10px;
              border-bottom: 2px solid #2a5298;
              color: #1e3c72;
            }
            .info-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
              margin-bottom: 30px;
            }
            .tasks-list {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            .task-item {
              padding: 8px 0;
              border-bottom: 1px solid #e0e0e0;
            }
            .task-item:last-child {
              border-bottom: none;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th, td {
              padding: 12px;
              text-align: left;
              border-bottom: 1px solid #e0e0e0;
            }
            th {
              background: #f8f9fa;
              font-weight: 600;
              color: #555;
            }
            .total-row {
              font-weight: bold;
              background: #f8f9fa;
            }
            .total-row td {
              border-top: 2px solid #ddd;
            }
            .payment-status {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
              margin-top: 10px;
            }
            .status-success {
              background: #d4edda;
              color: #155724;
            }
            .invoice-footer {
              background: #f8f9fa;
              padding: 20px 40px;
              text-align: center;
              border-top: 1px solid #e0e0e0;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="invoice-container" id="invoice-content">
            <div class="invoice-header">
              <div class="company-name">Serveaso</div>
              <div class="invoice-title">TAX INVOICE</div>
            </div>
            <div class="invoice-details">
              <div>
                <div class="info-label">Invoice Number</div>
                <div class="info-value">${invoiceNumber}</div>
                <div class="info-label" style="margin-top: 10px;">Invoice Date</div>
                <div class="info-value">${dayjs().format('MMMM D, YYYY')}</div>
              </div>
              <div>
                <div class="info-label">Booking ID</div>
                <div class="info-value">#${booking.id}</div>
                <div class="info-label" style="margin-top: 10px;">Booking Date</div>
                <div class="info-value">${dayjs(booking.bookingDate).format('MMMM D, YYYY')}</div>
              </div>
            </div>
            <div class="content-section">
              <div class="section-title">Customer Information</div>
              <div class="info-grid">
                <div>
                  <div class="info-label">Customer Name</div>
                  <div class="info-value">${booking.customerName || 'Customer'}</div>
                </div>
                <div>
                  <div class="info-label">Service Type</div>
                  <div class="info-value">${getServiceTitle(booking.service_type)}</div>
                </div>
              </div>
              <div class="section-title">Service Schedule</div>
              <div class="info-grid">
                <div>
                  <div class="info-label">Start Date</div>
                  <div class="info-value">${formatDate(booking.startDate)}</div>
                </div>
                <div>
                  <div class="info-label">End Date</div>
                  <div class="info-value">${formatDate(booking.endDate)}</div>
                </div>
                <div>
                  <div class="info-label">Time Slot</div>
                  <div class="info-value">${formatTimeToAMPM(booking.start_time)} - ${formatTimeToAMPM(booking.end_time)}</div>
                </div>
                ${booking.serviceProviderName && booking.serviceProviderName !== 'Not Assigned' ? `
                <div>
                  <div class="info-label">Service Provider</div>
                  <div class="info-value">${booking.serviceProviderName}</div>
                </div>
                ` : ''}
              </div>
              ${booking.responsibilities?.tasks?.length > 0 ? `
              <div class="section-title">Tasks & Responsibilities</div>
              <div class="tasks-list">
                ${booking.responsibilities.tasks.map((task: any) => `
                  <div class="task-item">
                    <strong>${task.taskType}</strong>
                    ${Object.entries(task)
                      .filter(([key]) => key !== 'taskType')
                      .map(([key, value]) => ` - ${value} ${key}`)
                      .join('')}
                  </div>
                `).join('')}
                ${booking.responsibilities.add_ons?.length > 0 ? `
                  <div style="margin-top: 15px;">
                    <strong>Add-ons:</strong>
                    ${booking.responsibilities.add_ons.map((addon: any) => `
                      <div>• ${addon.taskType}</div>
                    `).join('')}
                  </div>
                ` : ''}
              </div>
              ` : ''}
              <div class="section-title">Payment Summary</div>
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Base Amount</td>
                    <td>₹${booking.payment?.base_amount || 0}</td>
                  </tr>
                  <tr>
                    <td>Platform Fee</td>
                    <td>₹${booking.payment?.platform_fee || 0}</td>
                  </tr>
                  <tr>
                    <td>GST (18%)</td>
                    <td>₹${booking.payment?.gst || 0}</td>
                  </tr>
                  <tr class="total-row">
                    <td><strong>Total Amount</strong></td>
                    <td><strong>₹${booking.payment?.total_amount || 0}</strong></td>
                  </tr>
                </tbody>
              </table>
              <div style="margin-top: 20px;">
                <div class="info-label">Payment Status</div>
                <div class="payment-status status-success">
                  ${booking.payment?.status || 'N/A'}
                </div>
                <div class="info-label" style="margin-top: 15px;">Payment Mode</div>
                <div class="info-value">${booking.payment?.payment_mode?.toUpperCase() || 'N/A'}</div>
                ${booking.payment?.transaction_id ? `
                <div class="info-label" style="margin-top: 15px;">Transaction ID</div>
                <div class="info-value">${booking.payment.transaction_id}</div>
                ` : ''}
              </div>
            </div>
            <div class="invoice-footer">
              <p>Thank you for choosing Serveaso!</p>
              <p>For any queries, please contact support@serveaso.com | +91 1234567890</p>
              <p>This is a computer-generated invoice and does not require a physical signature.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const handleDownloadInvoice = async () => {
    try {
      setIsGeneratingInvoice(true);
      
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.width = '800px';
      tempDiv.style.backgroundColor = '#ffffff';
      document.body.appendChild(tempDiv);
      
      tempDiv.innerHTML = generateInvoiceHTML();
      const invoiceElement = tempDiv.querySelector('#invoice-content') as HTMLElement;
      
      if (!invoiceElement) {
        throw new Error('Invoice element not found');
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const canvas = await html2canvas(invoiceElement, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 800,
        onclone: (clonedDoc, element) => {
          if (element && element instanceof HTMLElement) {
            element.style.width = '800px';
          }
        }
      });
      
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
      
      pdf.save(`invoice-${booking.id}.pdf`);
      document.body.removeChild(tempDiv);
    } catch (error) {
      console.error('Error generating invoice PDF:', error);
      alert('Failed to generate invoice. Please try again.');
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <Button
        variant="outline"
        size="lg"
        onClick={handleDownloadInvoice}
        disabled={isGeneratingInvoice}
        className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3"
      >
        <Download className="h-5 w-5 mr-2" />
        {isGeneratingInvoice ? 'Generating PDF...' : 'Download Invoice (PDF)'}
      </Button>
      <p className="text-xs text-gray-500 text-center mt-2">
        PDF will be downloaded automatically
      </p>
    </div>
  );
};

export default Invoice;