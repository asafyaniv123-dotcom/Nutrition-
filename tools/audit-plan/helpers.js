/* injected into the page before the steps run */
window.__sleep = (ms) => new Promise((r) => setTimeout(r, ms));
window.__q = (s) => typeof s === 'string' ? document.querySelector(s) : s;
window.__setup = function (secs) {
  document.querySelectorAll('.bms').forEach((e) => e.remove());
  localStorage.setItem(AREA_TOUR_KEY, JSON.stringify({ planning: 1 }));
  localStorage.setItem(PLAN_SECS_KEY, JSON.stringify(secs || { week: true, month: false, day: false, bot: false }));
  _planSecs = null;
  enterModule('planning');
  return 'ok';
};
window.__c = function (el) { el = __q(el); const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, r: { l: Math.round(r.left), t: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) } }; };
window.__pe = function (type, x, y, target) {
  const t = target || document.elementFromPoint(x, y) || document.body;
  t.dispatchEvent(new PointerEvent(type, { clientX: x, clientY: y, pointerId: 1, isPrimary: true, bubbles: true, cancelable: true, pointerType: 'touch', button: 0, buttons: type === 'pointerup' ? 0 : 1 }));
};
/* press on an element (or a point), slide to a point, optionally hold, release */
window.__drag = async function (from, to, o) {
  o = o || {};
  let a = from.x !== undefined ? from : __c(from);
  const startEl = from.x !== undefined ? document.elementFromPoint(a.x, a.y) : (__q(from));
  __pe('pointerdown', a.x, a.y, startEl);
  const b = to.x !== undefined ? to : __c(to);
  const n = o.steps || 12;
  for (let i = 1; i <= n; i++) {
    __pe('pointermove', a.x + (b.x - a.x) * i / n, a.y + (b.y - a.y) * i / n);
    await __sleep(o.stepMs || 25);
  }
  if (o.hold) await __sleep(o.hold);
  if (o.beforeUp) { const r = await o.beforeUp(); if (o.keepDown) return r; }
  if (o.keepDown) return 'down';
  __pe('pointerup', b.x, b.y);
  await __sleep(150);
  return 'dropped';
};
window.__tap = function (el) { el = __q(el); el.click(); return true; };
window.__type = function (el, text, enter) {
  el = __q(el); el.focus(); el.value = text; el.dispatchEvent(new Event('input', { bubbles: true }));
  if (enter) el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  return true;
};
window.__into = async function (el) { el = __q(el); el.scrollIntoView({ block: 'center' }); await __sleep(250); return __c(el); };
window.__findText = function (sel, txt) { return [...document.querySelectorAll(sel)].find((e) => e.textContent.indexOf(txt) >= 0) || null; };
window.__state = function (date) {
  const sun = weekSunday(new Date((date || todayStr()) + 'T12:00:00'));
  return { week: loadWeek(sun).tasks.map((t) => [t.id, t.w, t.d, t.s, t.len || 1]), pool: loadPool().tasks.map((t) => [t.id, t.w]), undo: _planUndo.length };
};
window.__dp = function (d) { const x = loadDPlan(d); return { items: x.items.map((i) => [i.id, i.w, i.h, i.mn || 0, i.e || 0]), hours: x.hours, ends: x.ends }; };
window.__ovl = function (a, b) { a = __q(a); b = __q(b); if (!a || !b) return 'missing ' + (!a ? 'a' : 'b'); const r = a.getBoundingClientRect(), s = b.getBoundingClientRect();
  const ix = Math.max(0, Math.min(r.right, s.right) - Math.max(r.left, s.left)), iy = Math.max(0, Math.min(r.bottom, s.bottom) - Math.max(r.top, s.top));
  return { overlapPx: Math.round(ix * iy), a: __c(a).r, b: __c(b).r }; };
/* fake /schedule so the writing line can be walked without spending the quota */
window.__fakeSchedule = function (items) {
  window.__realFetch = window.__realFetch || window.fetch;
  window.fetch = function (u, o) {
    if (String(u).indexOf('/schedule') >= 0) { window.__lastSchedBody = o && o.body; return Promise.resolve(new Response(JSON.stringify({ ok: true, items: items }), { status: 200, headers: { 'content-type': 'application/json' } })); }
    if (String(u).indexOf('/plan') >= 0) return Promise.reject(new Error('offline in audit'));
    return window.__realFetch.apply(this, arguments);
  };
  return true;
};
window.__ymd = function (d) { return dayStr(d); };
window.__addDays = function (iso, n) { return psDayAdd(iso, n); };
