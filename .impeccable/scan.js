/* The sweep, as a file rather than a paragraph retyped into every call.
   Injected into a screen with:
       var s=document.createElement('script');s.src='/.impeccable/scan.js';
       document.head.appendChild(s);
   then __scan() answers three questions about what is ON THE SCREEN:

     white   surfaces still painting pure white - the old design's card
     old     the old palette's violet, terracotta and green
     low     text under 4.5:1 against the surface actually behind it

   It walks UP for the background rather than assuming one. Hardcoding it is
   a mistake I made earlier in this session and it reported 1.23:1 for a badge
   that was really 2.8:1 - the scanner's number, not the screen's.

   WHAT IT DELIBERATELY IGNORES, because Asaf decided colour stays where it
   carries meaning rather than decoration:
     · the four macro colours in תזונה
     · the paper spread on סיום יום's board
     · the areas' identity colours - the fan, the drawer icons
     · the week planner’s twelve colour swatches - a picker, all information
     · the seven category colours in תובנות - .ins-ic, one per category,
       verified as seven distinct hues and not a leftover
   and the DEV badge, which is never on her screen. */
(function () {
  var SKIP = /ar-ic|areas-|cdisc|cpetal|chub-ic|macro-|rf-card|rf-board|ins-cat|ins-row|ins-ic|wk-swatch|tube|wtube/;
  /* THE OLD PALETTE, AS A SURFACE. Every violet, terracotta and green that
     was chosen to be FILLED with. A background, a border or a stroke in one
     of these is still the old world. */
  var OLD = /166, 144, 207|201, 188, 224|232, 223, 245|240, 234, 250|247, 242, 251|107, 90, 146|224, 138, 114|243, 185, 168|224, 196, 187|143, 199, 158/;
  /* AND THE SAME PALETTE, AS TEXT - which is not the same question.
     --violet-700 (107,90,146) and --terra-700 (152,73,44) exist for exactly
     one purpose, spelled out in the file above them: "readable as text". They
     are where the 140 fills-read-as-text were sent, deliberately, because
     several of them are the MACRO figures and violet IS calories. Reporting
     them forever as "old palette" is a detector that cries wolf on its own
     fix - eight .fdb-rk calorie figures on one food search - and a check that
     always fires is a check that stops being read.

     So text is asked the narrower question. A -700 as a BACKGROUND is still
     caught, by OLD above, because a colour chosen to be read is not a colour
     to be filled with either. */
  var OLD_TEXT = /166, 144, 207|201, 188, 224|232, 223, 245|240, 234, 250|247, 242, 251|224, 138, 114|243, 185, 168|224, 196, 187|143, 199, 158/;

  function P(c) {
    var m = String(c).match(/rgba?\(([^)]+)\)/); if (!m) return null;
    var p = m[1].split(',').map(parseFloat);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  }
  function L(c) {
    var f = function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  }
  function R(a, b) { var x = L(a), y = L(b); if (x < y) { var t = x; x = y; y = t; } return (x + 0.05) / (y + 0.05); }
  function stops(bi) { var o = [], re = /rgba?\([^)]+\)/g, m; while ((m = re.exec(bi))) o.push(P(m[0])); return o.filter(Boolean); }

  /* THE SURFACE ACTUALLY BEHIND THIS TEXT.
     Walking up the DOM is the obvious way and it is wrong here: the home
     screen's sky is position:fixed, so it paints behind the greeting without
     being its ancestor. A previous scan in this project reported that
     greeting at 1.14:1 and it reads fine - the number was the scanner's, not
     the screen's, and fifteen home findings were nearly filed on the strength
     of it.

     elementsFromPoint asks the browser what is actually stacked under the
     point, which is the question. The DOM walk stays as the fallback for
     anything the hit test cannot reach. */
  /* WHEN THE ANSWER CANNOT BE DERIVED, SAY SO INSTEAD OF GUESSING.
     A gradient's stops are not the colour at a point, and a layer at opacity
     .62 is not its own colour either. The person card stacks both: a hue
     gradient at 62% that is fully transparent exactly where the name sits,
     over the ground. Reading the stops gave 2.06:1 for text that is plainly
     ink on plaster - checked on screen before believing either number.

     Compositing that properly needs the painted pixel, which this file cannot
     read. So a finding whose backdrop is translucent or has a transparent
     stop is marked uncertain and kept apart from the ones that are simply
     wrong. A detector that cries wolf is one that stops being read.

     The first version of this walked UP from the text, and the layer it
     needed to see is a SIBLING: .pp-face-no sits beside .pp-face-x inside the
     card, not above it. behind() is what finds it, through the hit test, so
     behind() is what has to say so. */
  var backdropUnsure = false;
  function noteBackdrop(cs) {
    if (parseFloat(cs.opacity) < 0.99) backdropUnsure = true;
    var bi = cs.backgroundImage || '';
    if (bi && bi !== 'none' && /rgba\([^)]*,\s*0(\.\d+)?\s*\)/.test(bi)) backdropUnsure = true;
  }

  function behind(el) {
    /* THE ELEMENT'S OWN FILL COMES FIRST. Obvious once stated, and I had it
       wrong: the first version skipped past el to ask what was UNDER it, so a
       dark button with white text was measured against the ground it sits on
       and reported at 1.23:1 when it is 9.69:1. Text sits on its own
       element's background before it sits on anything else. */
    var own = getComputedStyle(el), ownImg = own.backgroundImage || '';
    if (ownImg && ownImg !== 'none') { var os = stops(ownImg); if (os.length) return os; }
    var ob = P(own.backgroundColor);
    if (ob && ob.a > 0.5) return [ob];

    var r = el.getBoundingClientRect();
    var x = Math.min(innerWidth - 1, Math.max(0, r.left + r.width / 2));
    var y = Math.min(innerHeight - 1, Math.max(0, r.top + r.height / 2));
    var stack = [];
    try { stack = document.elementsFromPoint(x, y); } catch (e) {}
    var seen = false;
    for (var i = 0; i < stack.length; i++) {
      if (!seen) { if (stack[i] === el) seen = true; continue; }   /* only what is UNDER it */
      var cs = getComputedStyle(stack[i]), bi = cs.backgroundImage || '';
      if (bi && bi !== 'none') { var st = stops(bi); if (st.length) { noteBackdrop(cs); return st; } }
      var bc = P(cs.backgroundColor);
      if (bc && bc.a > 0.5) { noteBackdrop(cs); return [bc]; }
    }
    var p = el;
    while (p && p !== document.documentElement) {
      var c2 = getComputedStyle(p), b2 = c2.backgroundImage || '';
      if (b2 && b2 !== 'none') { var s2 = stops(b2); if (s2.length) return s2; }
      var q = P(c2.backgroundColor);
      if (q && q.a > 0.5) return [q];
      p = p.parentElement;
    }
    return null;
  }

  window.__scan = function () {
    /* A SWEEP OF A SCREEN THAT IS NOT SHOWING RETURNS "clean", AND THAT IS
       THE WORST ANSWER THIS FILE CAN GIVE. It happened: a language change
       re-rendered while the module was hidden, every rect came back 0, and
       the sweep reported nothing wrong with a screen nobody was looking at.
       So say what is on screen before saying it is clean. */
    /* Counting elements was the wrong question and lied both ways: it called
       a rendered screen blind because the empty state of אנשים has five
       things on it, a title and a button among them. A sparse screen is not
       an unrendered one.

       The right question is whether the container has a box at all. A screen
       that is not showing measures zero; one showing four elements measures
       its full width. */
    /* The first MATCH is not the first SHOWING one: on אני the query returns
       #content, which is hidden there, and the guard called a visible screen
       blind. Take the biggest box among them. */
    var sb = null;
    [].forEach.call(document.querySelectorAll('#content, #home-screen, #me-screen'), function (st) {
      var b = st.getBoundingClientRect();
      if (!sb || b.width * b.height > sb.width * sb.height) sb = b;
    });
    if (!sb || sb.width < 60 || sb.height < 60)
      return { blind: true, stage: sb ? Math.round(sb.width) + 'x' + Math.round(sb.height) : 'none',
        white: [], old: [], low: [], over: [], clean: false,
        note: 'the screen has no box - it was not showing, so this sweep proves nothing' };

    var white = [], old = [], low = [], unsure = [], all = document.querySelectorAll('*'), i, el, cs, r, cl;
    for (i = 0; i < all.length; i++) {
      el = all[i]; r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      if (r.right < 0 || r.left > innerWidth || r.bottom < 0 || r.top > innerHeight) continue;
      cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.opacity === '0') continue;
      /* A THING BEHIND SOMETHING ELSE IS NOT ON THE SCREEN. Two findings kept
         coming back and neither was real: "Better Me" at 1.25:1, which is the
         home logo still in the layout under an area's full-screen splash, and
         the tab bar's "Me" at 1.73:1 whenever a sheet's dimmed overlay is over
         it. Both are perfectly fine where a person can see them; the only
         reason they measure badly is that the scanner was reading a colour
         nobody is looking at.

         elementFromPoint at the middle asks the browser the question directly
         - WHAT IS ON TOP HERE - and a hit that is neither this element nor
         inside it means something covers it. Cheaper and more honest than a
         z-index walk, and it costs one hit test per visible element. The
         centre can fall outside the viewport for a tall element, so it is
         clamped; a null answer (off-screen, or a point with nothing in it) is
         not treated as covered, because "I could not tell" must never read as
         "skip it". */
      var cx = Math.min(Math.max(r.left + r.width / 2, 1), innerWidth - 1);
      var cy = Math.min(Math.max(r.top + r.height / 2, 1), innerHeight - 1);
      var top = document.elementFromPoint(cx, cy);
      if (top && top !== el && !el.contains(top) && !top.contains(el)) continue;
      /* A THING MID-ANIMATION IS NOT A THING TO MEASURE. The area splash
         lands one word at a time - .ps-w is opacity:0 with a staggered
         ps-word animation - and a sweep that arrives during it reads five
         words at 1.05:1 and calls them a defect. They are not: half a second
         later they are white on the area's colour. The opacity===0 test above
         only catches the word that has not started; it cannot catch the one
         at 0.43.

         getAnimations is the precise question - IS THIS MOVING RIGHT NOW -
         rather than a threshold on opacity, which would also hide text that
         is genuinely too faint. Asked only when the element is not fully
         opaque, so the common case pays nothing. */
      if (cs.opacity !== '1' && el.getAnimations) {
        var anim = el.getAnimations();
        var moving = false;
        for (var q = 0; q < anim.length; q++) if (anim[q].playState === 'running') { moving = true; break; }
        if (moving) continue;
      }
      /* An SVG's className is an SVGAnimatedString, not a string, so reading
         it the obvious way returns '' and the skip list never matches - which
         is how the fan's identity icons kept being reported as old palette
         after Asaf had said to keep them. Ask the nearest classed ancestor. */
      cl = (typeof el.className === 'string' ? el.className : '');
      var owner = cl ? el : (el.closest ? el.closest('[class]') : null);
      var ocl = owner ? (typeof owner.className === 'string' ? owner.className
                        : (owner.className && owner.className.baseVal) || '') : '';
      if (SKIP.test(cl) || SKIP.test(ocl)) continue;
      if (!cl) cl = ocl;
      if ((el.textContent || '').trim() === 'DEV') continue;

      /* Read the element's own text once, before any check, because a legend
         swatch has to be skipped by the PALETTE check too and not only the
         contrast one - the colour of a ● is the information.

         "● קלוריות" was split in the app so the dot keeps the series colour
         and the label takes the ink, which is the only way a key can both key
         and be read. What is left here is a bare ●, ––, ▪ or a box-drawing
         rule, and asking whether it is readable text asks the wrong question:
         it is a graphical key, and its colour must match the line it stands
         for. Asaf's rule - colour stays where it carries meaning - is exactly
         this case. */
      var own_t = '';
      for (var m = 0; m < el.childNodes.length; m++)
        if (el.childNodes[m].nodeType === 3) own_t += el.childNodes[m].nodeValue;
      own_t = own_t.trim();
      var isMark = own_t && /^[●○■□–—•·─-╿\s]+$/.test(own_t);
      if (isMark) continue;

      if (cs.backgroundColor === 'rgb(255, 255, 255)' && r.width > 40 && r.height > 20)
        white.push(cl.slice(0, 22) || el.tagName.toLowerCase());

      /* A BORDER COLOUR ON AN ELEMENT WITH NO BORDER IS NOT A COLOUR.
         border-color defaults to currentColor, so getComputedStyle answers
         with the TEXT colour for every element that never set a border - and
         the check then reported eight calorie figures as an old-palette
         border. Ask the width first. Same for a stroke: an SVG with
         stroke:none still answers a colour. */
      var bw = parseFloat(cs.borderTopWidth) || parseFloat(cs.borderInlineStartWidth) || 0;
      var borderOld = bw > 0 && (OLD.test(cs.borderTopColor) || OLD.test(cs.borderInlineStartColor || ''));
      var strokeOld = cs.stroke && cs.stroke !== 'none' && OLD.test(cs.stroke);
      if (OLD.test(cs.backgroundColor) || OLD_TEXT.test(cs.color) ||
          OLD.test(cs.backgroundImage || '') || borderOld || strokeOld)
        old.push((cl.slice(0, 22) || el.tagName.toLowerCase()) + ' «' + (el.textContent || '').trim().slice(0, 10) + '»');

      var t = '';
      for (var n = 0; n < el.childNodes.length; n++) if (el.childNodes[n].nodeType === 3) t += el.childNodes[n].nodeValue;
      t = t.trim(); if (!t) continue;
      var fg = P(cs.color); if (!fg) continue;
      backdropUnsure = false;
      var bg = behind(el); if (!bg) continue;
      var worst = 999; bg.forEach(function (b) { var x = R(fg, b); if (x < worst) worst = x; });
      /* LARGE TEXT HAS A LOWER FLOOR, AND MEASURING IT AGAINST 4.5 REPORTS A
         PASS AS A FAILURE. The avatar initials are 23px at weight 800 - large
         text, floor 3:1 - and they cleared it at 4.03 and 4.47 while this
         file kept naming them. A check that reports things that are fine is
         a check that gets skimmed. 18.66px bold or 24px plain, per WCAG. */
      var fsz = parseFloat(cs.fontSize) || 0, fw = parseInt(cs.fontWeight, 10) || 400;
      var floor = (fsz >= 24 || (fsz >= 18.66 && fw >= 700)) ? 3 : 4.5;
      if (worst < floor) {
        var row = { r: Math.round(worst * 100) / 100, t: t.slice(0, 18), cls: cl.slice(0, 18) };
        if (backdropUnsure) { row.uncertain = true; unsure.push(row); }
        else low.push(row);
      }
    }
    /* TEXT THAT DOES NOT FIT.
       Everything above asks about colour, and colour is language-independent
       - which is why the German and Arabic sweeps kept coming back clean and
       proving nothing new. What language actually breaks is WIDTH:
       "Trainingsvolumen" where Hebrew had "נפח", and Arabic running the other
       way. A word that overflows its box is not a contrast problem and no
       amount of sweeping for colour would ever see it.

       scrollWidth past clientWidth is the browser saying the content is wider
       than the box. Only counted where the overflow is hidden or visible -
       a box that scrolls is meant to. */
    /* scrollWidth was the wrong instrument, twice over: a child's overflow
       raises its parent's, so .jrnl-head echoed its two arrows, and a
       one-glyph button reports its font's advance as if it were content.

       The question is narrower than the box tree - does THIS text fit in THIS
       box - so measure the text. A Range around an element's own text nodes
       gives the width the glyphs actually take, and comparing that to the
       content box answers it directly, with no echo and no font metrics. */
    var over = [];
    for (i = 0; i < all.length; i++) {
      el = all[i]; r = el.getBoundingClientRect();
      if (r.width < 8 || r.height < 6) continue;
      if (r.right < 0 || r.left > innerWidth || r.bottom < 0 || r.top > innerHeight) continue;
      cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      if (cs.overflowX === 'auto' || cs.overflowX === 'scroll') continue;
      var direct = '';
      for (var q = 0; q < el.childNodes.length; q++)
        if (el.childNodes[q].nodeType === 3) direct += el.childNodes[q].nodeValue;
      if (!direct.trim() || direct.trim().length <= 2) continue;
      var rng;
      try {
        rng = document.createRange();
        rng.selectNodeContents(el);
      } catch (e) { continue; }
      var tw = 0, rects = rng.getClientRects();
      for (var z = 0; z < rects.length; z++) if (rects[z].width > tw) tw = rects[z].width;
      var box = el.clientWidth;
      if (!box) continue;
      var slop = Math.round(tw - box);
      /* IS ANYTHING ACTUALLY LOST? Wider than its box is not the question;
         the habit grid's month labels sit in 10px anchors with overflow
         visible and paint symmetrically over their columns, which is the
         layout working. What matters is text that gets CUT - and that needs
         an ancestor that clips. The chart's target label had one (the svg is
         overflow:hidden) and lost its last digit; these have none and lose
         nothing. */
      /* AN ELLIPSIS IS THE HANDLING, NOT THE DEFECT. A row that declares
         text-overflow:ellipsis with nowrap is saying "a long name gets cut
         and shows a …", which is a decision, not an accident. .fdb-rn on the
         food search is exactly that, and it was reported for overflowing its
         own box by 3px - which is the ellipsis doing its job. The chart label
         this check was written for had no ellipsis and simply lost its last
         digit; that distinction is the whole difference.

         AND WHAT THIS CHECK CANNOT SEE, written down so nobody re-discovers
         it: it measures the ELEMENT's rect, not the text's. A block child of
         an overflow:hidden box fills that box exactly, so its rect always
         fits while its text is cut - and the check says nothing. Planted and
         confirmed: an inline-block whose own rect is wider is caught at 96px,
         the same string in a plain div is not caught at all. What would find
         the second is a Range over the text nodes, which is a different and
         slower instrument. */
      if (cs.textOverflow === 'ellipsis' && /nowrap/.test(cs.whiteSpace)) continue;
      var clipper = null, up = el;
      for (var cd = 0; cd < 4 && up && up !== document.documentElement; cd++) {
        var ucs = getComputedStyle(up);
        if (/hidden|clip/.test(ucs.overflowX)) { clipper = up; break; }
        up = up.parentElement;
      }
      if (!clipper) continue;
      /* When the element IS the clipper, its own rect is the box and
         comparing them always agrees - which is how the first version of this
         test stopped catching the planted box it was written for. There, the
         text width against the box is already the answer; only when the
         clipper is an ANCESTOR is there a second rect to compare. */
      if (clipper !== el) {
        var clipR = clipper.getBoundingClientRect();
        if (r.right <= clipR.right + 1 && r.left >= clipR.left - 1) continue;
      }

      if (slop > 2) over.push({ by: slop, kind: 'text past its box',
        cls: (typeof el.className === 'string' ? el.className : '').slice(0, 20) || el.tagName.toLowerCase(),
        t: direct.trim().slice(0, 18) });

      /* AND THE OTHER QUESTION, which the first one cannot see. A label that
         sizes itself to its content never overflows its OWN box - it just
         grows, and spills out of its parent. That is the German macro column:
         "Kohlenhydrate" is 90px inside a 74px column, and measuring the label
         against itself reports nothing.

         So also ask whether the element sticks out of the box that contains
         it. Two different failures, and each is invisible to the other's
         instrument. */
      var par = el.parentElement;
      if (par && par !== document.body) {
        var pcs2 = getComputedStyle(par);
        /* and the same test here: a parent that does not clip is not losing
           anything, however much its child sticks out of it */
        if (/hidden|clip/.test(pcs2.overflowX) && pcs2.display !== 'contents') {
          var pr = par.getBoundingClientRect();
          var padL = parseFloat(pcs2.paddingLeft) || 0, padR = parseFloat(pcs2.paddingRight) || 0;
          var spill = Math.round(Math.max((pr.left + padL) - r.left, r.right - (pr.right - padR)));
          if (spill > 2 && pr.width > 8)
            over.push({ by: spill, kind: 'wider than its parent',
              cls: (typeof el.className === 'string' ? el.className : '').slice(0, 20) || el.tagName.toLowerCase(),
              t: direct.trim().slice(0, 18) });
        }
      }
    }
    over.sort(function (a, b) { return b.by - a.by; });

    function uniq(a) { var s = {}, u = []; a.forEach(function (x) { if (!s[x]) { s[x] = 1; u.push(x); } }); return u; }
    low.sort(function (a, b) { return a.r - b.r; });
    return {
      mods: [].slice.call(document.body.classList).filter(function (c) { return c.indexOf('mod-') === 0; }),
      white: uniq(white),
      old: uniq(old).slice(0, 8),
      low: low.slice(0, 8),
      unsure: unsure.slice(0, 6),
      over: over.slice(0, 6),
      clean: !white.length && !old.length && !low.length && !over.length
    };
  };

  /* EVERY SCREEN, NOT THE ONES I HAPPENED TO THINK OF.
     Six findings tonight were on screens reached by a click I nearly did not
     make - the history tab, the exercise sheet, the profile chips. So this
     opens each control on a screen in turn, sweeps what appears, and comes
     back.

     WHAT IT REFUSES TO PRESS, and this list is the whole safety of it: a
     control whose handler looks like it deletes, clears, resets, exports,
     shares, sends, subscribes, asks for a permission, or leaves the module.
     Everything it does press writes only into the dev sandbox, which is
     namespaced away from her data - but a sheet that fires a push or a share
     is not sandboxed by anything, so those are never touched.

     Nothing here is a substitute for walking the real path on a screen that
     matters. It is how the screens that matter get FOUND. */
  var UNSAFE = /delete|remove|clear|reset|wipe|export|share|send|subscri|permission|Ask\(|confirm|signout|logout|goHome|purchase|buy/i;

  /* A time budget, because the evaluation that calls this is cut off at 45
     seconds and a crawl that is killed returns nothing at all - not even the
     findings it already had. It stops itself at 30 and says where it got to,
     so the caller can pick up from there. */
  window.__crawl = async function (limit, budgetMs, from) {
    var deadline = Date.now() + (budgetMs || 30000);
    var start = from || 0;
    var root = location.href, found = [], pressed = 0;
    var controls = [].slice.call(document.querySelectorAll('button,[onclick],[role=button]'))
      .filter(function (b) {
        var r = b.getBoundingClientRect();
        if (r.width < 18 || r.height < 14) return false;
        var oc = b.getAttribute('onclick') || '';
        if (UNSAFE.test(oc)) return false;
        if (/tb\b|tabbar|home-menu|hdr-home/.test((typeof b.className === 'string' ? b.className : ''))) return false;
        return true;
      });
    var labels = controls.map(function (b) {
      return ((b.textContent || '').trim().slice(0, 18) || (b.getAttribute('onclick') || '').slice(0, 22));
    });
    for (var i = start; i < controls.length && pressed < (limit || 14); i++) {
      if (Date.now() > deadline)
        return { pressed: pressed, offered: labels.length, findings: found,
                 stoppedBecause: 'out of time at control ' + i, resumeFrom: i };
      var before = document.getElementById('content');
      var html = before ? before.innerHTML.length : 0;
      try { controls[i].click(); } catch (e) { continue; }
      await new Promise(function (r) { setTimeout(r, 1100); });
      var after = document.getElementById('content');
      /* only sweep if something actually changed - otherwise it is the same
         screen again and the finding would be a duplicate */
      if (after && Math.abs(after.innerHTML.length - html) < 40) continue;
      pressed++;
      /* LOOK CHEAPLY FIRST. A full __sweep scrolls up to 24 folds with a
         260ms settle on each, and the screen it lands on is often a sheet
         whose scrollHeight is the whole document behind it - so one press
         could cost minutes. A crawl of twenty controls then never finishes,
         and an unfinished crawl reports nothing at all: the 150-second run
         that motivated this pressed ONE control of twenty-seven.

         So: one viewport scan per press, which is milliseconds, and the full
         sweep only when that first look is not clean. The screens this is
         walking are mostly clean now, so the expensive read is the exception
         rather than the rule. A finding that sits below the first fold still
         gets a full sweep, because the viewport scan that found its
         neighbours triggers one. What is genuinely lost is a screen whose
         ONLY defect is below the fold - recorded here rather than hidden,
         and __sweep is still the tool to point at a named screen. */
      var quick = window.__scan();
      var res = quick.clean === false || quick.blind ? await window.__sweep() : quick;
      if (!res.clean) found.push({ via: labels[i], white: res.white, old: res.old, low: res.low });
      /* Back to where we started. NOT history.back(): this is one page, and
         the first version of this walked the browser straight out of the app
         mid-crawl. Press the sheet's own close control, which is the path a
         person has; if there is none, stop and say so rather than guess. */
      var closer = [].slice.call(document.querySelectorAll('button,[onclick]')).filter(function (b) {
        var r = b.getBoundingClientRect(); if (r.width < 10) return false;
        var oc = b.getAttribute('onclick') || '', tx = (b.textContent || '').trim();
        return /close|Back|back\(|\bcancel/i.test(oc) || tx === '×' || tx === '✕' || tx === '‹';
      })[0];
      if (closer) { try { closer.click(); } catch (e) {} }
      await new Promise(function (r) { setTimeout(r, 900); });

      if (location.href !== root) return { pressed: pressed, offered: labels.length, findings: found, stoppedBecause: 'the page navigated' };
      var stillHere = document.getElementById('content');
      if (!stillHere) return { pressed: pressed, offered: labels.length, findings: found, stoppedBecause: 'no content element' };

      controls = [].slice.call(document.querySelectorAll('button,[onclick],[role=button]'))
        .filter(function (b) {
          var r = b.getBoundingClientRect();
          if (r.width < 18 || r.height < 14) return false;
          var oc = b.getAttribute('onclick') || '';
          return !UNSAFE.test(oc);
        });
    }
    return { pressed: pressed, offered: labels.length, findings: found };
  };

  /* __scan() only sees the viewport, which means it only ever answered for
     the top of a screen. Most screens here are two or three folds long, and
     the profile tab's chips - the thing that was most wrong - sit below the
     first one. __sweep() scrolls the whole height and merges, so a screen
     called clean has actually been looked at.

     THE SEVENTH TIME THIS INSTRUMENT LIED. It reported a clean exercise sheet
     while a green banner and a violet chart were plainly on the screenshot.
     They were not on the screen it swept: something re-rendered fitness
     between the click and the scroll, the sheet closed, and the sweep read
     the hub underneath. The blind guard could not catch it, because the hub
     is a perfectly good screen - it is just not the one I asked about.

     So a sweep now says WHAT IT LOOKED AT. Pass the selector the screen is
     supposed to contain and `expected` comes back true or false; a false is a
     sweep that answered about somewhere else, and "clean" from it means
     nothing. The caller has to name the screen, which is the point: an
     instrument that cannot be wrong about its subject cannot be asked one. */
  window.__sweep = async function (expect) {
    var h = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    var step = Math.max(200, innerHeight - 80), y = 0, all = [], guard = 0;
    while (y < h + step && guard++ < 24) {
      window.scrollTo(0, y);
      await new Promise(function (r) { setTimeout(r, 260); });
      var one = window.__scan();
      if (one.blind) { window.scrollTo(0, 0); return one; }   /* do not average a blind read in */
      all.push(one);
      y += step;
    }
    window.scrollTo(0, 0);
    function merge(k) {
      var s = {}, u = [];
      all.forEach(function (o) { o[k].forEach(function (x) { var t = JSON.stringify(x); if (!s[t]) { s[t] = 1; u.push(x); } }); });
      return u;
    }
    var white = merge('white'), old = merge('old'), low = merge('low'), over = merge('over'), unsure = merge('unsure');
    low.sort(function (a, b) { return a.r - b.r; });
    over.sort(function (a, b) { return b.by - a.by; });
    /* Did the screen I was asked about survive the scroll? Checked AFTER, not
       before: the failure this is written for is a sheet that was there when
       the click landed and gone when the sweep read it. */
    var expected = expect ? !!document.querySelector(expect) : null;
    return {
      mods: all[0].mods, folds: all.length, height: h, expect: expect || null, expected: expected,
      white: white, old: old.slice(0, 10), low: low.slice(0, 10), over: over.slice(0, 8), unsure: unsure.slice(0, 8),
      clean: expected === false ? false
           : !white.length && !old.length && !low.length && !over.length
    };
  };
})();
