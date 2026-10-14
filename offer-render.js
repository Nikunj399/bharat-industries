/* ============================================================
   Offer rendering — builds the 3-page A4 offer (cover letter,
   quotation, terms & conditions) as plain HTML. Used by offer.html
   for the live preview and for printing to PDF.

   Pure functions only (plus fitSheets, which touches the DOM), so
   the same code renders the preview and the final PDF.
   ============================================================ */

/* ---------- Company details (shown on every page) ---------- */
export var COMPANY = {
  name: 'Bharat Industries',
  address: 'Plot No. 906/5, Nr. Ganesh Anand Chowkdi, GIDC Estate, Panoli, Ankleshwar, Gujarat-India.',
  email: 'bharatfabricationunit@gmail.com',
  website: 'www.bharatindustries.info',
  mobile: '+91 90233 80107',
  iso: 'An ISO 9001: 2015 Certified Company',
  gstin: '24AAKFB9702A1ZW',
  logo: 'bharat-logo.png'
};

/* ---------- Standard terms (from the current Bharat Industries quotation) ---------- */
export var DEFAULT_TERMS = [
  { label: 'DELIVERY', value: '8-9 Weeks from the date of your confirmed purchase order & technical details (Such as Drawing & QAP without any hold) along with advance payment whichever is later.' },
  { label: 'PACKING & FORWARDING', value: '2 % Extra on Basic Amount' },
  { label: 'PAYMENT TERMS', value: '30 Days' },
  { label: 'INSTALLATION', value: 'In your Scope' },
  { label: 'TRANSPORTATION', value: 'Our account at the time of delivery' },
  { label: 'INSURANCE CHARGES', value: 'Our account at the time of delivery' },
  { label: 'QUOTATION VALIDITY', value: 'Please note that our quotation will be valid for your kind consideration for period of 3-4 days from the date of this offer and any extension thereafter will be subject to our written confirmation only' },
  { label: 'INSPECTION', value: 'Final Hydro Test, Dimensional & Visual inspection as per QAP to be submitted along with drawing.\n(Cost of any Third-party Inspection to be borne by client.)' },
  { label: 'WARRANTY', value: '\u201CThe equipment is covered with a warranty against faulty material and/or workmanship which will be replaced and/or rectified if reported within the warranty period; provided the equipment is sent to our works freight paid along with proper documentation. The warranty period will be eighteen months from the date of delivery or twelve months from the date of commissioning, whichever is earlier. The warranty does not cover electrical items as motor, variable frequency drive and other proprietary items like reduction gear, mechanical seals, valves, pumps, etc., and in such cases the complaints should be taken up with the manufacturers/suppliers of said items. The warranty is void if any payment(s) for the equipment are due to us. The warranty does not cover damage to the equipment due to improper use or due to chemical corrosion or modification by unauthorized personnel.\u201D' },
  { label: 'ERRORS', value: 'Any typographical error / omissions in the offer will be subject to correction at our end' },
  { label: 'CANCELLATION', value: 'Once we confirm the technically & commercially clear order, we will take up the manufacture of the machine immediately in hand. Hence, we cannot accept any changes or cancellation of order and thus we cannot refund your advance amount back to you.' },
  { label: 'JURISDICTION', value: 'In case of any dispute/s all the claims are subject to Ankleshwar Jurisdiction only.' }
];

/* ---------- Defaults for a brand-new offer ---------- */
export var OFFER_DEFAULTS = {
  formatNo: 'F_MKT_02',
  enquiryRef: 'By Mail',
  client: { salutation: 'Dear Sir,' },
  content: {
    footnote: 'Technical Specification as per attached drawing.',
    hsn: '8419',
    unitLabel: 'nos',
    scopeOfWork: 'Manufacturing and Supply.',
    annexures: 'Annexure : 1 : Terms and Condition'
  },
  tax: { mode: 'cgst_sgst', rate: 18, formNote: 'Against Form - A' },
  coverText: 'With reference to the above, we have pleasure in submitting our offer for {{title}}.\n\nWe hope you will find our offer in line with your requirement and we now look forward to hearing from you soon.',
  closing: 'We hope you will find our offer most competitive and favour us with your valued order. This will receive our prompt and careful attention.\n\nThanking you with regards.',
  signatory: { name: 'Vijay Lathiya', designation: 'Director', phone: '+91 99048 60111' },
  terms: DEFAULT_TERMS
};

