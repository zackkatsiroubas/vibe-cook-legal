const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- "Cook with ___" ---------- */
const h1 = document.querySelector('.hero h1'), cycle = h1.querySelector('.cycle');
const swoosh = cycle.querySelector('.swoosh'), word = cycle.querySelector('.word'), stroke = swoosh.querySelector('path');
const WORDS = ['leftover rice.', '3 eggs.', 'chicken wings.', 'half an onion.', 'that one lemon.', 'what you’ve got.'];

// Shrink the cycling line just enough that the longest word fits on one line.
// It's one size for every word, so swapping words never changes the height.
function fit() {
  const probe = document.createElement('span');
  probe.className = 'probe';
  h1.appendChild(probe);
  let widest = 0;
  for (const w of WORDS) { probe.innerHTML = `<em>${w}</em>`; widest = Math.max(widest, probe.offsetWidth); }
  probe.remove();
  h1.style.setProperty('--fit', Math.min(1, h1.clientWidth / (widest * 1.03)));
}
fit();
document.fonts.ready.then(fit);
addEventListener('resize', fit);

if (!still) {
  let wi = WORDS.length - 1;
  const next = () => {
    swoosh.classList.add('out');
    setTimeout(() => {
      wi = (wi + 1) % WORDS.length;
      word.textContent = WORDS[wi];
      swoosh.classList.remove('out'); swoosh.classList.add('pre');
      void swoosh.offsetWidth;
      swoosh.classList.remove('pre');
      stroke.style.animation = 'none'; void stroke.getBoundingClientRect(); stroke.style.animation = '';
      setTimeout(next, wi === WORDS.length - 1 ? 3600 : 1700);
    }, 320);
  };
  setTimeout(next, 3200);
}

/* ---------- the chat demo and its recipe panel ---------- */
const demo = document.getElementById('demo'), chat = document.getElementById('chat');
const panel = document.getElementById('rpanel'), tab = document.getElementById('rtab'), back = document.getElementById('back');
const RECIPE = {
  v1: { changes: 0, ings: [['2 cups leftover rice, cold'], ['3 eggs, beaten'], ['½ onion, diced small'], ['2 tbsp soy sauce'], ['1 tbsp butter']],
        step3: 'Push it aside, scramble the eggs, then toss it all with the soy sauce.' },
  v2: { changes: 2, ings: [['2 cups leftover rice, cold'], ['3 eggs, beaten'], ['½ onion, diced small'], ['1 tbsp oyster sauce', 'was 2 tbsp soy sauce'], ['Pinch of salt', 'new'], ['1 tbsp butter']],
        step3: 'Push it aside, scramble the eggs, then toss it all with the oyster sauce and salt.' },
};
function showRecipe(v) {
  const r = RECIPE[v];
  document.getElementById('ings').innerHTML = r.ings.map(([t, tag]) => tag ? `<li class="chg">${t}<em>${tag}</em></li>` : `<li>${t}</li>`).join('');
  document.getElementById('count').textContent = r.ings.length + ' items';
  document.getElementById('step3').textContent = r.step3;
  const ch = document.getElementById('changes');
  ch.textContent = `✓ ${r.changes} changes`;
  ch.classList.toggle('on', r.changes > 0);
  demo.classList.add('has-recipe');
}
function say(who, text, chip) {
  const label = document.createElement('div');
  label.className = 'who ' + who + '-who';
  label.innerHTML = who === 'me' ? 'YOU' : '<svg><use href="#rosie"/></svg>ROSIE';
  const m = document.createElement('div');
  m.className = 'msg ' + who;
  m.innerHTML = text + (chip ? `<br><span class="chip">${chip}</span>` : '');
  chat.append(label, m);
  chat.scrollTo({ top: chat.scrollHeight, behavior: still ? 'auto' : 'smooth' });
  return [label, m];
}
function typing() { return say('her', '<span class="dots"><i></i><i></i><i></i></span>'); }
const setOpen = open => { panel.style.transform = ''; demo.classList.toggle('open', open); };

const LINES = {
  ask1: 'Leftover rice, 3 eggs, half an onion. No cilantro, ever.',
  ans1: 'Got it, no cilantro. Ever. Crispy fried rice it is, all in your cast iron. The full recipe is in the panel.',
  ask2: 'I’m out of soy sauce.',
  ans2: 'Swapped it for oyster sauce and a pinch of salt. The changes are highlighted in the recipe.',
};

// Plays on a loop. Once the visitor grabs the panel, the panel is theirs: the chat
// still finishes its conversation, but stops sliding the panel and stops looping.
let manual = false;
const wait = ms => new Promise(ok => setTimeout(ok, ms));
const autoOpen = open => { if (!manual) setOpen(open); };
async function autoplay() {
  do {
    chat.innerHTML = ''; setOpen(false); demo.classList.remove('has-recipe');
    await wait(700);  say('me', LINES.ask1);
    await wait(800);  let t = typing();
    await wait(1400); t.forEach(n => n.remove()); say('her', LINES.ans1, '📄 Recipe opened'); showRecipe('v1');
    await wait(900);  autoOpen(true);
    await wait(3800); autoOpen(false);
    await wait(1100); say('me', LINES.ask2);
    await wait(800);  t = typing();
    await wait(1400); t.forEach(n => n.remove()); say('her', LINES.ans2, '✏️ Recipe updated'); showRecipe('v2');
    await wait(900);  autoOpen(true);
    await wait(4600); autoOpen(false);
    await wait(2600);
  } while (!manual);
}
if (still) {
  say('me', LINES.ask1); say('her', LINES.ans1, '📄 Recipe opened');
  say('me', LINES.ask2); say('her', LINES.ans2, '✏️ Recipe updated'); showRecipe('v2');
} else {
  autoplay();
}

// Drag the RECIPE tab (or the panel's top bar) to slide the panel in and out.
let drag = null, dragged = false;
function down(e) {
  if (!demo.classList.contains('has-recipe')) return;
  manual = true;
  drag = { x0: e.clientX, base: demo.classList.contains('open') ? 0 : demo.clientWidth, x: null };
  e.currentTarget.setPointerCapture(e.pointerId);
}
function move(e) {
  if (!drag) return;
  const dx = e.clientX - drag.x0;
  if (drag.x === null && Math.abs(dx) < 6) return;
  drag.x = Math.min(demo.clientWidth, Math.max(0, drag.base + dx));
  panel.style.transition = 'none';
  panel.style.transform = `translateX(${drag.x}px)`;
}
function up() {
  if (!drag) return;
  panel.style.transition = '';
  if (drag.x !== null) {
    // a drag shouldn't also count as a tap on the tab or the Back button
    dragged = true; setTimeout(() => dragged = false);
    setOpen(drag.x < demo.clientWidth / 2);
  }
  drag = null;
}
for (const el of [tab, document.getElementById('ph')]) {
  el.addEventListener('pointerdown', down);
  el.addEventListener('pointermove', move);
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', up);
}
tab.addEventListener('click', () => { if (dragged) return; manual = true; setOpen(true); });
back.addEventListener('click', () => { if (dragged) return; manual = true; setOpen(false); });

const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('in');
  e.target.querySelector('.them')?.classList.add('in');
  io.unobserve(e.target);
}), { threshold: .2 });
document.querySelectorAll('.rv').forEach((el, i) => { el.style.transitionDelay = (i % 3) * 90 + 'ms'; io.observe(el); });
