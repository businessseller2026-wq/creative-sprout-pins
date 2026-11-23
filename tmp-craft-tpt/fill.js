// Craft kits: fill an open TPT New-Digital form. Called as new Function('w','doc','D','KEY', code).
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const BASE = 'https://raw.githubusercontent.com/businessseller2026-wq/creative-sprout-pins/main/tmp-craft-tpt/' + D.slug + '/';
const log = [];
const setInput = (el, v) => { Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, 'value').set.call(el, v); el.dispatchEvent(new w.Event('input', { bubbles: true })); el.dispatchEvent(new w.Event('change', { bubbles: true })); el.dispatchEvent(new w.Event('blur', { bubbles: true })); };
const hex = (s) => new Uint8Array(s.match(/../g).map((h) => parseInt(h, 16)));
const getPdf = async () => {
  const buf = new Uint8Array(await (await fetch(BASE + 'file.bin', { cache: 'no-store' })).arrayBuffer());
  const k = await crypto.subtle.importKey('raw', hex(KEY), 'AES-GCM', false, ['decrypt']);
  return new Blob([await crypto.subtle.decrypt({ name: 'AES-GCM', iv: buf.slice(0, 12) }, k, buf.slice(12))], { type: 'application/pdf' });
};
const done = (id) => /upload-finished/.test((doc.querySelector(`input[type=file]#${id}`).closest('div') || {}).className || '') || !!(doc.querySelector(`input[type=hidden]#${id}`) || {}).value;
const setFile = async (id, blob, name, type) => {
  const dt = new w.DataTransfer(); dt.items.add(new w.File([blob], name, { type }));
  const i = doc.querySelector(`input[type=file]#${id}`); i.files = dt.files; i.dispatchEvent(new w.Event('change', { bubbles: true }));
  for (let k = 0; k < 90; k++) { await sleep(1000); if (done(id)) return; } log.push('slow upload ' + id);
};
const reactSelect = async (id, values) => { const inp = doc.getElementById(id); for (const v of values) { inp.focus(); setInput(inp, v); await sleep(900); const o = [...doc.querySelectorAll('.Select__menu [role=option]')].find((x) => x.textContent.trim() === v && x.getAttribute('aria-disabled') !== 'true'); if (o) { o.click(); await sleep(400); } else log.push(id + ' missing ' + v); } inp.blur(); };
// title
setInput(doc.getElementById('ItemName'), D.title);
// product file
const pdf = await getPdf(); if (pdf.size < 100000) log.push('pdf small ' + pdf.size);
await setFile('ItemDigitalProduct', pdf, D.pdfName.replace(' - TPT & Etsy', ''), 'application/pdf'); // '&' in the name is refused (403)
// thumbnails: "Upload thumbnails now"
doc.getElementById('ItemGenerateThumbnail2').click(); await sleep(800);
for (let i = 0; i < 4; i++) { const b = await (await fetch(BASE + D.thumbs[i], { cache: 'no-store' })).blob(); await setFile('ItemDigitalThumb' + (i + 1), b, D.thumbs[i], 'image/png'); }
// description
{ const ed = doc.querySelector('.LexicalEditor__content'); ed.focus(); const dt = new w.DataTransfer(); dt.setData('text/html', D.desc); dt.setData('text/plain', D.desc.replace(/<[^>]+>/g, '\n')); ed.dispatchEvent(new w.ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true })); await sleep(600); }
// price (license price matches Turkey: 10% off)
setInput(doc.getElementById('item-price'), D.price); setInput(doc.getElementById('item-license-price'), (Number(D.price) * 0.9).toFixed(2));
// tax code
{ const t = [...doc.querySelectorAll('span')].find((e) => e.textContent.trim() === 'Select a tax code'); if (t) { t.closest('[role=combobox]').click(); await sleep(600); const o = [...doc.querySelectorAll('[role=option]')].find((x) => x.textContent.trim() === 'Other Digital Goods - No Physical Media'); o ? o.click() : log.push('no tax'); await sleep(300); } }
// grades
for (const g of D.grades) { const b = doc.getElementById('data.Grade.Grade-checkbox_' + g.toLowerCase().replace(/ /g, '-')); if (!b) { log.push('no grade ' + g); continue; } if (b.getAttribute('aria-checked') !== 'true') b.click(); await sleep(150); }
// subject, tag, format
await reactSelect('subject-areas', D.subjects); await reactSelect('tags', D.tags);
doc.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); await sleep(300);
// CCSS (all math, kindergarten)
{
  const btn = [...doc.querySelectorAll('button')].find((b) => b.innerText.trim() === 'Select CCSS'); btn.click(); await sleep(1500);
  const setSel = (el, v) => { Object.getOwnPropertyDescriptor(w.HTMLSelectElement.prototype, 'value').set.call(el, v); el.dispatchEvent(new w.Event('change', { bubbles: true })); };
  const tb = [...doc.querySelectorAll('button[role=tab]')].filter((b) => b.innerText.trim() === 'Math').pop();
  if (tb.getAttribute('aria-selected') !== 'true') { tb.dispatchEvent(new w.PointerEvent('pointerdown', { bubbles: true, button: 0, pointerType: 'mouse' })); tb.dispatchEvent(new w.MouseEvent('mousedown', { bubbles: true, button: 0 })); tb.click(); await sleep(1200); }
  const gs = doc.getElementById('ccssGradeSelect'); if (gs && gs.value !== 'Kindergarten') { setSel(gs, 'Kindergarten'); await sleep(1000); }
  const AREA = { CC: '3005', G: '3010', MD: '3006' };
  for (const code of D.ccss) {
    const as = doc.getElementById('ccssAreaSelect'); setSel(as, AREA[code.split('.')[1]]); await sleep(1200);
    const row = [...doc.querySelectorAll('.EducationStandardsTerminalRow')].find((r) => r.querySelector('.EducationStandardsTerminalRow__labelTitle')?.textContent.trim() === code);
    if (row) { const cb = row.querySelector('input'); if (!cb.checked) cb.click(); await sleep(300); } else log.push('ccss missing ' + code);
  }
  const dn = [...doc.querySelectorAll('button')].filter((b) => b.innerText.trim() === 'Done').pop(); dn && dn.click(); await sleep(700);
}
// details
setInput(doc.getElementById('numberOfPagesOrSlides'), String(D.pages));
{ const tg = doc.getElementById('answerKey-toggle-button'); if (tg) { tg.click(); await sleep(500); const o = [...doc.querySelectorAll('[role=option]')].find((x) => x.textContent.trim() === 'N/A'); o ? o.click() : log.push('no answerkey N/A'); await sleep(300); } }
{ const c = doc.getElementById('data.ItemsProperty.copyright_declaration-0'); c.click(); await sleep(200); }
{ const a = doc.getElementById('makeProductActive'); if (a.getAttribute('aria-checked') === 'true') a.click(); await sleep(300); }
await sleep(800);
const t = doc.body.innerText; const i = t.indexOf('state-specific equivalents.');
const hv = (id) => done(id);
const problems = [...log];
const std = t.slice(i + 28, t.indexOf('Select CCSS', i)).trim().split('\n').filter((x) => x.startsWith('CCSS.'));
if (std.length !== D.ccss.length) problems.push('std ' + std.join(','));
const grades = [...doc.querySelectorAll('button[id^="data.Grade"][aria-checked=true]')].map((b) => b.id.split('_')[1]);
if (grades.length !== D.grades.length) problems.push('grades ' + grades.join(','));
for (const id of ['ItemDigitalProduct', 'ItemDigitalThumb1', 'ItemDigitalThumb2', 'ItemDigitalThumb3', 'ItemDigitalThumb4']) if (!hv(id)) problems.push('upload ' + id);
if (!doc.querySelector('.LexicalEditor__content').innerText.trim()) problems.push('desc');
if (doc.getElementById('makeProductActive').getAttribute('aria-checked') !== 'false') problems.push('active');
const cr = doc.querySelector('input[name="data[ItemsProperty][copyright_declaration]"]:checked');
return { slug: D.slug, problems, std, grades, copyright: cr ? cr.value : (doc.getElementById('data.ItemsProperty.copyright_declaration-0').getAttribute('aria-checked')), price: doc.getElementById('item-price').value, lic: doc.getElementById('item-license-price').value };
