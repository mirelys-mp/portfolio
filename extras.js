// ---------- start screen ----------
const startScreen = document.getElementById('start');
let closing = false;
document.body.classList.add('locked');

function closeStart() {
  if (closing) return;
  closing = true;
  window.scrollTo(0, 0);   // <-- add this line
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

// ---------- badges pop in ----------
const badges = document.querySelectorAll('.badge');
badges.forEach(b => b.classList.add('pre'));
const badgeBox = document.querySelector('.badges');
const io = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) {
    badges.forEach((b, i) => setTimeout(() => b.classList.remove('pre'), i * 120));
    io.disconnect();
  }
}, { threshold: 0.3 });
io.observe(badgeBox);

// little 3-note "game start" jingle
function playStart() {
  beep(500, 600, 0.1);
  setTimeout(() => beep(650, 800, 0.1), 110);
  setTimeout(() => beep(800, 1200, 0.2), 220);
}

function closeStart() {
  if (closing) return;
  closing = true;
  playStart();             // <-- add this line
  window.scrollTo(0, 0);
  startScreen.classList.add('hide');
  document.body.classList.remove('locked');
  document.removeEventListener('keydown', startKey, true);
  setTimeout(() => startScreen.remove(), 700);
  typeLine();
}

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