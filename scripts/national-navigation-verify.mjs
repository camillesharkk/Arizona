import assert from 'node:assert/strict';
import { testLoader } from './pack-test-utils.mjs';

const { resolveState, pathState } = testLoader()('lib/site-state.ts');
for (const saved of ['AZ', 'PA', 'CA', 'CT', null]) {
  assert.equal(resolveState('/', saved), null, 'The national home always uses the national brand');
  assert.equal(resolveState('/?from=state', saved), null);
  assert.equal(resolveState('/#states', saved), null);
}
assert.equal(resolveState('/pennsylvania/', 'AZ'), 'PA');
assert.equal(resolveState('/arizona-notary-exam/', 'PA'), 'AZ');
assert.equal(resolveState('/contact/', 'PA'), 'PA', 'Shared help retains the saved state');
assert.equal(pathState('/california/practice/'), 'CA');
console.log('National navigation verification passed');

let pathname = '/';
let reducedMotion = false;
let cleanup;
const visited = { current: new Set() };
const animations = [];
const element = { animate: (frames, options) => { animations.push({ frames, options }); return { cancel() {} }; } };
const main = { ...element, firstElementChild: element, querySelectorAll: () => [] };
const loadMotion = testLoader({
  react: { useRef: () => visited, useEffect: (effect) => { cleanup = effect(); } },
  'next/navigation': { usePathname: () => pathname },
}, {
  window: { matchMedia: () => ({ matches: reducedMotion }) },
  document: { querySelector: () => main },
});
const { EntryMotion } = loadMotion('components/EntryMotion.tsx');
EntryMotion();
assert.equal(animations.length, 1);
assert.equal(animations[0].options.duration, 220);
assert.ok(animations[0].frames.every(frame => frame.opacity > 0), 'Entry content remains readable');
cleanup();
EntryMotion();
assert.equal(animations.length, 1, 'Returning to the same route does not replay entry');
pathname = '/daily-study/';
EntryMotion();
assert.equal(animations[1].options.duration, 160);
pathname = '/contact/';
reducedMotion = true;
EntryMotion();
assert.equal(animations.length, 2, 'Reduced motion skips entry animations');
console.log('Entry motion hydration-safe DOM, route replay and reduced-motion checks passed');

let onPreferenceChange;
let onIntersection;
let cancelled = 0;
let disconnected = false;
const motionPreference = {
  matches: false,
  addEventListener: (_event, listener) => { onPreferenceChange = listener; },
  removeEventListener() {},
};
const animatedElement = { animate: () => { animations.push('live'); return { cancel: () => { cancelled++; } }; } };
class MotionObserver {
  constructor(callback) { onIntersection = callback; }
  observe() {}
  unobserve() {}
  disconnect() { disconnected = true; }
}
const liveMotion = testLoader({
  react: { useRef: () => ({ current: new Set() }), useEffect: effect => effect() },
  'next/navigation': { usePathname: () => '/live-motion/' },
}, {
  window: { matchMedia: () => motionPreference, IntersectionObserver: MotionObserver },
  IntersectionObserver: MotionObserver,
  document: { querySelector: () => ({ firstElementChild: animatedElement, querySelectorAll: () => [animatedElement] }) },
})('components/EntryMotion.tsx');
liveMotion.EntryMotion();
motionPreference.matches = true;
onPreferenceChange?.();
assert.ok(cancelled > 0 && disconnected, 'Enabling reduced motion cancels animations and disconnects the observer');
const countBeforeLateCallback = animations.length;
onIntersection([{ isIntersecting: true, target: animatedElement }]);
assert.equal(animations.length, countBeforeLateCallback, 'Late intersection callbacks respect reduced motion');
console.log('Live reduced-motion preference changes passed');

const heroAnimations = [];
const heroItems = Array.from({ length: 5 }, () => ({ animate: (frames, options) => { heroAnimations.push({ frames, options }); return { cancel() {} }; } }));
const homeMotion = testLoader({
  react: { useRef: () => ({ current: new Set() }), useEffect: effect => effect() },
  'next/navigation': { usePathname: () => '/' },
}, {
  window: { matchMedia: () => ({ matches: false }) },
  document: { querySelector: () => ({ firstElementChild: heroItems[0], querySelectorAll: selector => selector === '[data-home-enter]' ? heroItems : [] }) },
})('components/EntryMotion.tsx');
homeMotion.EntryMotion();
assert.equal(heroAnimations.length, 5, 'Home entry animates individual hero items once');
assert.ok(heroAnimations.every(item => item.options.duration === 500 && item.frames[0].opacity > 0));
assert.deepEqual(heroAnimations.map(item => item.options.delay), [0, 75, 150, 225, 300]);
console.log('Home stagger remains readable and completes within 800ms');