/* ---------- Small helpers ---------- */
export function esc(s){
  return String(s == null ? '' : s).replace(/[&<>"']/g, function(ch){
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
  });
}
export function nl2br(s){ return esc(s).replace(/\r?\n/g, '<br>'); }
export function num(v){ var n = parseFloat(v); return isFinite(n) ? n : 0; }
export function round2(n){ return Math.round((n + Number.EPSILON) * 100) / 100; }

/* 1,80,000/-  (Indian digit grouping; paise shown only if present) */
export function formatINR(n){
  n = num(n);
  var hasPaise = Math.abs(n - Math.round(n)) > 0.004;
  return n.toLocaleString('en-IN', {
    minimumFractionDigits: hasPaise ? 2 : 0,
    maximumFractionDigits: 2
  }) + '/-';
}

var ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
var TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function below100(n){
  return n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : '');
}
function below1000(n){
  var h = Math.floor(n / 100), r = n % 100;
  return (h ? ONES[h] + ' Hundred' + (r ? ' ' : '') : '') + (r ? below100(r) : '');
}
function integerWords(n){
  if(n === 0) return 'Zero';
  var parts = [];
  var crore = Math.floor(n / 10000000); n %= 10000000;
  var lakh = Math.floor(n / 100000); n %= 100000;
  var thousand = Math.floor(n / 1000); n %= 1000;
  if(crore) parts.push(integerWords(crore) + ' Crore');
  if(lakh) parts.push(below100(lakh) + ' Lakh');
  if(thousand) parts.push(below100(thousand) + ' Thousand');
  if(n) parts.push(below1000(n));
  return parts.join(' ');
}

/* "Rupees Two Lakh Thirty Thousand Only" — Indian numbering system */
export function amountInWords(amount){
  var a = Math.abs(round2(num(amount)));
  var rupees = Math.floor(a);
  var paise = Math.round((a - rupees) * 100);
  if(paise === 100){ rupees += 1; paise = 0; }
  var s = 'Rupees ' + integerWords(rupees);
  if(paise) s += ' and ' + below100(paise) + ' Paise';
  return s + ' Only';
}

var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December'];

function parseISO(iso){
  var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || ''));
  return m ? { y: +m[1], m: +m[2], d: +m[3] } : null;
}
export function formatDMY(iso){
  var p = parseISO(iso);
  if(!p) return '';
  return String(p.d).padStart(2, '0') + '/' + String(p.m).padStart(2, '0') + '/' + p.y;
}
/* 12th October 2026 */
export function ordinalLongDate(iso){
  var p = parseISO(iso);
  if(!p) return '';
  var suffix = (p.d % 100 >= 11 && p.d % 100 <= 13) ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[p.d % 10] || 'th');
  return p.d + suffix + ' ' + MONTHS[p.m - 1] + ' ' + p.y;
}

function trimRate(r){ return String(round2(r)); }

/* Basic amount + GST lines + total. Modes: cgst_sgst | igst | form */
export function computeTax(basic, mode, rate){
  basic = round2(num(basic));
  rate = num(rate);
  if(mode === 'igst'){
    var ig = round2(basic * rate / 100);
    return { basic: basic, form: false, total: round2(basic + ig),
      lines: [{ label: 'IGST ' + trimRate(rate) + '%', amount: ig }] };
  }
  var halfRate = trimRate(rate / 2);
  if(mode === 'form'){
    return { basic: basic, form: true, total: basic,
      lines: [{ label: 'SGST ' + halfRate + '%' }, { label: 'CGST ' + halfRate + '%' }] };
  }
  var half = round2(basic * rate / 200);
  return { basic: basic, form: false, total: round2(basic + half * 2),
    lines: [{ label: 'SGST ' + halfRate + '%', amount: half }, { label: 'CGST ' + halfRate + '%', amount: half }] };
}

/* Vessel / Limpet pairs: "10 / 6", or a single value when both match */
function pairLine(label, a, b, unit){
  a = String(a == null ? '' : a).trim();
  b = String(b == null ? '' : b).trim();
  var u = unit ? ' ' + unit : '';
  if(a && b){
    return label + ' Vessel / Limpet \u2013 ' + (a === b ? a : a + ' / ' + b) + u;
  }
  if(a) return label + ' Vessel \u2013 ' + a + u;
  if(b) return label + ' Limpet \u2013 ' + b + u;
  return '';
}

