// Runs many listings in a row inside an iframe, so this page's script survives each form submit.
// Usage: window.__R, __K set; window.__queue = [skills]; then run this. Progress in window.__blog and localStorage.tptBatch.
const R = window.__R, K = window.__K;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
window.__blog = window.__blog || []; window.__stop = false;
const save = () => localStorage.setItem('tptBatch', JSON.stringify(window.__blog));
const fillCode = await (await fetch(R + 'fill.js')).text();
const frame = document.createElement('iframe'); frame.style.cssText = 'position:fixed;left:0;top:0;width:1200px;height:900px;opacity:0.01;z-index:-1'; document.body.appendChild(frame);
const load = (url) => new Promise((res) => { frame.onload = () => res(); frame.src = url; });
window.__batch = (async () => {
  while (window.__queue.length && !window.__stop) {
    const SK = window.__queue[0]; const t0 = Date.now();
    try {
      await load('/My-Products/New/Digital-Next'); await sleep(2500);
      const w = frame.contentWindow, doc = frame.contentDocument;
      const D = await (await fetch(R + 'data/' + SK + '.json')).json();
      D.pdf = `https://learn.creativesproutdesigns.com/api/kit/${SK}?tpt=1&k=${K}`; D.previewPdf = null;
      const res = JSON.parse(await (new w.Function('D', 'return (async()=>{' + fillCode + '\n})()'))(D));
      const hv = (id) => (doc.querySelector(`input[type=hidden]#${id}`) || {}).value || '';
      const problems = [...res.log];
      if (res.std.filter((x) => x.startsWith('CCSS.')).length !== D.ccss.length) problems.push('std ' + res.std.join(','));
      if (res.grades.length !== D.grades.length) problems.push('grades ' + res.grades.join(','));
      for (const id of ['ItemDigitalProduct', 'ItemDigitalThumb1', 'ItemDigitalThumb2', 'ItemDigitalThumb3', 'ItemDigitalThumb4']) if (!hv(id)) problems.push('upload ' + id);
      if (!doc.querySelector('.LexicalEditor__content').innerText.trim()) problems.push('desc');
      if (res.active !== 'false') problems.push('active');
      if (problems.length) { window.__blog.push({ sk: SK, ok: false, problems }); window.__queue.shift(); save(); continue; }
      const nav = new Promise((res2) => { frame.onload = () => res2(true); setTimeout(() => res2(false), 60000); });
      [...doc.querySelectorAll('button')].find((b) => b.innerText.trim() === 'Submit').click();
      const went = await nav; const where = went ? frame.contentWindow.location.pathname : 'timeout';
      const ok = where === '/My-Products';
      window.__blog.push({ sk: SK, ok, where, secs: Math.round((Date.now() - t0) / 1000), err: ok ? undefined : (frame.contentDocument.body.innerText.match(/(error|required|please)[^\n]{0,120}/i) || [''])[0] });
    } catch (e) { window.__blog.push({ sk: SK, ok: false, problems: ['ERR ' + e.message] }); }
    window.__queue.shift(); save();
  }
  return 'finished';
})();
'started';
