/* Daily artwork follows the OHGS showroom's Tanzania calendar, not the visitor's timezone. */
(function () {
  'use strict';
  var ZONE = 'Africa/Dar_es_Salaam';
  var DAY = 86400000;
  var EAT = 10800000;
  var timer;
  document.documentElement.dataset.ohgsDailyRelease = 'v46-video-recovery';
  function selectionForDate(value) {
    var date = value instanceof Date ? value : new Date(value);
    if (!Number.isFinite(date.getTime())) throw new RangeError('A valid date is required.');
    var local = new Date(date.getTime() + EAT);
    var weekday = local.getUTCDay();
    // Tanzania has UTC+3 throughout the year. This also works when Intl is unavailable.
    return { campaign: weekday === 5 ? 'friday' : 'plant', date: local.toISOString().slice(0, 10), weekday: weekday, timezone: ZONE };
  }
  function labels(date) {
    try {
      return {
        en: new Intl.DateTimeFormat('en-GB', { timeZone: ZONE, weekday: 'long', day: 'numeric', month: 'long' }).format(date),
        sw: new Intl.DateTimeFormat('sw-TZ', { timeZone: ZONE, weekday: 'long', day: 'numeric', month: 'long' }).format(date)
      };
    } catch (error) {
      var choice = selectionForDate(date);
      return { en: choice.date, sw: choice.date };
    }
  }
  var roots = Array.prototype.slice.call(document.querySelectorAll('[data-daily-flyer]'));
  var records = roots.map(function (root) {
    var slot = root.querySelector('[data-daily-content]');
    var template = root.querySelector('template[data-friday-content]');
    return { root: root, slot: slot, friday: template, plant: slot ? slot.cloneNode(true) : null, current: 'plant' };
  });
  function localize(scope) {
    var sw = document.documentElement.lang === 'sw';
    scope.querySelectorAll('[data-en][data-sw]').forEach(function (el) {
      el.textContent = el.getAttribute(sw ? 'data-sw' : 'data-en');
    });
    scope.querySelectorAll('a[data-order-text-sw][data-order-text-en]').forEach(function (el) {
      el.href = 'https://wa.me/255689528193?text=' + encodeURIComponent(el.getAttribute(sw ? 'data-order-text-sw' : 'data-order-text-en'));
    });
    scope.querySelectorAll('[data-daily-view]').forEach(function (el) {
      el.setAttribute('aria-label', sw ? 'Fungua tangazo kwa ukubwa kamili' : 'Open flyer at full size');
    });
  }
  function refresh() {
    clearTimeout(timer);
    var now = new Date();
    var choice = selectionForDate(now);
    var dateLabels = labels(now);
    records.forEach(function (record) {
      if (!record.slot || !record.plant) return;
      if (record.current !== choice.campaign) {
        var source = choice.campaign === 'friday' && record.friday ? record.friday.content : record.plant;
        record.slot.replaceChildren.apply(record.slot, Array.prototype.map.call(source.childNodes, function (node) { return node.cloneNode(true); }));
        record.current = choice.campaign;
      }
      record.root.dataset.activeFlyer = choice.campaign;
      record.root.dataset.tanzaniaDate = choice.date;
      var time = record.root.querySelector('time[data-tanzania-date]');
      if (time) {
        time.dateTime = choice.date;
        time.dataset.en = dateLabels.en;
        time.dataset.sw = dateLabels.sw;
        time.parentElement.hidden = false;
      }
      localize(record.root);
    });
    // Recheck after clock changes and at midnight; returning from a background tab refreshes immediately.
    var untilMidnight = DAY - ((now.getTime() + EAT) % DAY);
    if (records.length) timer = setTimeout(refresh, Math.min(60000, untilMidnight + 50));
  }
  window.OHGSDailyFlyers = { selectionForDate: selectionForDate };
  window.addEventListener('ohgs:languagechange', refresh);
  window.addEventListener('pageshow', refresh);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) refresh(); });
  refresh();
})();
