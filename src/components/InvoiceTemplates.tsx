/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Invoice, Receipt } from '../types';
import { formatCurrencyValue, formatDate, formatFriendlyDate } from '../utils';

interface TemplateProps {
  data: Invoice | Receipt;
  isReceipt?: boolean;
}

export function ClassicTemplate({ data, isReceipt = false }: TemplateProps) {
  const isPaid = !isReceipt && 'status' in data && (data.status === 'paid' || data.status === 'partially_paid');
  const d = data as any;

  return (
    <div className="bg-white text-neutral-900 p-8 sm:p-12 w-full max-w-[794px] min-h-[1050px] border border-neutral-100 flex flex-col justify-between font-sans relative select-none shadow-none text-left">
      {/* Visual Watermark for paid documents */}
      {(isReceipt || isPaid) && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-4 border-emerald-500 text-emerald-500 rounded px-6 py-2 text-2xl font-bold tracking-widest uppercase rotate-12 opacity-15 pointer-events-none select-none z-10 font-mono">
          PAID IN FULL
        </div>
      )}

      <div>
        {/* Header section */}
        <div className="flex justify-between items-start pb-6 border-b border-neutral-200">
          <div className="flex flex-col">
            {d.from.logo && (
              <img src={d.from.logo} alt="brand logo" className="h-10 w-auto mb-3 object-contain text-left" />
            )}
            <h1 className="text-xl font-bold tracking-tight text-neutral-900 serif">
              {d.from.name}
            </h1>
            <p className="text-[10px] text-neutral-500 whitespace-pre-line mt-1">
              {d.from.address}
            </p>
            <p className="text-[10px] text-neutral-500 mt-0.5">
              {d.from.email} {d.from.phone && `· ${d.from.phone}`}
            </p>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-2xl font-bold tracking-widest text-neutral-900 uppercase">
              {isReceipt ? 'RECEIPT' : d.invoiceType.toUpperCase()}
            </span>
            <span className="text-xs font-mono font-semibold text-neutral-600 mt-1">
              {isReceipt ? `REC-${d.number.replace(/^[A-Z]+-/, '')}` : d.number}
            </span>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 mt-4 text-[10px] text-neutral-500 text-right font-sans">
              <span>Date:</span>
              <span className="font-mono text-neutral-900">{formatDate(isReceipt ? d.createdAt : d.invoiceDate)}</span>
              {!isReceipt && (
                <>
                  <span>Due Date:</span>
                  <span className="font-mono text-neutral-900 font-semibold">{formatDate((d as Invoice).dueDate)}</span>
                </>
              )}
              {d.poNumber && (
                <>
                  <span>PO Key:</span>
                  <span className="font-mono text-neutral-950">{(d as Invoice).poNumber}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Recipient Details (Bill To) */}
        <div className="grid grid-cols-2 gap-8 py-8">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-1">
              BILL TO RECIPIENT
            </span>
            <span className="text-sm font-bold text-neutral-900">
              {d.client.name}
            </span>
            <span className="text-xs text-neutral-500 whitespace-pre-line mt-1">
              {d.client.address}
            </span>
            <span className="text-[10px] text-neutral-500 mt-1">
              {d.client.email} {d.client.phone && `· ${d.client.phone}`}
            </span>
          </div>
        </div>

        {/* Transactions list item table */}
        <table className="w-full text-xs text-left text-neutral-600 mt-2">
          <thead>
            <tr className="border-b border-neutral-300 bg-neutral-50/50">
              <th className="py-2.5 px-3 font-semibold text-neutral-700">Service Description</th>
              <th className="py-2.5 px-3 text-center font-semibold text-neutral-700">Qty</th>
              <th className="py-3 px-3 text-right font-semibold text-neutral-700 font-mono">Unit Price</th>
              {d.items.some((i: any) => i.taxRate > 0) && (
                <th className="py-2.5 px-3 text-right font-semibold text-neutral-700 font-sans">Tax</th>
              )}
              <th className="py-2.5 px-3 text-right font-semibold text-neutral-700 font-mono">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {d.items.map((item: any, idx: number) => (
              <tr key={item.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-neutral-50/30'}>
                <td className="py-3 px-3 font-medium text-neutral-900 font-sans max-w-xs break-words">
                  {item.description}
                </td>
                <td className="py-3 px-3 text-center font-mono">{item.qty}</td>
                <td className="py-3 px-3 text-right font-mono">{formatCurrencyValue(item.unitPrice, d.currency)}</td>
                {d.items.some((i: any) => i.taxRate > 0) && (
                  <td className="py-3 px-3 text-right font-mono text-neutral-500">
                    {item.taxRate > 0 ? `${item.taxRate}%` : '—'}
                  </td>
                )}
                <td className="py-3 px-3 text-right font-mono text-neutral-950 font-semibold">
                  {formatCurrencyValue(item.qty * item.unitPrice, d.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Calculation block */}
        <div className="flex justify-end mt-6">
          <div className="w-64 flex flex-col gap-2 border-t border-neutral-300 pt-3 text-xs text-neutral-500">
            <div className="flex justify-between">
              <span>Subtotal Amount:</span>
              <span className="font-mono text-neutral-950">{formatCurrencyValue(d.subtotal, d.currency)}</span>
            </div>
            {d.taxTotal > 0 && (
              <div className="flex justify-between">
                <span>Tax Allocation:</span>
                <span className="font-mono text-neutral-950">+{formatCurrencyValue(d.taxTotal, d.currency)}</span>
              </div>
            )}
            {d.discount && (
              <div className="flex justify-between text-red-500">
                <span>Enterprise Discount:</span>
                <span className="font-mono">
                  -{d.discount.type === 'percent' ? `${d.discount.value}%` : formatCurrencyValue(d.discount.value, d.currency)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-neutral-950 font-bold border-t border-neutral-900 pt-2 text-sm mt-1">
              <span>Total Ledger due:</span>
              <span className="font-mono text-neutral-955">{formatCurrencyValue(d.total, d.currency)}</span>
            </div>
          </div>
        </div>

        {/* Method Section info */}
        {d.paymentInstructions && (
          <div className="mt-12 bg-neutral-50 border border-neutral-100 rounded-md p-4 text-[10px] text-neutral-500">
            <span className="font-bold text-neutral-700 tracking-wide uppercase block mb-1">
              PAYMENT CLEARING INSTRUCTIONS (METHOD: {d.paymentMethod})
            </span>
            <p className="whitespace-pre-line leading-relaxed font-mono">
              {d.paymentInstructions}
            </p>
          </div>
        )}
      </div>

      {/* Footer Notes area */}
      <div className="border-t border-neutral-200 pt-4 mt-8">
        {d.notes && (
          <div className="text-[10px] text-neutral-400 leading-relaxed max-w-lg mb-2 text-left">
            <span className="font-bold text-neutral-500">NOTE:</span> {d.notes}
          </div>
        )}
        <div className="text-[8px] text-neutral-400 text-center font-mono">
          Fides billing platform verification • Printed strictly from paper sheet presets
        </div>
      </div>

    </div>
  );
}

export function ModernTemplate({ data, isReceipt = false }: TemplateProps) {
  const isPaid = !isReceipt && 'status' in data && (data.status === 'paid' || data.status === 'partially_paid');
  const d = data as any;
  const accentColor = d.brandColor || '#F97316';

  return (
    <div className="bg-white text-neutral-900 p-8 sm:p-12 w-full max-w-[794px] min-h-[1050px] border border-neutral-100 flex flex-col justify-between font-sans relative select-none shadow-none text-left overflow-hidden">
      {/* Decorative design header band using brand color */}
      <div className="absolute top-0 left-0 right-0 h-4" style={{ backgroundColor: accentColor }} />

      {/* PAID STAMP */}
      {(isReceipt || isPaid) && (
        <div className="absolute top-1/4 right-[30%] border-4 border-dashed rounded-lg px-6 py-2 text-3xl font-extrabold tracking-widest uppercase rotate-12 opacity-20 pointer-events-none select-none z-10" style={{ color: accentColor, borderColor: accentColor }}>
          PAID
        </div>
      )}

      <div>
        {/* Header containing name and big label */}
        <div className="flex justify-between items-center pb-6 border-b border-neutral-100 mt-2">
          <div className="flex flex-col">
            {d.from.logo ? (
              <img src={d.from.logo} alt="brand logo" className="h-12 w-auto mb-2 object-contain text-left" />
            ) : (
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg font-bold mb-2 select-none" style={{ backgroundColor: accentColor }}>
                {d.from.name.slice(0, 1).toUpperCase()}
              </div>
            )}
            <h1 className="text-lg font-bold text-neutral-950 font-sans tracking-tight">
              {d.from.name}
            </h1>
            <span className="text-[10px] text-neutral-500 font-mono">{d.from.email}</span>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-3xl font-extrabold tracking-tight select-none uppercase" style={{ color: accentColor }}>
              {isReceipt ? 'RECEIPT' : d.invoiceType.toUpperCase()}
            </span>
            <span className="text-xs font-mono font-medium text-neutral-500 mt-1">
              Folder No: {isReceipt ? `REC-${d.number.replace(/^[A-Z]+-/, '')}` : d.number}
            </span>
          </div>
        </div>

        {/* Company and Client info layout cards */}
        <div className="grid grid-cols-2 gap-6 py-8">
          <div className="bg-neutral-50/50 border border-neutral-100 rounded-lg p-4">
            <span className="text-[9px] font-bold tracking-widest text-[#9B9B9B] uppercase block mb-1.5">
              PREPARED BY
            </span>
            <span className="text-xs font-bold text-neutral-900 block">{d.from.name}</span>
            <p className="text-[10px] text-neutral-500 whitespace-pre-line leading-relaxed mt-1">
              {d.from.address}
            </p>
            {d.from.phone && (
              <span className="text-[10px] text-neutral-400 font-mono block mt-1">Contact: {d.from.phone}</span>
            )}
          </div>

          <div className="bg-neutral-50/50 border border-neutral-100 rounded-lg p-4">
            <span className="text-[9px] font-bold tracking-widest text-neutral-400 uppercase block mb-1.5">
              BILL TO CUSTOMER
            </span>
            <span className="text-xs font-bold text-neutral-900 block">{d.client.name}</span>
            <p className="text-[10px] text-neutral-500 whitespace-pre-line leading-relaxed mt-1">
              {d.client.address}
            </p>
            <span className="text-[10px] text-neutral-400 font-mono block mt-1">Email: {d.client.email}</span>
            {d.client.phone && (
              <span className="text-[10px] text-neutral-400 font-mono block mt-0.5">Contact: {d.client.phone}</span>
            )}
          </div>
        </div>

        {/* Mini meta strip details */}
        <div className="grid grid-cols-3 gap-4 border border-neutral-100 rounded-lg p-3 bg-neutral-50/20 text-center font-sans text-[10px] text-[#6B6B6B] mb-8">
          <div className="flex flex-col">
            <span className="text-[#9B9B9B] uppercase font-bold text-[8px] tracking-wider mb-0.5">ISSUED</span>
            <span className="font-mono text-neutral-900 font-medium">{formatFriendlyDate(isReceipt ? d.createdAt : d.invoiceDate)}</span>
          </div>
          <div className="flex flex-col border-x border-neutral-100">
            <span className="text-[#9B9B9B] uppercase font-bold text-[8px] tracking-wider mb-0.5">DUE TERM</span>
            <span className="font-mono text-neutral-900 font-medium">{isReceipt ? 'Immediate' : formatDate((d as Invoice).dueDate)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[#9B9B9B] uppercase font-bold text-[8px] tracking-wider mb-0.5">CURRENCY</span>
            <span className="font-bold text-neutral-900 font-mono">{d.currency}</span>
          </div>
        </div>

        {/* Modern clean design table */}
        <table className="w-full text-xs text-left text-neutral-600">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="py-2.5 font-bold text-neutral-900">Task Overview</th>
              <th className="py-2.5 text-center font-bold text-neutral-900">Quantity</th>
              <th className="py-2.5 text-right font-bold text-neutral-900 font-mono">Rate</th>
              <th className="py-2.5 text-right font-bold text-neutral-900 font-mono">Sub</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {d.items.map((item: any, idx: number) => (
              <tr key={item.id || idx}>
                <td className="py-3.5 font-sans text-neutral-900 max-w-sm break-words leading-relaxed">
                  {item.description}
                  {item.taxRate > 0 && (
                    <span className="text-[9px] text-[#9B9B9B] block mt-0.5">Including {item.taxRate}% custom row tax</span>
                  )}
                </td>
                <td className="py-3.5 text-center font-mono text-neutral-500">{item.qty}</td>
                <td className="py-3.5 text-right font-mono text-neutral-500">{formatCurrencyValue(item.unitPrice, d.currency)}</td>
                <td className="py-3.5 text-right font-mono text-neutral-950 font-semibold">
                  {formatCurrencyValue(item.qty * item.unitPrice, d.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Calculation results layout */}
        <div className="flex justify-end mt-8">
          <div className="w-64 bg-neutral-50/50 border border-neutral-100 p-4 rounded-lg flex flex-col gap-2 text-xs text-neutral-500">
            <div className="flex justify-between">
              <span>Item Subtotal:</span>
              <span className="font-mono text-neutral-900">{formatCurrencyValue(d.subtotal, d.currency)}</span>
            </div>
            {d.taxTotal > 0 && (
              <div className="flex justify-between">
                <span>Tax Allocation:</span>
                <span className="font-mono text-neutral-900">+{formatCurrencyValue(d.taxTotal, d.currency)}</span>
              </div>
            )}
            {d.discount && (
              <div className="flex justify-between font-medium text-red-500">
                <span>Reduction Discount:</span>
                <span className="font-mono">
                  -{d.discount.type === 'percent' ? `${d.discount.value}%` : formatCurrencyValue(d.discount.value, d.currency)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-white font-bold rounded p-2 text-sm mt-2 select-none font-mono" style={{ backgroundColor: accentColor }}>
              <span>TOTAL DUE:</span>
              <span>{formatCurrencyValue(d.total, d.currency)}</span>
            </div>
          </div>
        </div>

        {/* Bank Instructions */}
        {d.paymentInstructions && (
          <div className="mt-8 border-l-2 p-3 text-[10px] text-neutral-500 leading-relaxed font-sans" style={{ borderColor: accentColor }}>
            <span className="font-bold text-neutral-800 uppercase block mb-0.5">Transfer Details</span>
            <p className="whitespace-pre-line font-mono">{d.paymentInstructions}</p>
          </div>
        )}
      </div>

      {/* Footer comments */}
      <div className="mt-12 text-center text-[10px] text-neutral-400 border-t border-neutral-100 pt-4 flex justify-between">
        <span>Prepared digitally via Fides Billing Signature • Elegant Templates</span>
        <span>Secure PDF Document</span>
      </div>

    </div>
  );
}

export function MinimalTemplate({ data, isReceipt = false }: TemplateProps) {
  const isPaid = !isReceipt && 'status' in data && (data.status === 'paid' || data.status === 'partially_paid');
  const d = data as any;
  const accentColor = d.brandColor || '#F97316';

  return (
    <div className="bg-white text-neutral-900 p-8 sm:p-12 w-full max-w-[794px] min-h-[1050px] border border-neutral-100 flex flex-col justify-between font-sans relative select-none shadow-none text-left">
      
      {/* Visual watermark checkmark paid */}
      {(isReceipt || isPaid) && (
        <div className="absolute top-10 right-10 flex items-center gap-1 border border-neutral-200 rounded px-2.5 py-1 text-xs font-semibold text-emerald-500 font-mono">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>VERIFIED PAID RECEIPT</span>
        </div>
      )}

      <div>
        {/* Typographical heavy layout */}
        <div className="flex justify-between items-baseline mb-16 mt-4">
          <div className="flex flex-col">
            <h1 className="text-2xl font-black tracking-tight text-neutral-950 font-sans">
              {d.from.name}
            </h1>
            <span className="text-xs font-mono text-neutral-400 mt-1">{d.from.website || 'Agency Platform'}</span>
          </div>
          
          <div className="flex flex-col items-end">
            <span className="text-xs uppercase font-bold tracking-widest block mb-0.5" style={{ color: accentColor }}>
              {isReceipt ? '/ RECEIPT' : `/ ${d.invoiceType.toUpperCase()}`}
            </span>
            <span className="text-sm font-mono font-medium text-neutral-955 tracking-tight">
              #{isReceipt ? `REC-${d.number.replace(/^[A-Z]+-/, '')}` : d.number}
            </span>
          </div>
        </div>

        {/* Company address column layout */}
        <div className="grid grid-cols-2 gap-x-12 mb-12 text-xs">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono font-medium text-neutral-400 uppercase tracking-widest pl-1">
              • THE FOUNDER area
            </span>
            <p className="text-neutral-500 whitespace-pre-line leading-relaxed pl-1">
              {d.from.address}
            </p>
            <span className="text-[10px] text-neutral-400 font-mono pl-1">{d.from.email}</span>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono font-medium text-neutral-400 uppercase tracking-widest pl-1">
              • SEND TO ACCOUNT
            </span>
            <span className="font-semibold text-neutral-950 pl-1">{d.client.name}</span>
            <p className="text-neutral-500 whitespace-pre-line leading-relaxed pl-1">
              {d.client.address}
            </p>
            <span className="text-[10px] text-[#6B6B6B] font-mono pl-1">{d.client.email}</span>
          </div>
        </div>

        {/* Dynamic Dates Row */}
        <div className="border-y border-neutral-100 py-3 flex gap-8 text-[10px] text-neutral-400 mb-10 font-mono">
          <div>
            <span>REGISTRATION DATE:</span>{' '}
            <span className="text-neutral-950 font-medium">{formatFriendlyDate(isReceipt ? d.createdAt : d.invoiceDate)}</span>
          </div>
          {!isReceipt && (
            <div>
              <span>CLEARANCE DUE:</span>{' '}
              <span className="text-neutral-950 font-semibold">{formatFriendlyDate((data as Invoice).dueDate)}</span>
            </div>
          )}
          <div>
            <span>SPEC:</span> <span className="text-neutral-950">{d.currency}</span>
          </div>
        </div>

        {/* Pure typographical alignment line item layout (no board, no thick lines) */}
        <div className="flex flex-col gap-6 mt-4">
          <span className="text-[10px] font-mono text-[#9B9B9B] tracking-widest uppercase block mb-[-8px]">
            / COMPILING TRANSACTIONS INDEX
          </span>
          <div className="h-[1px] bg-neutral-200" />

          {d.items.map((item: any, idx: number) => (
            <div key={item.id || idx} className="flex justify-between items-start text-xs border-b border-neutral-100 pb-4 last:border-b-0">
              <div className="flex flex-col gap-1 max-w-sm">
                <span className="font-medium text-neutral-900 leading-normal">{item.description}</span>
                <span className="text-[9px] text-[#9B9B9B] font-mono uppercase">
                  QTY: {item.qty} • PRICE: {formatCurrencyValue(item.unitPrice, d.currency)}
                </span>
              </div>
              
              <span className="font-mono text-neutral-950 font-semibold mt-1">
                {formatCurrencyValue(item.qty * item.unitPrice, d.currency)}
              </span>
            </div>
          ))}
        </div>

        {/* Calculation Box */}
        <div className="flex justify-end mt-12">
          <div className="w-60 flex flex-col gap-1.5 text-xs text-neutral-500 font-mono">
            <div className="flex justify-between">
              <span>SUBTOTAL:</span>
              <span className="text-neutral-950">{formatCurrencyValue(d.subtotal, d.currency)}</span>
            </div>
            {d.taxTotal > 0 && (
              <div className="flex justify-between">
                <span>ROW TAX:</span>
                <span className="text-neutral-950">+{formatCurrencyValue(d.taxTotal, d.currency)}</span>
              </div>
            )}
            {d.discount && (
              <div className="flex justify-between text-red-500">
                <span>REDUCTION:</span>
                <span>
                  -{d.discount.type === 'percent' ? `${d.discount.value}%` : formatCurrencyValue(d.discount.value, d.currency)}
                </span>
              </div>
            )}
            <div className="h-[1px] bg-neutral-900 my-2" />
            <div className="flex justify-between text-neutral-950 font-bold text-sm">
              <span className="font-sans">TOTAL LEDGER:</span>
              <span style={{ color: accentColor }}>{formatCurrencyValue(d.total, d.currency)}</span>
            </div>
          </div>
        </div>

        {/* Method */}
        {d.paymentInstructions && (
          <div className="mt-12 text-[10px] text-neutral-400 font-mono leading-relaxed border-t border-neutral-100 pt-3">
            <span className="font-bold text-neutral-700 font-sans block mb-1">CLEARANCE DEPOSIT DIRECTIVE ({d.paymentMethod})</span>
            <p className="whitespace-pre-line bg-neutral-50/50 p-2 border border-neutral-100 rounded leading-relaxed">{d.paymentInstructions}</p>
          </div>
        )}
      </div>

      {/* Footer minimal notes */}
      <div className="mt-16 text-[10px] text-neutral-300 font-mono border-t border-neutral-100 pt-4 flex justify-between select-none">
        <span>FIDES MINIMAL GRID v2.0 // NO BOLD METRICS</span>
        <span>A4 PRINT PROTOTYPE</span>
      </div>

    </div>
  );
}

export default function InvoiceTemplateRenderer({ data, isReceipt = false }: TemplateProps) {
  const chosenTemplate = data.template || 'modern';
  
  if (chosenTemplate === 'classic') {
    return <ClassicTemplate data={data} isReceipt={isReceipt} />;
  } else if (chosenTemplate === 'minimal') {
    return <MinimalTemplate data={data} isReceipt={isReceipt} />;
  } else {
    return <ModernTemplate data={data} isReceipt={isReceipt} />;
  }
}
