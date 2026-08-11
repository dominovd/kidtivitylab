/**
 * Activity Finder island — vanilla JS, no framework.
 * - Single-select per facet (tap again to clear); age is the primary facet.
 * - Live results, URL-synced state (?age=3-year-olds&place=home...).
 * - Never shows zero results: relaxes the least important facet
 *   (materials → time → place) and says so.
 */

const AGE_GROUPS = {
  baby: { min: 0, max: 11, label: 'babies' },
  '1-year-olds': { min: 12, max: 23, label: '1 year olds' },
  '2-year-olds': { min: 24, max: 35, label: '2 year olds' },
  '3-year-olds': { min: 36, max: 47, label: '3 year olds' },
  '4-year-olds': { min: 48, max: 59, label: '4 year olds' },
  '5-year-olds': { min: 60, max: 71, label: '5 year olds' },
  '6-7-year-olds': { min: 72, max: 95, label: '6–7 year olds' },
  '8-10-year-olds': { min: 96, max: 131, label: '8–10 year olds' },
};

const TIME_LABELS = { 10: '10 min', 30: '30 min', 45: '45+ min' };
const MATERIAL_LABELS = {
  none: 'Nothing needed',
  paper: 'Paper & pencils',
  household: 'Household items',
  craft: 'Craft supplies',
};
const RELAX_ORDER = ['materials', 'time', 'place'];
const RELAX_NAMES = { materials: 'materials', time: 'time', place: 'place' };

const state = { age: null, place: null, time: null, materials: null };
let activities = [];

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

function ageLabel(a) {
  const lo = Math.floor(a.age_min / 12);
  const hi = Math.floor(a.age_max / 12);
  if (a.age_max < 24) return a.age_min < 12 ? `${a.age_min}–${a.age_max} mo` : 'Ages 1–2';
  return lo === hi ? `Age ${lo}` : `Ages ${lo}–${hi}`;
}

function matches(a, s) {
  if (s.age) {
    const g = AGE_GROUPS[s.age];
    if (!g || a.age_min > g.max || a.age_max < g.min) return false;
  }
  if (s.place && !a.place.includes(s.place)) return false;
  if (s.time && a.time_minutes !== s.time) return false;
  if (s.materials && a.materials !== s.materials) return false;
  return true;
}

/** Filter with graceful relaxation — returns {list, relaxedFacet|null}. */
function filterActivities() {
  let list = activities.filter((a) => matches(a, state));
  if (list.length > 0) return { list, relaxedFacet: null };
  for (const facet of RELAX_ORDER) {
    if (!state[facet]) continue;
    const relaxed = { ...state, [facet]: null };
    list = activities.filter((a) => matches(a, relaxed));
    if (list.length > 0) return { list, relaxedFacet: facet };
  }
  return { list: activities.slice(), relaxedFacet: 'all' };
}

function cardHTML(a) {
  const goal = a.goals?.[0] || 'play';
  const art = goal === 'energy' ? '↗' : goal === 'calm' ? '☁' : goal === 'stem' ? '✦' : goal === 'creative' ? '✎' : '♡';
  const img = a.image
    ? `<img class="activity-image" src="${a.image}" alt="${a.image_alt || a.title}" width="640" height="400" loading="lazy">`
    : `<div class="activity-art art-${goal}" aria-hidden="true"><span>${art}</span></div>`;
  return `<article class="card activity-card">
    <a href="/activities/${a.id}/">
      ${img}
      <div class="activity-card-body">
        <h3>${a.title}</h3>
        <p class="muted activity-hook">${a.hook}</p>
        <div class="badges-row">
          <span class="badge badge-age">${ageLabel(a)}</span>
          <span class="badge badge-time">⏱ ${TIME_LABELS[a.time_minutes]}</span>
          <span class="badge badge-materials">${MATERIAL_LABELS[a.materials]}</span>
        </div>
      </div>
    </a>
  </article>`;
}

function render() {
  const { list, relaxedFacet } = filterActivities();
  const visible = [...list]
    .sort((a, b) => Number(Boolean(b.image)) - Number(Boolean(a.image)))
    .slice(0, 6);
  const results = $('[data-results]');
  const count = $('[data-count]');
  const relaxedNote = $('[data-relaxed]');
  const heading = $('[data-results-heading]');

  if (results) results.innerHTML = visible.map(cardHTML).join('');
  if (count) {
    const n = list.length;
    count.textContent = `${n} ${n === 1 ? 'activity matches' : 'activities match'} ✨`;
  }
  if (heading) {
    heading.textContent = state.age
      ? `Perfect for ${AGE_GROUPS[state.age].label}`
      : 'Ideas for today';
  }
  if (relaxedNote) {
    if (relaxedFacet && relaxedFacet !== 'all') {
      relaxedNote.hidden = false;
      relaxedNote.textContent = `Nothing matched every filter, so we loosened “${RELAX_NAMES[relaxedFacet]}” — here's what's close:`;
    } else if (relaxedFacet === 'all') {
      relaxedNote.hidden = false;
      relaxedNote.textContent = 'Nothing matched — here are all our ideas instead:';
    } else {
      relaxedNote.hidden = true;
    }
  }
}

function syncURL() {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(state)) if (v) params.set(k, v);
  const qs = params.toString();
  history.replaceState(null, '', qs ? `?${qs}` : location.pathname);
}

function syncChips() {
  for (const row of $$('[data-facet]')) {
    const facet = row.dataset.facet;
    for (const chip of $$('.chip', row)) {
      chip.setAttribute('aria-pressed', String(state[facet] === chip.dataset.value));
    }
  }
}

function readURL() {
  const params = new URLSearchParams(location.search);
  if (params.size === 0) state.age = '3-year-olds';
  for (const k of Object.keys(state)) {
    const v = params.get(k);
    if (v) state[k] = v;
  }
}

function surprise() {
  const { list } = filterActivities();
  if (!list.length) return;
  const pick = list[Math.floor(Math.random() * list.length)];
  location.href = `/activities/${pick.id}/`;
}

async function init() {
  const finder = $('#finder');
  if (!finder) return;

  const res = await fetch('/activities.json');
  activities = await res.json();

  readURL();
  syncChips();
  render();

  finder.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    const facet = chip.closest('[data-facet]')?.dataset.facet;
    if (!facet) return;
    state[facet] = state[facet] === chip.dataset.value ? null : chip.dataset.value;
    syncChips();
    syncURL();
    render();
  });

  for (const btn of $$('[data-surprise]')) {
    btn.addEventListener('click', (e) => {
      if (activities.length) {
        e.preventDefault();
        surprise();
      }
    });
  }
}

init();
