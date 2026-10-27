if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

const game = document.getElementById('game');
const player = document.getElementById('player');
const scoreEl = document.getElementById('score');
const hiEl = document.getElementById('hi');
const msg = document.getElementById('msg');

let running = false;
let y = 0, vy = 0;
let score = 0, speed = 5, spawnIn = 0, last = 0, milestone = 100;
let obstacles = [];
let hi = 0;

try { hi = Number(localStorage.getItem('panda-hi')) || 0; } catch (e) {}

const pad = n => String(Math.floor(n)).padStart(5, '0');
hiEl.textContent = pad(hi);

// sound effects (no files needed)
let audioCtx;
function beep(from, to, dur, type = 'square', vol = 0.08) {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, t);
    osc.frequency.exponentialRampToValueAtTime(to, t + dur);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + dur);
  } catch (e) {}
}
const playJump = () => beep(300, 700, 0.15);
const playHit = () => beep(300, 60, 0.35, 'sawtooth');
const playPoint = () => beep(800, 1200, 0.1);

function start() {
  obstacles.forEach(o => o.el.remove());
  obstacles = [];
  score = 0; speed = 5; spawnIn = 60; y = 0; vy = 0; milestone = 100;
  running = true;
  msg.style.display = 'none';
  game.classList.add('running');
  game.classList.remove('jumping');
  last = performance.now();
  requestAnimationFrame(loop);
}

function jump() {
  if (!running) { start(); return; }
  if (y === 0) {
    vy = 10.5;
    game.classList.add('jumping');
    playJump();
  }
}

function gameOver() {
  running = false;
  playHit();
  game.classList.remove('running', 'jumping');
  if (score > hi) {
    hi = score;
    hiEl.textContent = pad(hi);
    try { localStorage.setItem('panda-hi', Math.floor(hi)); } catch (e) {}
  }
  msg.textContent = 'GAME OVER - PRESS SPACE';
  msg.style.display = 'flex';
}

function spawn() {
  const el = document.createElement('div');
  el.className = 'bamboo';
  const h = 36 + Math.random() * 18;
  el.style.height = h + 'px';
  game.appendChild(el);
  obstacles.push({ el, x: game.clientWidth, h });
}

function loop(now) {
  if (!running) return;
  const dt = Math.min((now - last) / 16.67, 3);
  last = now;

  if (y > 0 || vy > 0) {
    vy -= 0.6 * dt;
    y += vy * dt;
    if (y <= 0) {
      y = 0; vy = 0;
      game.classList.remove('jumping');
    }
  }
  player.style.bottom = (8 + y) + 'px';

  spawnIn -= dt;
  if (spawnIn <= 0) {
    spawn();
    spawnIn = 55 + Math.random() * 60;
  }
  obstacles.forEach(o => {
    o.x -= speed * dt;
    o.el.style.left = o.x + 'px';
  });
  obstacles = obstacles.filter(o => {
    if (o.x < -30) { o.el.remove(); return false; }
    return true;
  });

  for (const o of obstacles) {
      if (o.x < 80 && o.x + 18 > 40 && y < o.h - 8) {
      gameOver();
      return;
    }
  }

  score += 0.12 * speed * dt;
  speed = Math.min(5 + score / 300, 11);
  scoreEl.textContent = pad(score);
  if (score >= milestone) {
    playPoint();
    milestone += 100;
  }

  requestAnimationFrame(loop);
}

function onScreen() {
  const r = game.getBoundingClientRect();
  return r.bottom > 0 && r.top < window.innerHeight;
}

document.addEventListener('keydown', e => {
  if ((e.code === 'Space' || e.code === 'ArrowUp') && onScreen()) {
    e.preventDefault();
    jump();
  }
});

game.addEventListener('pointerdown', jump);

// ---------- dialogue box ----------
const lines = [
  "Hi! I'm Mirelys Mendez Pons ♥",
  "I'm a Design student at Stanford, from Puerto Rico, studying human behavior and education.",
  "I design accessible tools and research how people learn.",
  "Scroll down to explore my projects, research, and achievements!"
];
const textEl = document.getElementById('dialogue-text');
const box = document.getElementById('dialogue');
let li = 0, timer = null, autoTimer = null, typing = false;

function typeLine() {
  clearInterval(timer);
  clearTimeout(autoTimer);
  const full = lines[li];
  let i = 0;
  typing = true;
  textEl.textContent = '';
  timer = setInterval(() => {
    i++;
    textEl.textContent = full.slice(0, i);
    if (i >= full.length) {
      clearInterval(timer);
      typing = false;
      scheduleNext();
    }
  }, 35);
}

function scheduleNext() {
  clearTimeout(autoTimer);
  if (li >= lines.length - 1) return;
  autoTimer = setTimeout(() => {
    li++;
    typeLine();
  }, 2500 + lines[li].length * 40);
}

box.addEventListener('click', () => {
  clearTimeout(autoTimer);
  if (typing) {
    clearInterval(timer);
    textEl.textContent = lines[li];
    typing = false;
    scheduleNext();
  } else {
    li = (li + 1) % lines.length;
    typeLine();
  }
});

// ---------- hover sounds ----------
const hoverTargets = 'nav a, .cart, .badge, .email, .card';

document.addEventListener('mouseover', e => {
  const el = e.target.closest(hoverTargets);
  if (!el || el.contains(e.relatedTarget)) return;

  if (el.matches('nav a'))      beep(600, 900, 0.05, 'square', 0.04);    // menu blip
  else if (el.matches('.cart')) beep(300, 500, 0.06, 'square', 0.04);    // low cartridge thunk
  else if (el.matches('.badge'))beep(900, 1400, 0.08, 'triangle', 0.05); // bright medal ping
  else if (el.matches('.email'))beep(500, 700, 0.05, 'square', 0.04);    // button blip
  else                          beep(700, 800, 0.03, 'triangle', 0.03);  // soft card tick
});