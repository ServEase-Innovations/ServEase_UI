// components/Invoice/Invoice.tsx
/* eslint-disable */
import React from 'react';
import { Download, Calendar, Clock, MapPin, User, CreditCard, FileText } from 'lucide-react';
import { Button } from '../Button/button';
import dayjs from 'dayjs';

interface InvoiceProps {
  booking: any;
  onClose?: () => void;
}

const Invoice: React.FC<InvoiceProps> = ({ booking, onClose }) => {
  const handleDownload = () => {
    // Create a hidden div with invoice content
    const invoiceContent = document.getElementById('invoice-content');
    if (!invoiceContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const styles = `
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 40px;
          color: #333;
        }
        .invoice-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #eee;
          padding-bottom: 20px;
        }
        .company-name {
          font-size: 28px;
          font-weight: bold;
          color: #0A7CFF;
          margin: 0;
        }
        .invoice-title {
          font-size: 24px;
          margin: 10px 0;
        }
        .invoice-details {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
        }
        .section {
          margin-bottom: 30px;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 15px;
          padding-bottom: 8px;
          border-bottom: 2px solid #0A7CFF;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin-bottom: 20px;
        }
        .info-item {
          margin-bottom: 10px;
        }
        .info-label {
          font-weight: 600;
          color: #666;
          margin-bottom: 5px;
        }
        .info-value {
          font-size: 16px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }
        th {
          background: #f8f9fa;
          font-weight: 600;
        }
        .total-row {
          font-weight: bold;
          background: #f8f9fa;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          text-align: center;
          border-top: 1px solid #eee;
          font-size: 12px;
          color: #666;
        }
        @media print {
          body {
            padding: 0;
          }
          .no-print {
            display: none;
          }
        }
      </style>
    `;

    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice #${booking.id}</title>
          ${styles}
        </head>
        <body>
          <div class="invoice-container" id="invoice-content">
            <div class="header">
              <h1 class="company-name">Serveaso</h1>
              <div class="invoice-title">INVOICE</div>
              <p>Professional Service Solutions</p>
            </div>

            <div class="invoice-details">
              <div>
                <div class="info-label">Invoice Number:</div>
                <div class="info-value">INV-${booking.id}</div>
                <div class="info-label">Invoice Date:</div>
                <div class="info-value">${dayjs().format('MMMM D, YYYY')}</div>
              </div>
              <div>
                <div class="info-label">Booking ID:</div>
                <div class="info-value">#${booking.id}</div>
                <div class="info-label">Booking Date:</div>
                <div class="info-value">${dayjs(booking.bookingDate).format('MMMM D, YYYY')}</div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Customer Information</div>
              <div class="info-grid">
                <div>
                  <div class="info-label">Name:</div>
                  <div class="info-value">${booking.customerName || 'Customer'}</div>
                </div>
                <div>
                  <div class="info-label">Service Type:</div>
                  <div class="info-value">${getServiceTitle(booking.service_type)}</div>
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Service Details</div>
              <div class="info-grid">
                <div>
                  <div class="info-label">Start Date:</div>
                  <div class="info-value">${dayjs(booking.startDate).format('MMMM D, YYYY')}</div>
                </div>
                <div>
                  <div class="info-label">End Date:</div>
                  <div class="info-value">${dayjs(booking.endDate).format('MMMM D, YYYY')}</div>
                </div>
                <div>
                  <div class="info-label">Time Slot:</div>
                  <div class="info-value">${formatTimeToAMPM(booking.start_time)} - ${formatTimeToAMPM(booking.end_time)}</div>
                </div>
                ${booking.serviceProviderName ? `
                <div>
                  <div class="info-label">Service Provider:</div>
                  <div class="info-value">${booking.serviceProviderName}</div>
                </div>
                ` : ''}
              </div>
            </div>

            ${booking.responsibilities?.tasks?.length > 0 ? `
            <div class="section">
              <div class="section-title">Tasks & Responsibilities</div>
              <div>
                ${booking.responsibilities.tasks.map((task: any) => `
                  <div>• ${task.taskType} ${Object.entries(task).filter(([key]) => key !== 'taskType').map(([key, value]) => `${value} ${key}`).join(', ')}</div>
                `).join('')}
              </div>
              ${booking.responsibilities.add_ons?.length > 0 ? `
              <div style="margin-top: 10px;">
                <strong>Add-ons:</strong>
                ${booking.responsibilities.add_ons.map((addon: any) => `
                  <div>• ${addon.taskType}</div>
                `).join('')}
              </div>
              ` : ''}
            </div>
            ` : ''}

            <div class="section">
              <div class="section-title">Payment Summary</div>
              <table>
                <thead>
                  <tr><th>Description</th><th>Amount (₹)</th></tr>
                </thead>
                <tbody>
                  <tr><td>Base Amount</td><td>₹${booking.payment?.base_amount || 0}</td></tr>
                  <tr><td>Platform Fee</td><td>₹${booking.payment?.platform_fee || 0}</td></tr>
                  <tr><td>GST (18%)</td><td>₹${booking.payment?.gst || 0}</td></tr>
                  <tr class="total-row"><td><strong>Total Amount</strong></td><td><strong>₹${booking.payment?.total_amount || 0}</strong></td></tr>
                </tbody>
              </table>
              <div>
                <strong>Payment Status:</strong> ${booking.payment?.status || 'N/A'}
              </div>
              <div>
                <strong>Payment Mode:</strong> ${booking.payment?.payment_mode?.toUpperCase() || 'N/A'}
              </div>
              ${booking.payment?.transaction_id ? `
              <div>
                <strong>Transaction ID:</strong> ${booking.payment.transaction_id}
              </div>
              ` : ''}
            </div>

            <div class="footer">
              <p>Thank you for choosing Serveaso!</p>
              <p>For any queries, please contact support@serveaso.com | +91 1234567890</p>
              <p>This is a computer-generated invoice and does not require a physical signature.</p>
            </div>
          </div>
          <div class="no-print" style="text-align: center; margin-top: 20px;">
            <button onclick="window.print()">Print Invoice</button>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
  };

  const getServiceTitle = (type: string) => {
    switch(type) {
      case 'maid': return 'Maid Service';
      case 'cook': return 'Cook Service';
      case 'nanny': return 'Nanny Service';
      default: return 'Service';
    }
  };

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
    } catch (error) {
      return timeString;
    }
  };

  return (
    <div>
      {/* Hidden invoice content for printing */}
      <div id="invoice-content" style={{ display: 'none' }}>
        {/* This content will be cloned for printing */}
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Invoice</h3>
          <Button onClick={handleDownload} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download Invoice
          </Button>
        </div>

        {/* Preview of invoice summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Invoice Number:</span>
              <span className="font-medium">INV-{booking.id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Invoice Date:</span>
              <span className="font-medium">{dayjs().format('MMMM D, YYYY')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-bold text-blue-600">₹{booking.payment?.total_amount || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Payment Status:</span>
              <span className={`font-medium ${
                booking.payment?.status === 'SUCCESS' ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {booking.payment?.status || 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;