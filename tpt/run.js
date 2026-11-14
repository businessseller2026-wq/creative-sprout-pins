// Fill the open New-Digital form for window.__SK, check it, and save it as a draft (inactive).
const R = window.__R, K = window.__K, SK = window.__SK;
if (!window.__job) {
  window.__job = (async () => {
    const D = await (await fetch(R + 'data/' + SK + '.json')).json();
    D.pdf = `https://learn.creativesproutdesigns.com/api/kit/${SK}?tpt=1&k=${K}`; D.previewPdf = null;
    const code = await (await fetch(R + 'fill.js')).text();
    const res = JSON.parse(await (new Function('D', 'return (async()=>{' + code + '\n})()'))(D));
    const hv = (id) => (document.querySelector(`input[type=hidden]#${id}`) || {}).value || '';
    const problems = [...res.log];
    if (res.std.filter((x) => x.startsWith('CCSS.')).length !== D.ccss.length) problems.push('std ' + res.std.join(','));
    if (res.grades.length !== D.grades.length) problems.push('grades ' + res.grades.join(','));
    for (const id of ['ItemDigitalProduct', 'ItemDigitalThumb1', 'ItemDigitalThumb2', 'ItemDigitalThumb3', 'ItemDigitalThumb4']) if (!hv(id)) problems.push('upload ' + id);
    if (!document.querySelector('.LexicalEditor__content').innerText.trim()) problems.push('desc');
    if (res.active !== 'false') problems.push('active');
    const out = { sk: SK, problems, title: D.title };
    if (!problems.length) { sessionStorage.setItem('tptLast', JSON.stringify({ ...out, submitted: new Date().toISOString() })); [...document.querySelectorAll('button')].find((b) => b.innerText.trim() === 'Submit').click(); }
    return out;
  })().then((r) => (window.__res = r), (e) => (window.__res = { sk: SK, problems: ['ERR ' + e.message] }));
}
