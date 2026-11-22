import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const listeners = {};
const context = {
  Date, Intl, Number,
  clearTimeout() {},
  setTimeout() { throw new Error('A page without a daily feature must not start a refresh timer.'); },
  window: { addEventListener(type, callback) { listeners[type] = callback; } },
  document: { documentElement: { dataset: {} }, querySelectorAll() { return []; }, addEventListener(type, callback) { listeners[type] = callback; } }
};
vm.runInNewContext(fs.readFileSync('ohgs-daily-flyers.js', 'utf8'), context);
const choose = context.window.OHGSDailyFlyers.selectionForDate;
const cases = [
  ['2026-11-19T20:59:59.999Z', 'plant', '2026-11-19'],
  ['2026-11-19T21:00:00.000Z', 'friday', '2026-11-20'],
  ['2026-11-20T20:59:59.999Z', 'friday', '2026-11-20'],
  ['2026-11-20T21:00:00.000Z', 'plant', '2026-11-21'],
  ['2026-11-26T21:00:00.000Z', 'friday', '2026-11-27'],
  ['2026-11-27T21:00:00.000Z', 'plant', '2026-11-28'],
  ['2027-12-30T21:00:00.000Z', 'friday', '2027-12-31'],
  ['2027-12-31T21:00:00.000Z', 'plant', '2028-01-01']
];
for (const [date, campaign, day] of cases) {
  const result = choose(date);
  assert.equal(result.campaign, campaign, date);
  assert.equal(result.date, day, date);
  assert.equal(result.timezone, 'Africa/Dar_es_Salaam');
}
for (let day = 16; day <= 29; day++) {
  const date = new Date(`2026-11-${day}T12:00:00Z`);
  assert.equal(choose(date).campaign, date.getUTCDay() === 5 ? 'friday' : 'plant');
}
assert.throws(() => choose('invalid'), /valid date/);
for (const event of ['ohgs:languagechange', 'pageshow', 'visibilitychange']) assert.equal(typeof listeners[event], 'function');

for (const name of fs.readdirSync('.').filter(name => name.endsWith('.html') && name !== 'deploy-test.html')) {
  const html = fs.readFileSync(name, 'utf8');
  assert.equal((html.match(/data-daily-flyer(?:\s|>)/g) || []).length, 1, `${name}: daily feature count`);
  assert.equal((html.match(/ohgs-daily-flyers\.js\?v=v46-video-recovery/g) || []).length, 1, `${name}: current daily controller`);
  assert.ok(html.includes('template data-friday-content'), `${name}: Friday stays inert until its day`);
  assert.ok(html.includes('data-active-flyer="plant"'), `${name}: evergreen fallback`);
  for (const list of html.matchAll(/<source\b[^>]*srcset="([^"]+)"/g)) {
    for (const item of list[1].split(',')) assert.ok(fs.existsSync(item.trim().split(/\s+/)[0]), `${name}: missing picture source`);
  }
}
const plant = fs.readFileSync('product-compact-concrete-batching-plant.html', 'utf8');
for (const detail of ['4 square bins', 'Quick installation', 'High structural strength', 'production capacity', 'power supply', '0689 528 193']) assert.ok(plant.includes(detail), `Plant detail: ${detail}`);
assert.ok(!/\b(?:m³\/h|m3\/h|\d+\s*kW|TSh\s*[\d,]+)\b/i.test(plant), 'Do not invent plant performance or price.');
const promo = fs.readFileSync('promotions.html', 'utf8');
assert.ok(!promo.includes('poster-awesome-friday') && !promo.includes('poster-satisfactory-saturday'), 'Promotions must not show unrelated weekday flyers.');
console.log('Daily flyer QA passed: 14 calendar days, Tanzania midnight boundaries, next Friday, year rollover, language/return events, inert Friday assets, all public pages and plant details.');
