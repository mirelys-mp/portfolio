// ---------- start screen ----------
const startScreen = document.getElementById('start');
let closing = false;
document.body.classList.add('locked');

// little 3-note "game start" jingle
function playStart() {
  beep(500, 600, 0.1);
  setTimeout(() => beep(650, 800, 0.1), 110);
  setTimeout(() => beep(800, 1200, 0.2), 220);
}

function closeStart() {
  if (closing) return;
  closing = true;
  playStart();
  window.scrollTo(0, 0);
  startScreen.classList.add('hide');
  document.body.classList.remove('locked');
  document.removeEventListener('keydown', startKey, true);
  setTimeout(() => startScreen.remove(), 700);
  typeLine();
}

function startKey(e) {
  e.stopImmediatePropagation(); // keeps the panda game from starting behind the screen
  if (e.code === 'Enter' || e.code === 'Space') {
    e.preventDefault();
    closeStart();
  }
}

document.addEventListener('keydown', startKey, true);
startScreen.addEventListener('click', closeStart);


// ---------- sparkle trail ----------
const sparkles = ['✿', '♥', '★'];
const colors = ['#ff9ec4', '#7fcf9c', '#ffc2d9'];
let lastSpark = 0;

document.addEventListener('mousemove', e => {
  const now = performance.now();
  if (now - lastSpark < 60) return;   // lower number = denser trail
  lastSpark = now;

  const s = document.createElement('span');
  s.className = 'spark';
  s.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];
  s.style.left = e.clientX + 'px';
  s.style.top = e.clientY + 'px';
  s.style.color = colors[Math.floor(Math.random() * colors.length)];
  document.body.appendChild(s);
  setTimeout(() => s.remove(), 700);
});

// ---------- photo carousel (3 at a time) ----------
(() => {
  const track = document.getElementById('car-track');
  if (!track) return;
  const snaps = track.querySelectorAll('.snap');
  const count = document.getElementById('car-count');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const gap  = () => parseFloat(getComputedStyle(track).columnGap) || 22;
  const per  = () => parseInt(getComputedStyle(track).getPropertyValue('--per')) || 3;
  const step = () => snaps[0].offsetWidth + gap();
  const first = () => Math.round(track.scrollLeft / step());
  const atEnd = () => track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
  const behavior = () => (reduce ? 'auto' : 'smooth');

  function next() {
    if (atEnd()) track.scrollTo({ left: 0, behavior: behavior() });
    else track.scrollTo({ left: (first() + 1) * step(), behavior: behavior() });
  }
  function prev() {
    if (track.scrollLeft <= 4) track.scrollTo({ left: track.scrollWidth, behavior: behavior() });
    else track.scrollTo({ left: (first() - 1) * step(), behavior: behavior() });
  }

  function updateCount() {
    const a = first() + 1;
    const b = Math.min(first() + per(), snaps.length);
    count.textContent = a + '–' + b + ' / ' + snaps.length;
  }

  document.getElementById('car-prev').addEventListener('click', prev);
  document.getElementById('car-next').addEventListener('click', next);
  track.addEventListener('scroll', updateCount);
  window.addEventListener('resize', updateCount);
  track.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  { e.preventDefault(); prev(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
  });
  updateCount();
})();