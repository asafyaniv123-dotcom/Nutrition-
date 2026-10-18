/* Beem's streak, by Asaf's rules of 18.10:
     a streak day   = a finished day summary - nothing else counts
     a missed day   = a grace day, not a reset
     where it shows = the home screen AND the end of the summary
   The grace numbers are proposals, waiting for his word: one grace day in
   hand; a second miss in a row resets; the grace comes back after seven
   summaries in a row.

   The logic is plain and pure so it can be tested on its own
   (tools/test-beem-streak.mjs) - a streak that miscounts is worse than none. */

var GRACE_REFILL = 7;

/* days: the finished days in order, each 'done' or 'miss'. Today, while its
   summary is still open, is NOT in the list - an open day never breaks
   anything; only a day that has ENDED (at 04:00) can be missed. */
function streakState(days){
  var count = 0, grace = 1, since = 0, misses = 0, graceDay = -1, lastReset = -1, best = 0;
  for (var i = 0; i < days.length; i++){
    if (days[i] === 'done'){
      count++; misses = 0; since++;
      if (grace < 1 && since >= GRACE_REFILL){ grace = 1; since = 0; }
    } else {
      misses++;
      if (count > 0 && misses === 1 && grace >= 1){ grace = 0; since = 0; graceDay = i; }
      else if (count > 0){ count = 0; grace = 1; since = 0; lastReset = i; }
    }
    if (count > best) best = count;
  }
  var last = days.length - 1;
  return {
    count: count, best: best, grace: grace,
    refillIn: grace ? 0 : GRACE_REFILL - since,
    graceYesterday: graceDay === last && last >= 0,     // the grace was spent on the day that just ended
    brokeYesterday: lastReset === last && last >= 0
  };
}

if (typeof module !== 'undefined') module.exports = {streakState: streakState, GRACE_REFILL: GRACE_REFILL};
