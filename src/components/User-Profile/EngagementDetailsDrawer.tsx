/* eslint-disable */
import React from 'react';
import { X, Calendar, Clock, MapPin, User, CreditCard, Tag, FileText, AlertCircle, CheckCircle, XCircle, Download, Printer } from 'lucide-react';
import { Badge } from '../../components/Common/Badge/Badge';
import { Separator } from '../../components/Common/Separator/Separator';
import { getServiceTitle, getBookingTypeBadge, getStatusBadge } from '../Common/Booking/BookingUtils';
import dayjs from 'dayjs';
import { DialogHeader } from '../ProviderDetails/CookServicesDialog.styles';
import PaymentInstance from 'src/services/paymentInstance';
import { Button } from '../../components/Button/button';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface EngagementDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any; // Replace with proper Booking type
  onPaymentComplete?: () => void; // Callback to refresh bookings after payment
}

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

const formatDate = (dateString: string) => {
  return dayjs(dateString).format('MMMM D, YYYY');
};

const EngagementDetailsDrawer: React.FC<EngagementDetailsDrawerProps> = ({ 
  isOpen, 
  onClose, 
  booking,
  onPaymentComplete 
}) => {
  const [isProcessingPayment, setIsProcessingPayment] = React.useState(false);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = React.useState(false);

  if (!isOpen || !booking) return null;

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'text-green-600 bg-green-50';
      case 'PENDING': return 'text-yellow-600 bg-yellow-50';
      case 'FAILED': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

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
      
      // Create a temporary container for the invoice
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.width = '800px';
      tempDiv.style.backgroundColor = '#ffffff';
      document.body.appendChild(tempDiv);
      
      // Generate HTML without print buttons
      const invoiceHTML = generateInvoiceHTML();
      tempDiv.innerHTML = invoiceHTML;
      
      // Get the invoice element
      const invoiceElement = tempDiv.querySelector('#invoice-content') as HTMLElement;
      
      if (!invoiceElement) {
        throw new Error('Invoice element not found');
      }
      
      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Render the element to canvas
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
      
      // Create PDF
      const pdf = new jsPDF({
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      });
      
      // Calculate dimensions
      const imgWidth = 190; // A4 width in mm (with margins)
      const pageHeight = 277; // A4 height in mm (with margins)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      // Add first page
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Add additional pages if content overflows
      while (heightLeft > 0) {
        pdf.addPage();
        position = heightLeft - imgHeight;
        pdf.addImage(imgData, 'PNG', 10, position - (heightLeft - pageHeight) + 10, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Save the PDF - this triggers download automatically
      pdf.save(`invoice-${booking.id}.pdf`);
      
      // Clean up
      document.body.removeChild(tempDiv);
      
      // Show success message
      console.log('Invoice downloaded successfully');
      
    } catch (error) {
      console.error('Error generating invoice PDF:', error);
      alert('Failed to generate invoice. Please try again.');
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  const handleCompletePayment = async () => {
    try {
      setIsProcessingPayment(true);
      
      const resumeRes = await PaymentInstance.get(
        `/api/payments/${booking.payment?.engagement_id}/resume`
      );

      const {
        razorpay_order_id,
        amount,
        currency,
        engagement_id,
        customer
      } = resumeRes.data;

      const options = {
        key: "rzp_test_lTdgjtSRlEwreA",
        amount: amount * 100,
        currency,
        order_id: razorpay_order_id,
        name: "Serveaso",
        description: "Complete your payment",
        prefill: {
          name: customer?.firstname || booking.customerName,
          contact: customer?.contact || '9999999999',
        },
        handler: async function (response: any) {
          try {
            await PaymentInstance.post("/api/payments/verify", {
              engagementId: engagement_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            
            if (onPaymentComplete) {
              onPaymentComplete();
            }
            
            console.log('Payment completed successfully');
            alert('Payment successful! You can now download your invoice.');
            
          } catch (verifyError) {
            console.error("Payment verification error:", verifyError);
            alert("Payment verification failed. Please contact support.");
          }
        },
        theme: {
          color: "#0A7CFF",
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();

    } catch (err: any) {
      console.error("Complete payment error:", err);
      alert("Unable to resume payment. Please try again.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 transition-opacity z-50 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full md:w-[500px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <DialogHeader className="flex items-center justify-between bg-gray-900 px-4 py-3">
          <h2 className="text-xl font-semibold text-white">
            Booking Details
          </h2>

          <button
            onClick={onClose}
            className="p-2 rounded-full transition-colors hover:bg-gray-800 absolute top-3 right-3"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </DialogHeader>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Booking ID and Status */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Booking ID</p>
              <p className="text-lg font-medium text-gray-900">#{booking.id}</p>
            </div>
            <div className="flex gap-2">
              {getBookingTypeBadge(booking.bookingType)}
              {getStatusBadge(booking.taskStatus)}
            </div>
          </div>

          {/* Service Type */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <span className="text-2xl">
                  {booking.service_type === 'maid' ? '🧹' : 
                   booking.service_type === 'cook' ? '👩‍🍳' : 
                   booking.service_type === 'nanny' ? '❤️' : '🧹'}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Service Type</p>
                <p className="text-xl font-bold text-gray-900">{getServiceTitle(booking.service_type)}</p>
              </div>
            </div>
          </div>

          {/* Schedule Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Schedule
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Start Date</p>
                <p className="font-medium">{formatDate(booking.startDate)}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">End Date</p>
                <p className="font-medium">{formatDate(booking.endDate)}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Time Slot</p>
              <p className="font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                {formatTimeToAMPM(booking.start_time)} - {formatTimeToAMPM(booking.end_time)}
              </p>
            </div>
          </div>

          {/* Provider Information */}
          {booking.serviceProviderName && booking.serviceProviderName !== 'Not Assigned' && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                <User className="h-5 w-5 text-green-500" />
                Service Provider
              </h3>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{booking.serviceProviderName}</p>
                  </div>
                  {booking.providerRating > 0 && (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      ⭐ {booking.providerRating.toFixed(1)}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tasks & Responsibilities */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-500" />
              Tasks & Responsibilities
            </h3>
            
            <div className="space-y-3">
              {/* Main Tasks */}
              {booking.responsibilities?.tasks && booking.responsibilities.tasks.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Main Tasks</p>
                  <div className="flex flex-wrap gap-2">
                    {booking.responsibilities.tasks.map((task: any, index: number) => {
                      const taskDetails = Object.entries(task)
                        .filter(([key]) => key !== 'taskType')
                        .map(([key, value]) => `${value} ${key}`)
                        .join(', ');
                      
                      return (
                        <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {task.taskType} {taskDetails && `- ${taskDetails}`}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Add-ons */}
              {booking.responsibilities?.add_ons && booking.responsibilities.add_ons.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Add-ons</p>
                  <div className="flex flex-wrap gap-2">
                    {booking.responsibilities.add_ons.map((addon: any, index: number) => (
                      <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {addon.taskType}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Details */}
          {booking.payment && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-orange-500" />
                Payment Details
              </h3>
              
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Base Amount</span>
                  <span className="font-medium">₹{booking.payment.base_amount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Platform Fee</span>
                  <span className="font-medium">₹{booking.payment.platform_fee}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">GST</span>
                  <span className="font-medium">₹{booking.payment.gst}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total</span>
                  <span className="text-blue-600">₹{booking.payment.total_amount}</span>
                </div>
                
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                  <span className="text-gray-600">Payment Status</span>
                  <Badge className={getPaymentStatusColor(booking.payment.status)}>
                    {booking.payment.status}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payment Mode</span>
                  <span className="font-medium capitalize">{booking.payment.payment_mode}</span>
                </div>

                {/* Complete Payment Button - Show only for PENDING status */}
                {booking.payment.status === 'PENDING' && booking.taskStatus !== 'CANCELLED' && (
                  <div className="mt-4">
                    <Button
                      variant="default"
                      size="lg"
                      onClick={handleCompletePayment}
                      disabled={isProcessingPayment}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3"
                    >
                      <CreditCard className="h-5 w-5 mr-2" />
                      {isProcessingPayment ? 'Processing...' : 'Complete Payment Now'}
                    </Button>
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Complete payment to confirm your booking
                    </p>
                  </div>
                )}

                {/* Invoice Button - Show only for SUCCESS status */}
                {booking.payment.status === 'SUCCESS' && (
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
                )}
              </div>
            </div>
          )}

          {/* Modification History */}
          {booking.modifications && booking.modifications.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                Modification History
              </h3>
              
              <div className="space-y-3">
                {booking.modifications.map((mod: any, index: number) => (
                  <div key={index} className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-yellow-200 text-yellow-800">
                        {mod.action}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {dayjs(mod.date).format('MMM D, YYYY h:mm A')}
                      </span>
                    </div>
                    {mod.refund && (
                      <p className="text-sm text-green-600">Refund: ₹{mod.refund}</p>
                    )}
                    {mod.penalty && (
                      <p className="text-sm text-red-600">Penalty: ₹{mod.penalty}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <Tag className="h-5 w-5 text-gray-500" />
              Additional Information
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Booking Date</p>
                <p className="text-sm font-medium">{dayjs(booking.bookingDate).format('MMM D, YYYY')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Assignment Status</p>
                <p className="text-sm font-medium capitalize">{booking.assignmentStatus}</p>
              </div>
              {booking.leave_days > 0 && (
                <div>
                  <p className="text-xs text-gray-500">Leave Days</p>
                  <p className="text-sm font-medium">{booking.leave_days}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add CSS for highlight animation */}
      <style>{`
        .highlight-booking {
          animation: highlightPulse 2s ease-in-out;
          border: 2px solid #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
        }
        
        @keyframes highlightPulse {
          0%, 100% {
            border-color: #3b82f6;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
          }
          50% {
            border-color: #60a5fa;
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5);
          }
        }
      `}</style>
    </>
  );
};

export default EngagementDetailsDrawer;