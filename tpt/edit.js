// Replace an old draft's files, images and description with the TPT edition. Uses iframe #edfr.
const R = window.__R, K = window.__K;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let f = document.getElementById('edfr'); if (!f) { f = document.createElement('iframe'); f.id = 'edfr'; f.style.cssText = 'position:fixed;left:0;top:0;width:1200px;height:900px;opacity:0.01;z-index:-2'; document.body.appendChild(f); }
const load = (u) => new Promise((r) => { f.onload = () => r(); f.src = u; });
window.__elog = window.__elog || [];
window.__edit = (async () => {
  for (const [id, sk] of window.__edits) {
    try {
      await load('/itemsDigital/editNext/' + id); await sleep(3000);
      const w = f.contentWindow, doc = f.contentDocument;
      const D = await (await fetch(R + 'data/' + sk + '.json')).json();
      const title = doc.getElementById('ItemName').value;
      if (title !== D.title) { window.__elog.push({ id, sk, ok: false, why: 'title mismatch: ' + title }); continue; }
      const setFile = async (sel, url, name, type) => { const r = await fetch(url); if (!r.ok) throw new Error(url + ' ' + r.status); const b = await r.blob(); const dt = new w.DataTransfer(); dt.items.add(new w.File([b], name, { type })); const i = doc.querySelector(sel); i.files = dt.files; i.dispatchEvent(new w.Event('change', { bubbles: true })); await sleep(2500); };
      const base = `https://learn.creativesproutdesigns.com/api/kit/${sk}?k=${K}`;
      const del = doc.querySelector('#upload-product .delete-btn'); if (del) { del.click(); await sleep(1500); }
      await setFile('input[type=file]#ItemDigitalProduct', base, D.pdfName, 'application/pdf'); await sleep(3000);
      await setFile('input[type=file]#ItemDigitalPreview', base + '&preview=1', D.previewName, 'application/pdf');
      doc.getElementById('ItemGenerateThumbnail2').click(); await sleep(600);
      for (let i = 0; i < 4; i++) await setFile(`input[type=file]#ItemDigitalThumb${i + 1}`, D.imgs[i], sk + '-tpt-' + (i + 1) + '.jpg', 'image/jpeg');
      const ed = doc.querySelector('.LexicalEditor__content'); ed.focus();
      const sel = w.getSelection(); const rg = doc.createRange(); rg.selectNodeContents(ed); sel.removeAllRanges(); sel.addRange(rg); await sleep(200);
      const dt = new w.DataTransfer(); dt.setData('text/html', D.desc); dt.setData('text/plain', D.desc.replace(/<[^>]+>/g, '\n'));
      ed.dispatchEvent(new w.ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true })); await sleep(800);
      const txt = ed.innerText; const hv = (x) => (doc.querySelector(`input[type=hidden]#${x}`) || {}).value || '';
      const problems = [];
      if (!hv('ItemDigitalProduct')) problems.push('product not replaced');
      if (/Creative Sprout Learning|matches a game/i.test(txt)) problems.push('old desc');
      if (!txt.startsWith('📚')) problems.push('desc start: ' + txt.slice(0, 40));
      for (const x of ['ItemDigitalProduct', 'ItemDigitalPreview', 'ItemDigitalThumb1', 'ItemDigitalThumb2', 'ItemDigitalThumb3', 'ItemDigitalThumb4']) if (!/upload-finished/.test(doc.querySelector(`input[type=file]#${x}`).closest('div').className)) problems.push('upload ' + x);
      const act = doc.getElementById('makeProductActive'); if (act && act.getAttribute('aria-checked') === 'true') act.click();
      if (problems.length) { window.__elog.push({ id, sk, ok: false, problems }); continue; }
      const nav = new Promise((r) => { f.onload = () => r(true); setTimeout(() => r(false), 60000); });
      [...doc.querySelectorAll('button')].find((b) => b.innerText.trim() === 'Submit').click();
      const went = await nav; window.__elog.push({ id, sk, ok: went && f.contentWindow.location.pathname === '/My-Products', where: went ? f.contentWindow.location.pathname : 'timeout' });
    } catch (e) { window.__elog.push({ id, sk, ok: false, why: 'ERR ' + e.message }); }
  }
  return 'done';
})();
