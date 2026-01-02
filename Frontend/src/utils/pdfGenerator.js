import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Generate PDF invoice for an order
export const generateInvoicePDF = async (order) => {
  try {
    // Create a temporary div to render the invoice
    const invoiceDiv = document.createElement('div');
    invoiceDiv.style.position = 'absolute';
    invoiceDiv.style.left = '-9999px';
    invoiceDiv.style.top = '0';
    invoiceDiv.style.width = '800px';
    invoiceDiv.style.backgroundColor = 'white';
    invoiceDiv.style.padding = '10px';
    invoiceDiv.style.fontFamily = 'Arial, sans-serif';

    // Generate HTML content
    invoiceDiv.innerHTML = generateInvoiceHTML(order);

    // Append to body temporarily
    document.body.appendChild(invoiceDiv);

    // Convert to canvas
    const canvas = await html2canvas(invoiceDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    // Remove temporary div
    document.body.removeChild(invoiceDiv);

    // Create PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Check if content fits on one page
    if (imgHeight <= pageHeight) {
      // Content fits on one page
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    } else {
      // Scale down to fit on one page
      const scale = pageHeight / imgHeight;
      const scaledWidth = imgWidth * scale;
      const scaledHeight = imgHeight * scale;
      const xOffset = (imgWidth - scaledWidth) / 2;

      pdf.addImage(imgData, 'PNG', xOffset, 0, scaledWidth, scaledHeight);
    }

    return pdf;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

// Generate HTML content for the invoice
const generateInvoiceHTML = (order) => {
  // NEW: Calculate subtotal and delivery fee
  const itemsTotal = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const addOnsTotal = order.addOns?.reduce((acc, addOn) => acc + (addOn.price * (addOn.quantity || 1)), 0) || 0;
  const subtotal = itemsTotal + addOnsTotal;
  const deliveryFee = order.totalAmount > subtotal ? order.totalAmount - subtotal : 0;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Kolkata'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata'
    });
  };

  const getStatusColor = (status) => {
    const statusColors = {
      processing: '#fbbf24',
      confirmed: '#3b82f6',
      manufacturing: '#8b5cf6',
      shipped: '#6366f1',
      delivered: '#10b981'
    };
    return statusColors[status] || '#6b7280';
  };

  const getPaymentStatusColor = (status) => {
    const statusColors = {
      pending: '#fbbf24',
      pending_upfront: '#3b82f6',
      completed: '#10b981',
      failed: '#ef4444'
    };
    return statusColors[status] || '#6b7280';
  };

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.4; color: #333; background: #f8fafc; padding: 10px;">
      <div style="max-width: 800px; margin: 0 auto; background: white; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); border-radius: 6px; overflow: hidden;">
        
        <div style="background: linear-gradient(135deg, #FCD24C 0%, #FCD24C 100%); color:#1D1B4A; padding: 1.5rem; text-align: center;">
          <div style="margin-bottom: 0.3rem;">
            <h1 style="font-size: 2.2rem; font-weight: 900; margin: 0; letter-spacing: 1px; text-transform: uppercase; font-family: 'Arial Black', sans-serif;">TODAY MY DREAM</h1>
          </div>
          <div style="height: 2px; width: 100px; background: white; margin: 0.5rem auto 0.5rem auto; opacity: 0.8;"></div>
          <p style="font-size: 0.9rem; opacity: 0.95; margin: 0; font-weight: 500; letter-spacing: 0.5px;">Celebration Decor & More</p>
          <p style="font-size: 0.75rem; opacity: 0.85; margin: 0.3rem 0 0 0;">🎈 Premium Quality | 🎉 Perfect Celebrations</p>
        </div>
        
        <div style="padding: 1rem;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
            
            <div style="flex: 1; min-width: 180px;">
              <h3 style="color: #f59e0b; margin-bottom: 0.5rem; font-size: 1rem; border-bottom: 1px solid #f59e0b; padding-bottom: 0.3rem;">Invoice Details</h3>
              <div style="margin-bottom: 0.3rem;">
                <div style="font-weight: 600; color: #6b7280; font-size: 0.8rem;">Order ID</div>
                <div style="color: #1f2937; font-size: 0.9rem; font-weight: bold;">#${order.customOrderId || order._id}</div>
              </div>
              ${order.customOrderId ? `
              <div style="margin-bottom: 0.3rem;">
                <div style="font-weight: 600; color: #6b7280; font-size: 0.7rem;">Database ID</div>
                <div style="color: #6b7280; font-size: 0.75rem;">${order._id}</div>
              </div>
              ` : ''}
              <div style="margin-bottom: 0.3rem;">
                <div style="font-weight: 600; color: #6b7280; font-size: 0.8rem;">Order Time</div>
                <div style="color: #1f2937; font-size: 0.85rem;">${formatDateTime(order.createdAt)}</div>
              </div>
            </div>
            
            <div style="flex: 1; min-width: 180px;">
              <h3 style="color: #f59e0b; margin-bottom: 0.5rem; font-size: 1rem; border-bottom: 1px solid #f59e0b; padding-bottom: 0.3rem;">Customer Information</h3>
              <div style="margin-bottom: 0.3rem;">
                <div style="font-weight: 600; color: #6b7280; font-size: 0.8rem;">Name</div>
                <div style="color: #1f2937; font-size: 0.85rem;">${order.customerName}</div>
              </div>
              <div style="margin-bottom: 0.3rem;">
                <div style="font-weight: 600; color: #6b7280; font-size: 0.8rem;">Email</div>
                <div style="color: #1f2937; font-size: 0.85rem;">${order.email}</div>
              </div>
              <div style="margin-bottom: 0.3rem;">
                <div style="font-weight: 600; color: #6b7280; font-size: 0.8rem;">Phone</div>
                <div style="color: #1f2937; font-size: 0.85rem;">${order.phone}</div>
              </div>
              <div style="margin-bottom: 0.3rem;">
                <div style="font-weight: 600; color: #6b7280; font-size: 0.8rem;">Payment Method</div>
                <div style="color: #1f2937; font-size: 0.85rem;">${order.paymentMethod?.toUpperCase()}</div>
              </div>
            </div>
          </div>
          
          <!-- Shipping Address -->
          <div style="background: #fef3c7; padding: 0.8rem; border-radius: 6px; margin-top: 0.8rem; border-left: 3px solid #f59e0b;">
            <h3 style="color: #f59e0b; margin-bottom: 0.5rem; font-size: 0.9rem; font-weight: bold;">Shipping Address</h3>
            <p style="color: #1f2937; line-height: 1.4; margin: 0; font-size: 0.85rem;">
              ${order.address.street}<br />
              ${order.address.pincode}<br />
              ${order.address.country}
            </p>
          </div>
          
          <!-- Order Items -->
          <div style="margin-top: 1rem;">
            <h3 style="color: #f59e0b; margin-bottom: 0.5rem; font-size: 1rem; border-bottom: 1px solid #f59e0b; padding-bottom: 0.3rem;">Order Items</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 1px solid #e5e7eb;">
                  <th style="text-align: left; padding: 0.5rem; font-size: 0.8rem; color: #6b7280;">Item</th>
                  <th style="text-align: center; padding: 0.5rem; font-size: 0.8rem; color: #6b7280;">Qty</th>
                  <th style="text-align: right; padding: 0.5rem; font-size: 0.8rem; color: #6b7280;">Price</th>
                  <th style="text-align: right; padding: 0.5rem; font-size: 0.8rem; color: #6b7280;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map((item, index) => `
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 0.6rem 0.5rem; color: #1f2937; font-weight: 500; font-size: 0.85rem;">${item.name}</td>
                    <td style="text-align: center; padding: 0.6rem 0.5rem; color: #6b7280; font-size: 0.85rem;">${item.quantity}</td>
                    <td style="text-align: right; padding: 0.6rem 0.5rem; color: #6b7280; font-size: 0.85rem;">₹${item.price.toFixed(2)}</td>
                    <td style="text-align: right; padding: 0.6rem 0.5rem; color: #1f2937; font-weight: 600; font-size: 0.85rem;">₹${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          ${order.addOns && order.addOns.length > 0 ? `
          <!-- Add-ons Section -->
          <div style="margin-top: 1rem;">
            <h3 style="color: #f59e0b; margin-bottom: 0.5rem; font-size: 1rem; border-bottom: 1px solid #f59e0b; padding-bottom: 0.3rem; display: flex; align-items: center; gap: 0.3rem;">
              🎁 Add-ons
            </h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #fef3c7; border-bottom: 1px solid #fde68a;">
                  <th style="text-align: left; padding: 0.5rem; font-size: 0.8rem; color: #92400e;">Item</th>
                  <th style="text-align: center; padding: 0.5rem; font-size: 0.8rem; color: #92400e;">Qty</th>
                  <th style="text-align: right; padding: 0.5rem; font-size: 0.8rem; color: #92400e;">Price</th>
                  <th style="text-align: right; padding: 0.5rem; font-size: 0.8rem; color: #92400e;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.addOns.map((addon, index) => `
                  <tr style="border-bottom: 1px solid #fde68a; background: #fffbeb;">
                    <td style="padding: 0.6rem 0.5rem; color: #1f2937; font-weight: 500; font-size: 0.85rem;">${addon.name}</td>
                    <td style="text-align: center; padding: 0.6rem 0.5rem; color: #92400e; font-size: 0.85rem;">${addon.quantity || 1}</td>
                    <td style="text-align: right; padding: 0.6rem 0.5rem; color: #92400e; font-size: 0.85rem;">₹${addon.price.toFixed(2)}</td>
                    <td style="text-align: right; padding: 0.6rem 0.5rem; color: #d97706; font-weight: 600; font-size: 0.85rem;">₹${(addon.price * (addon.quantity || 1)).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}
          
          <!-- Price Breakdown -->
          <div style="background: #f8fafc; padding: 0.8rem; border-radius: 6px; margin-top: 1rem;">
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.4rem;">
              <span>Items Subtotal</span>
              <span>₹${itemsTotal.toFixed(2)}</span>
            </div>
            
            ${order.addOns && order.addOns.length > 0 ? `
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: #92400e; margin-bottom: 0.4rem;">
              <span>Add-ons Subtotal</span>
              <span>₹${addOnsTotal.toFixed(2)}</span>
            </div>
            ` : ''}
            
            ${deliveryFee > 0 ? `
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: #4b5563; margin-bottom: 0.4rem;">
              <span>Delivery Fee</span>
              <span>₹${deliveryFee.toFixed(2)}</span>
            </div>
            ` : ''}

            <div style="display: flex; justify-content: space-between; font-size: 1.1rem; font-weight: bold; color: #f59e0b; border-top: 1px solid #e5e7eb; padding-top: 0.5rem; margin-top: 0.5rem;">
              <span>Total Amount</span>
              <span>₹${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div style="background: #1f2937; color: white; padding: 1rem; text-align: center;">
          <p style="margin-bottom: 0.3rem; font-weight: bold; font-size: 0.9rem;">Thank you for choosing TODAY MY DREAM!</p>
          <p style="margin-bottom: 0.3rem; font-size: 0.8rem;">For any queries, please contact us at support@todaymydream.com</p>
          <p style="margin: 0; font-size: 0.75rem;">This is a computer-generated invoice.</p>
        </div>
      </div>
    </div>
  `;
};

// Download PDF function
export const downloadPDF = (pdf, filename) => {
  pdf.save(filename);
};