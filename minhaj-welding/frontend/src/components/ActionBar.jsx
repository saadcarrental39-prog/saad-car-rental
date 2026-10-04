import React from 'react';
import IconImg from './IconImg';

/**
 * Standard action row attached to every measurement / quotation / invoice
 * (Module 22 - Communication Suite). Parent passes handlers; any handler
 * left undefined simply hides that button.
 */
export default function ActionBar({ onSave, onDuplicate, onPdf, onWhatsapp, onEmail, onPrint, saving }) {
  return (
    <div className="flex flex-wrap gap-2 pt-2">
      {onSave && (
        <button className="btn-primary flex items-center gap-2" onClick={onSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      )}
      {onDuplicate && (
        <button className="btn-outline flex items-center gap-2" onClick={onDuplicate}>
          Duplicate
        </button>
      )}
      {onPdf && (
        <button className="btn-outline flex items-center gap-2" onClick={onPdf}>
          <IconImg name="pdf" size={18} /> PDF
        </button>
      )}
      {onWhatsapp && (
        <button className="btn-outline flex items-center gap-2" onClick={onWhatsapp}>
          <IconImg name="whatsappicon" size={18} /> WhatsApp
        </button>
      )}
      {onEmail && (
        <button className="btn-outline flex items-center gap-2" onClick={onEmail}>
          Email
        </button>
      )}
      {onPrint && (
        <button className="btn-ghost flex items-center gap-2" onClick={onPrint}>
          Print
        </button>
      )}
    </div>
  );
}
