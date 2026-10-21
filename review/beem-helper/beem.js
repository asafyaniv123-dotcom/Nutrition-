/* Shared by the three step-1 pages: load the app's own Beem (vendor/beem-app.js,
   built from the approved character sheet) and play a hello. Nothing is
   redrawn: faces and motions are the kit's. */
window.BEEM_ASSET_BASE = '../../dev/assets/';
/* already smiling when the screen opens, and breathing - no entrance */
var SMILE = {dur: 12000, ev: [[0, 'face', 'happy'], [0, 'mode', {breathe: [.018, 4], idle: 0}],
  [2600, 'nod', 1, 6], [4200, 'fx', {t: 'rings', v: {sc: [1.08, 1.11, 1.14]}, d: 3200, s: 120}],
  [7600, 'fx', {t: 'rings', v: {sc: 1}, d: 2600, s: 120}], [9000, 'face', 'wink'], [9450, 'face', 'happy']]};
var HELLO = {dur: 9000, ev: [
  [0, 'face', 'happy'], [0, 'mode', {breathe: [.016, 4], idle: 0}],
  [350, 'look', 0, -12], [800, 'nod', 1, 10],
  [1700, 'face', 'wink'], [2150, 'face', 'happy'],
  [2700, 'look', 0, 0], [3600, 'face', 'content'],
  [4200, 'fx', {t: 'rings', v: {sc: [1.1, 1.13, 1.16]}, d: 3000, s: 120}],
  [7200, 'fx', {t: 'rings', v: {sc: 1}, d: 1800, s: 120}],
  [8200, 'face', 'calm']]};
function beemHello(el, play) {
  var sc = document.createElement('script');
  sc.src = '../../vendor/beem-app.js';
  sc.onload = function () {
    window.BeemKit.ready.then(function () { window.BeemKit.mount(el, {play: play || HELLO}); });
  };
  document.head.appendChild(sc);
}