/* Technical bullet points pulled from the estimate's Vessel Technical Details */
export function techBullets(v){
  v = v || {};
  var out = [];
  if(String(v.totalCapacity || '').trim()) out.push('Total Capacity \u2013 ' + v.totalCapacity + ' Litres');
  if(String(v.operatingCapacity || '').trim()) out.push('Operating Capacity \u2013 ' + v.operatingCapacity + ' Litres');
  out.push(pairLine('Design Pressure', v.designPressureVessel, v.designPressureLimpet, 'kg/cm\u00B2g'));
  out.push(pairLine('Design Temperature', v.designTempVessel, v.designTempLimpet, '\u00B0C'));
  out.push(pairLine('Hydrotest Pressure', v.hydrotestPressureVessel, v.hydrotestPressureLimpet, 'kg/cm\u00B2g'));
  out.push(pairLine('MOC', v.mocVessel, v.mocLimpet, ''));
  return out.filter(Boolean);
}

/* ---------- Shared page furniture ---------- */
function headerHTML(){
  return '<header class="sh-head"><img class="sh-logo" src="' + esc(COMPANY.logo) + '" alt="' + esc(COMPANY.name) + '"></header>';
}
function footerHTML(){
  return '<footer class="sh-foot">' +
    '<div>' + esc(COMPANY.address) + '</div>' +
    '<div>Email : ' + esc(COMPANY.email) + ' &nbsp;&bull;&nbsp; ' + esc(COMPANY.website) + ' &nbsp;&bull;&nbsp; Mo. ' + esc(COMPANY.mobile) + '</div>' +
    '<div class="iso">' + esc(COMPANY.iso) + '</div>' +
  '</footer>';
}
function sheet(pageNo, bodyHTML){
  return '<section class="sheet" data-page="' + pageNo + '">' + headerHTML() +
    '<div class="sh-body"><div class="sh-content">' + bodyHTML + '</div></div>' + footerHTML() + '</section>';
}

function addressLines(s){
  return String(s || '').split(/\r?\n/).map(function(l){ return l.trim(); }).filter(Boolean);
}

/* ---------- Page 1: cover letter ---------- */
function coverPage(d){
  var c = d.client;
  var title = d.content.title || 'the above equipment';
  var enquiry = d.enquiryRef ? 'Your enquiry (' + esc(d.enquiryRef) + ')' + (d.enquiryDate ? ' dated ' + esc(formatDMY(d.enquiryDate)) : '') : '';
  var bodyParas = String(d.coverText || '').replace(/\{\{title\}\}/g, title).split(/\n\s*\n/)
    .map(function(p){ return p.trim(); }).filter(Boolean)
    .map(function(p){ return '<p>' + nl2br(p) + '</p>'; }).join('');

  var sig = d.signatory;
  var enclosures = ['Quotation'].concat(addressLines(d.content.annexures).length ? ['Annexure \u2013 Terms &amp; Conditions'] : []);

  return sheet(1,
    '<div class="cl">' +
      '<div class="cl-meta">' +
        '<div><b>Ref :</b> ' + esc(d.refNo) + '</div>' +
        '<div><b>Date :</b> ' + esc(ordinalLongDate(d.offerDate)) + '</div>' +
      '</div>' +
      '<div class="cl-to">' +
        '<div>To,</div>' +
        '<div class="cl-client">' + esc(c.name) + '</div>' +
        addressLines(c.address).map(function(l){ return '<div>' + esc(l) + '</div>'; }).join('') +
        (c.gstin ? '<div>GSTIN : ' + esc(c.gstin) + '</div>' : '') +
      '</div>' +
      (c.attn ? '<div class="cl-attn">Kind Attn : ' + esc(c.attn) + '</div>' : '') +
      '<p>' + esc(c.salutation || 'Dear Sir,') + '</p>' +
      '<p class="cl-subject"><b>Subject \u2013 Offer for ' + esc(title) + '</b></p>' +
      (enquiry ? '<p><b>Reference \u2013</b> ' + enquiry + '</p>' : '') +
      bodyParas +
      '<p class="cl-regards">Yours sincerely,</p>' +
      '<p class="cl-for">For <b>' + esc(COMPANY.name) + '</b></p>' +
      '<div class="cl-signspace"></div>' +
      '<div class="cl-signatory"><b>' + esc(sig.name) + '</b></div>' +
      (sig.designation ? '<div>' + esc(sig.designation) + '</div>' : '') +
      (sig.phone ? '<div>' + esc(sig.phone) + '</div>' : '') +
      '<div class="cl-encl"><b>Enclosures :</b> ' + enclosures.map(function(e, i){ return (i + 1) + '. ' + e; }).join(' &nbsp; ') + '</div>' +
    '</div>');
}

