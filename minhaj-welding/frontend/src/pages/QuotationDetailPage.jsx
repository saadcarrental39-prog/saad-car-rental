import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import ActionBar from '../components/ActionBar';

export default function QuotationDetailPage() {
  const { id } = useParams();
  const [quotation, setQuotation] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [pdfInfo, setPdfInfo] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const load = () => api.get(`/quotations/${id}`).then((r) => {
    setQuotation(r.data);
    if (r.data.customer_id) api.get(`/customers/${r.data.customer_id}`).then((cr) => setCustomer(cr.data));
  });
  useEffect(() => { load(); }, [id]);

  const generatePdf = () => {
    setBusy(true);
    api.post(`/communication/quotation/${id}/pdf`)
      .then((r) => { setPdfInfo(r.data); setMessage('PDF generated ✓'); })
      .catch((e) => setMessage(e.response?.data?.error || 'PDF generation failed (is Puppeteer/Chromium installed?)'))
      .finally(() => setBusy(false));
  };

  const sendWhatsapp = () => {
    if (!customer?.phone && !customer?.whatsapp) return setMessage('This customer has no phone/WhatsApp number saved.');
    api.post('/communication/whatsapp-link', {
      phone: customer.whatsapp || customer.phone,
      template_key: 'quotation',
      vars: {
        customer_name: customer.name,
        quotation_no: quotation.quotation_no,
        amount: quotation.total_amount.toFixed(0),
        pdf_link: pdfInfo ? '(attach the downloaded PDF manually in WhatsApp)' : '',
      },
    }).then((r) => window.open(r.data.link, '_blank'));
  };

  const sendEmail = () => {
    if (!customer?.email) return setMessage('This customer has no email saved.');
    api.post('/communication/email', {
      to: customer.email,
      subject: `Quotation #${quotation.quotation_no} - MINHAJ WELDING`,
      text: `Assalam-o-Alaikum ${customer.name},\n\nPlease find attached your quotation. Total: Rs. ${quotation.total_amount}.\n\n- MINHAJ WELDING`,
      pdf_path: pdfInfo?.pdf_path,
    }).then(() => setMessage('Email sent ✓')).catch((e) => setMessage(e.response?.data?.error || 'Email failed'));
  };

  const convertToInvoice = () => {
    api.post(`/invoices/from-quotation/${id}`).then((r) => setMessage(`Invoice ${r.data.invoice_no} created ✓`));
  };

  if (!quotation) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-bold mb-1">Quotation #{quotation.quotation_no}</h1>
      <p className="text-text-secondary text-sm mb-4">Customer: {customer?.name || 'Walk-in'} {customer?.phone && `— ${customer.phone}`}</p>

      <div className="card mb-4 overflow-x-auto">
        <table className="table-flat min-w-[500px]">
          <thead><tr><th>Description</th><th>Qty</th><th>Unit</th><th>Rate</th><th>Amount</th></tr></thead>
          <tbody>
            {quotation.items.map((it) => (
              <tr key={it.id}>
                <td>{it.description}</td>
                <td>{it.quantity?.toFixed(2)}</td>
                <td>{it.unit}</td>
                <td>Rs. {it.rate}</td>
                <td>Rs. {it.amount?.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t border-border mt-3 pt-3 space-y-1 text-sm max-w-xs ml-auto">
          <div className="flex justify-between"><span>Subtotal</span><span>Rs. {quotation.subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>Discount</span><span>- Rs. {quotation.discount_amount.toFixed(2)}</span></div>
          <div className="flex justify-between font-bold text-lg border-t border-text pt-2"><span>Total</span><span>Rs. {quotation.total_amount.toFixed(2)}</span></div>
        </div>
      </div>

      {message && <div className="badge badge-success mb-3">{message}</div>}

      <div className="card">
        <ActionBar
          onPdf={generatePdf}
          onWhatsapp={sendWhatsapp}
          onEmail={sendEmail}
          onPrint={() => window.print()}
          saving={busy}
        />
        <button className="btn-outline mt-3" onClick={convertToInvoice}>Convert to Invoice</button>
      </div>
    </div>
  );
}
