/* A small copy of the home screen's dial for the welcome pages: the plate, the
   24-hour rim with amber up to now, and the well. Drawn the way the app draws
   it (homeDialHTML / dialRimInner), at any size. */
function welcomeDial(el, size, opts) {
  opts = opts || {};
  var S = size, R = S / 2 - 12, W = Math.max(5, S / 45), h = '';
  var rtl = document.documentElement.dir === 'rtl', dir = rtl ? -1 : 1;
  var d = new Date(), mins = (d.getHours() < 4 ? d.getHours() + 24 : d.getHours()) * 60 + d.getMinutes();
  if (opts.at) mins = opts.at;
  var from = 360;
  function ang(m) { return dir * ((m / 60 - 12) * 15); }
  function pt(deg, r) { var a = deg * Math.PI / 180; return [(r || R) * Math.sin(a), -(r || R) * Math.cos(a)]; }
  function at(deg, r) { var q = pt(deg, r); return q[0].toFixed(1) + ' ' + q[1].toFixed(1); }
  function arc(m0, m1) { var a0 = ang(m0), a1 = ang(m1);
    return 'M' + at(a0) + ' A' + R + ' ' + R + ' 0 ' + (Math.abs(a1 - a0) > 180 ? 1 : 0) + ' ' + (a1 > a0 ? 1 : 0) + ' ' + at(a1); }
  h += '<defs><filter id="wg" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter></defs>';
  h += '<circle r="' + R + '" fill="none" stroke="rgba(168,160,148,.45)" stroke-width="' + (W + 1) + '" transform="translate(1.2,1.6)"/>' +
       '<circle r="' + R + '" fill="none" stroke="#e5e2dd" stroke-width="' + W + '"/>' +
       '<circle r="' + R + '" fill="none" stroke="rgba(255,255,255,.85)" stroke-width="1.4" transform="translate(-.8,-1.2)"/>';
  for (var i = 0; i < 24; i++) { if (i % 6 === 0) continue; var a = ang(i * 60), q0 = pt(a, R - W - 3), q1 = pt(a, R - W - 7);
    h += '<line x1="' + q0[0].toFixed(1) + '" y1="' + q0[1].toFixed(1) + '" x2="' + q1[0].toFixed(1) + '" y2="' + q1[1].toFixed(1) + '" stroke="#c9c1b8" stroke-width="1.1" stroke-linecap="round"/>'; }
  if (mins > from) {
    var lit = arc(from, Math.min(mins, from + 1439));
    h += '<path class="wd-lit" d="' + lit + '" fill="none" stroke="rgba(249,206,147,.9)" stroke-width="' + (W - 1) + '" stroke-linecap="round" filter="url(#wg)"/>' +
         '<path class="wd-lit" d="' + lit + '" fill="none" stroke="rgba(240,169,46,.85)" stroke-width="' + Math.max(2.5, W - 4) + '" stroke-linecap="round"/>';
    var p = pt(ang(mins));
    h += '<circle class="wd-now" cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="' + (W / 2 + 4) + '" fill="rgba(249,206,147,.95)" filter="url(#wg)"/>' +
         '<circle class="wd-now" cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="' + (W / 2 + 1.6) + '" fill="#f0a92e" stroke="#fff" stroke-width="1.8"/>';
  }
  el.innerHTML = '<div class="wd-plate" style="width:' + S + 'px;height:' + S + 'px"><svg viewBox="' + (-S / 2) + ' ' + (-S / 2) + ' ' + S + ' ' + S + '" width="' + S + '" height="' + S + '">' + h + '</svg>' +
    '<div class="wd-well" style="width:' + (S * .36) + 'px;height:' + (S * .36) + 'px"></div></div>';
}