/* ---------- Page 2: quotation ---------- */
function quotationPage(d, calc){
  var c = d.client, ct = d.content;
  var qty = num(ct.qty) || 1;
  var rate = num(ct.unitPrice);

  var meta = [
    ['QUOTATION NO', '<b>' + esc(d.refNo) + '</b>'],
    ['QUOTATION DATE', esc(formatDMY(d.offerDate))],
    ['YOUR REF NO', esc(d.enquiryRef || '\u2014')]
  ];
  if(d.enquiryDate) meta.push(['INQUIRY DATE', esc(formatDMY(d.enquiryDate))]);
  meta.push(['GSTIN', esc(COMPANY.gstin)]);

  var toBlock =
    '<div class="to-label">To,</div>' +
    (c.attn ? '<div><b>Kind Attn : ' + esc(c.attn) + '</b></div>' : '') +
    '<div class="to-name">' + esc(c.name) + '</div>' +
    addressLines(c.address).map(function(l){ return '<div>' + esc(l) + '</div>'; }).join('') +
    (c.gstin ? '<div class="to-gst">GSTIN : ' + esc(c.gstin) + '</div>' : '');

  var rows = '';
  meta.forEach(function(m, i){
    rows += '<tr>' +
      (i === 0 ? '<td colspan="2" rowspan="' + meta.length + '" class="q-to">' + toBlock + '</td>' : '') +
      '<td colspan="3" class="q-meta"><span class="mk">' + m[0] + ' :</span> ' + m[1] + '</td></tr>';
  });

  var bullets = techBullets(d.vessel).concat(addressLines(ct.extraPoints));
  var desc =
    '<div class="desc-wrap" data-fill>' +
      (ct.title ? '<div class="d-title">' + esc(ct.title) + '</div>' : '') +
      (ct.scope ? '<div class="d-scope">' + nl2br(ct.scope) + '</div>' : '') +
      (bullets.length ? '<ul class="d-specs">' + bullets.map(function(b){ return '<li>' + esc(b) + '</li>'; }).join('') + '</ul>' : '') +
      (ct.footnote ? '<div class="d-foot">' + nl2br(ct.footnote) + '</div>' : '') +
      (ct.hsn ? '<div class="d-hsn">[HSN: ' + esc(ct.hsn) + ']</div>' : '') +
    '</div>';

  var span = 2 + calc.lines.length;
  var totals = '<tr><td colspan="3" rowspan="' + span + '" class="q-blank"></td>' +
    '<td class="tl">Basic Amount</td><td class="tv">' + esc(formatINR(calc.basic)) + '</td></tr>';
  calc.lines.forEach(function(l, i){
    if(calc.form){
      totals += '<tr><td class="tl">' + esc(l.label) + '</td>' +
        (i === 0 ? '<td class="tv note" rowspan="' + calc.lines.length + '">' + esc(d.tax.formNote) + '</td>' : '') + '</tr>';
    } else {
      totals += '<tr><td class="tl">' + esc(l.label) + '</td><td class="tv">' + esc(formatINR(l.amount)) + '</td></tr>';
    }
  });
  totals += '<tr class="tot"><td class="tl">Total Amount</td><td class="tv">' + esc(formatINR(calc.total)) + '</td></tr>';

  var annex = addressLines(ct.annexures).map(function(a, i){
    return '<div class="annex-row"><span class="an-no">' + (i + 1) + ')</span><span>' + esc(a) + '</span></div>';
  }).join('');

  return sheet(2,
    '<div class="q-title">QUOTATION</div>' +
    '<div class="q-format">FORMAT No.: ' + esc(d.formatNo) + '</div>' +
    '<table class="q">' +
      '<colgroup><col class="c-sr"><col class="c-desc"><col class="c-qty"><col class="c-rate"><col class="c-amt"></colgroup>' +
      rows +
      '<tr class="q-head"><th>SR NO</th><th>DESCRIPTION</th><th>QTY</th><th>RATE PER NOS</th><th>AMOUNT</th></tr>' +
      '<tr class="q-item"><td class="ctr">1</td><td class="desc">' + desc + '</td>' +
        '<td class="ctr b">' + esc(qty) + ' ' + esc(ct.unitLabel || '') + '</td>' +
        '<td class="rgt b">' + esc(formatINR(rate)) + '</td>' +
        '<td class="rgt b">' + esc(formatINR(qty * rate)) + '</td></tr>' +
      totals +
      '<tr><td colspan="5" class="inwords"><b>INWORDS :</b> ' + esc(amountInWords(calc.total)) + '</td></tr>' +
      '<tr class="q-end"><td colspan="3" class="q-scope">' +
          '<div class="sc-title">Scope of Work:</div>' +
          '<div class="sc-text">' + nl2br(ct.scopeOfWork) + '</div>' +
          (annex ? '<div class="annex">' + annex + '</div>' : '') +
        '</td><td colspan="2" class="q-sign">' +
          '<div class="sg-for">For, <b>' + esc(COMPANY.name) + '</b></div>' +
          '<div class="sg-space"></div>' +
          '<div class="sg-auth">Authorized Signature</div>' +
        '</td></tr>' +
    '</table>');
}

