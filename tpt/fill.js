const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = [];
const setInput = (el, v) => { Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value').set.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); el.dispatchEvent(new Event('blur', { bubbles: true })); };
const setFile = async (sel, url, name, type) => { const r = await fetch(url); if (!r.ok) throw new Error('fetch ' + url + ' ' + r.status); const b = await r.blob(); const dt = new DataTransfer(); dt.items.add(new File([b], name, { type })); const i = document.querySelector(sel); i.files = dt.files; i.dispatchEvent(new Event('change', { bubbles: true })); };
const leafBtn = (txt, root = document) => [...root.querySelectorAll('button')].find((b) => b.innerText.trim() === txt);
const pickSelect = async (toggleSel, optText) => { const t = document.querySelector(toggleSel); t.click(); await sleep(500); const o = [...document.querySelectorAll('[role=option]')].find((x) => x.textContent.trim() === optText); if (!o) { log.push('no option ' + optText); return; } o.click(); await sleep(300); };
const reactSelect = async (id, values) => { const inp = document.getElementById(id); for (const v of values) { inp.focus(); setInput(inp, v); await sleep(700); const o = [...document.querySelectorAll('.Select__menu [role=option]')].find((x) => x.textContent.trim() === v && x.getAttribute('aria-disabled') !== 'true'); if (o) { o.click(); await sleep(300); } else log.push(id + ' missing ' + v); } inp.blur(); };
// 1 title
setInput(document.getElementById('ItemName'), D.title);
// 2 files
await setFile('input[type=file]#ItemDigitalProduct', D.pdf, D.pdfName, 'application/pdf');
if (D.previewPdf) await setFile('input[type=file]#ItemDigitalPreview', D.previewPdf, D.previewName, 'application/pdf');
document.getElementById('ItemGenerateThumbnail2').click(); await sleep(600);
for (let i = 0; i < D.imgs.length; i++) { await setFile(`input[type=file]#ItemDigitalThumb${i + 1}`, D.imgs[i], D.slug + '-' + (i + 1) + '.jpg', 'image/jpeg'); await sleep(1200); }
// 3 description
{ const ed = document.querySelector('.LexicalEditor__content'); ed.focus(); const dt = new DataTransfer(); dt.setData('text/html', D.desc); dt.setData('text/plain', D.desc.replace(/<[^>]+>/g, '\n')); ed.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true })); await sleep(400); }
// 4 price
setInput(document.getElementById('item-price'), D.price); setInput(document.getElementById('item-license-price'), D.price);
// 5 tax code
{ const t = [...document.querySelectorAll('span')].find((e) => e.textContent.trim() === 'Select a tax code'); if (t) { t.closest('[role=combobox]').click(); await sleep(500); const o = [...document.querySelectorAll('[role=option]')].find((x) => x.textContent.trim() === 'Other Digital Goods - No Physical Media'); o ? o.click() : log.push('no tax'); await sleep(300); } }
// 6 grades
for (const g of D.grades) { const b = document.getElementById('data.Grade.Grade-checkbox_' + g.toLowerCase().replace(/ /g, '-')); if (!b) { log.push('no grade ' + g); continue; } if (b.getAttribute('aria-checked') !== 'true') b.click(); await sleep(150); }
// 7 subjects, tags
await reactSelect('subject-areas', D.subjects); await reactSelect('tags', D.tags);
document.activeElement && document.activeElement.blur(); document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); await sleep(300);
// 8 standards (CCSS)
if (D.ccss.length) {
  leafBtn('Select CCSS').click(); await sleep(1200);
  const setSel = (el, v) => { Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(el, v); el.dispatchEvent(new Event('change', { bubbles: true })); };
  for (const code of D.ccss) {
    const math = !/^(RF|RL|RI|L|W|SL)\./.test(code); const tb = [...document.querySelectorAll('button[role=tab]')].filter((b) => b.innerText.trim() === (math ? 'Math' : 'ELA')).pop(); if (tb.getAttribute('aria-selected') !== 'true') { tb.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, pointerType: 'mouse' })); tb.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0 })); tb.click(); await sleep(1000); }
    const gr = code.match(/(?:^|\.)([K12])\./)[1]; const gs = document.getElementById('ccssGradeSelect'); setSel(gs, gr === 'K' ? 'Kindergarten' : gr); await sleep(900);
    const as = document.getElementById('ccssAreaSelect'); let done = false;
    const pref = code.match(/^(RF|RL|RI|L|W|SL)\./)?.[1]; const AREA = { RF: 'Reading: Foundational Skills', RL: 'Reading: Literature', RI: 'Reading: Informational Text', L: 'Language', W: 'Writing', SL: 'Speaking & Listening' };
    const MAREA = { CC: 'Counting and Cardinality', G: 'Geometry', MD: 'Measurement and Data', NBT: 'Number and Operations in Base Ten', OA: 'Operations and Algebraic Thinking', NF: 'Number and Operations—Fractions' };
    const md = code.match(/^[K12]\.([A-Z]+)\./)?.[1]; if (md) AREA.M = MAREA[md];
    const order = [...as.options].sort((a, b) => (a.text === AREA[pref || 'M'] ? -1 : 0) - (b.text === AREA[pref || 'M'] ? -1 : 0));
    for (const opt of order) { if (/Anchor/.test(opt.text)) continue; setSel(as, opt.value); await sleep(900);
      const row = [...document.querySelectorAll('.EducationStandardsTerminalRow')].find((r) => r.querySelector('.EducationStandardsTerminalRow__labelTitle')?.textContent.trim() === code);
      if (row) { const cb = row.querySelector('input'); if (!cb.checked) cb.click(); await sleep(250); done = true; break; } }
    if (!done) log.push('ccss missing ' + code); }
  const dn = [...document.querySelectorAll('button')].filter((b) => b.innerText.trim() === 'Done').pop(); dn && dn.click(); await sleep(500);
}
// 9 details
setInput(document.getElementById('numberOfPagesOrSlides'), String(D.pages));
await pickSelect('#answerKey-toggle-button', 'Included');
{ const r = [...document.querySelectorAll('input[name="data[ItemsProperty][copyright_declaration]"]')].find((x) => x.value === '2'); const b = r.parentElement.querySelector('button') || r.previousElementSibling; (b || r).click(); }
{ const a = document.getElementById('makeProductActive'); if (a.getAttribute('aria-checked') === 'true') a.click(); }
await sleep(800);
const t = document.body.innerText; const i = t.indexOf('state-specific equivalents.');
return JSON.stringify({ log, std: t.slice(i + 28, t.indexOf('Select CCSS', i)).trim().split('\n'), grades: [...document.querySelectorAll('button[id^="data.Grade"][aria-checked=true]')].map((b) => b.id.split('_')[1]), ccssNum: document.querySelector('input[name="data[ItemsCommonCoreStandard][common_core_standards_num]"]').value, active: document.getElementById('makeProductActive').getAttribute('aria-checked'), price: document.getElementById('item-price').value });