/* ---------- Page 3: terms & conditions ---------- */
function termsPage(d){
  var sig = d.signatory;
  var rows = (d.terms || []).filter(function(t){ return String(t.label || '').trim() || String(t.value || '').trim(); })
    .map(function(t){ return '<tr><th>' + esc(t.label) + '</th><td>' + nl2br(t.value) + '</td></tr>'; }).join('');
  var closing = String(d.closing || '').split(/\n\s*\n/).map(function(p){ return p.trim(); }).filter(Boolean)
    .map(function(p){ return '<p>' + nl2br(p) + '</p>'; }).join('');

  return sheet(3,
    '<div class="tc-title">ANNEXURE: 1</div>' +
    '<div class="tc-sub">Terms &amp; Conditions</div>' +
    '<table class="tc">' + rows + '</table>' +
    '<div class="tc-close">' + closing + '</div>' +
    '<div class="tc-regards">' +
      '<div>Best Regards,</div>' +
      '<div class="tc-name"><b>' + esc(sig.name) + '</b></div>' +
      (sig.designation ? '<div>' + esc(sig.designation) + '</div>' : '') +
      (sig.phone ? '<div>(M): ' + esc(sig.phone) + '</div>' : '') +
    '</div>');
}

/* ---------- Public: all three pages ---------- */
export function buildSheetsHTML(d){
  var basic = num(d.content.qty || 1) * num(d.content.unitPrice);
  var calc = computeTax(basic, d.tax.mode, d.tax.rate);
  return coverPage(d) + quotationPage(d, calc) + termsPage(d);
}

/* ---------- Auto-fit: shrink text slightly if a page overflows,
   and stretch the quotation's description area to fill the page. ---------- */
var BASE_PT = 10, MIN_PT = 8.5, SAFETY_PX = 6;

export function fitSheets(root){
  var overflow = [];
  root.querySelectorAll('.sheet').forEach(function(sheetEl, idx){
    var body = sheetEl.querySelector('.sh-body');
    var content = sheetEl.querySelector('.sh-content');
    var fill = sheetEl.querySelector('[data-fill]');
    var size = BASE_PT;
    sheetEl.style.fontSize = size + 'pt';
    if(fill) fill.style.minHeight = '0px';

    var guard = 0;
    while(content.offsetHeight > body.clientHeight - SAFETY_PX && size > MIN_PT && guard++ < 40){
      size = Math.round((size - 0.25) * 100) / 100;
      sheetEl.style.fontSize = size + 'pt';
    }
    if(content.offsetHeight > body.clientHeight - SAFETY_PX + 2){
      overflow.push(idx + 1);
    } else if(fill){
      var spare = body.clientHeight - content.offsetHeight - SAFETY_PX;
      if(spare > 0) fill.style.minHeight = (fill.offsetHeight + spare) + 'px';
    }
  });
  return { overflow: overflow };
}
