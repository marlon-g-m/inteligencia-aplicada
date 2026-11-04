const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Menú móvil ---------- */
const menuBtn = document.querySelector('.menu-btn');
const menu = document.getElementById('menu');

function setMenu(open) {
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  menu.classList.toggle('open', open);
}
menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

/* ---------- Barra y portada según el scroll ---------- */
const nav = document.querySelector('.nav');
const hero = document.querySelector('.hero');
let ticking = false;

function onScroll() {
  const h = hero.offsetHeight;
  const y = window.scrollY;
  nav.dataset.state = y > h - 80 ? 'scrolled' : 'top';
  if (!reduceMotion) {
    const p = Math.min(Math.max(y / (h * 0.75), 0), 1);
    hero.style.setProperty('--hero-p', p.toFixed(3));
  }
  ticking = false;
}
window.addEventListener('scroll', () => {
  if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
}, { passive: true });
onScroll();

/* ---------- Aparición al hacer scroll ---------- */
document.querySelectorAll('.bento, .steps').forEach((group) => {
  [...group.children].forEach((el, i) => el.style.setProperty('--d', `${i * 80}ms`));
});

const revealObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  }
}, { rootMargin: '0px 0px -10% 0px', threshold: 0.15 });
document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

/* ---------- Animación de la portada: flujos de datos ---------- */
(function heroFlow() {
  const canvas = document.querySelector('.hero-canvas');
  const ctx = canvas.getContext('2d');
  const LINES = 16;
  let w = 0, h = 0, dpr = 1, running = false, t = 0, last = 0;

  // Pulsos: puntos de luz que recorren algunas líneas (datos viajando entre sistemas)
  const pulses = Array.from({ length: 7 }, (_, i) => ({
    line: (i * 5 + 2) % LINES,
    x: Math.random(),
    speed: 0.035 + Math.random() * 0.04,
  }));

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!running) draw();
  }

  function lineY(i, x, time) {
    const k = i / LINES;
    const base = h * (0.18 + k * 0.7);
    const amp = h * (0.05 + 0.06 * Math.sin(k * Math.PI));
    const nx = x / w;
    return base
      + Math.sin(nx * 3.2 + time * 0.35 + k * 2.4) * amp
      + Math.sin(nx * 7.1 - time * 0.22 + k * 5.0) * amp * 0.35
      - (nx * nx) * h * 0.18 * (1 - k);
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    const step = Math.max(8, w / 140);
    for (let i = 0; i < LINES; i++) {
      const k = i / LINES;
      const alpha = 0.1 + 0.3 * Math.sin(k * Math.PI);
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, 'rgba(122,162,255,0)');
      grad.addColorStop(0.35, `rgba(122,162,255,${alpha * 0.6})`);
      grad.addColorStop(1, `rgba(143,176,255,${alpha})`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      for (let x = 0; x <= w + step; x += step) {
        const y = lineY(i, x, t);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    for (const p of pulses) {
      const x = p.x * w;
      const y = lineY(p.line, x, t);
      const glow = ctx.createRadialGradient(x, y, 0, x, y, 18);
      glow.addColorStop(0, 'rgba(190,210,255,0.9)');
      glow.addColorStop(0.3, 'rgba(122,162,255,0.35)');
      glow.addColorStop(1, 'rgba(122,162,255,0)');
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(x, y, 18, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath(); ctx.arc(x, y, 1.8, 0, Math.PI * 2); ctx.fill();
    }
  }

  function frame(now) {
    if (!running) return;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    t += dt;
    for (const p of pulses) { p.x += p.speed * dt; if (p.x > 1.05) p.x = -0.05; }
    draw();
    requestAnimationFrame(frame);
  }

  function start() {
    if (running || reduceMotion || document.hidden) return;
    running = true; last = performance.now(); requestAnimationFrame(frame);
  }
  function stop() { running = false; }

  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop())).observe(canvas);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  resize();
})();

/* ---------- Pestañas de rubros que avanzan solas ---------- */
(function tabs() {
  const root = document.querySelector('.tabs');
  const tabs = [...root.querySelectorAll('[role="tab"]')];
  const duration = Number(root.dataset.autoplay) || 7000;
  let current = 0, elapsed = 0, last = 0;
  let paused = false, stopped = reduceMotion, visible = false;

  function select(i, focus = false) {
    tabs.forEach((tab, j) => {
      const on = i === j;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      tab.style.setProperty('--progress', '0');
      document.getElementById(tab.getAttribute('aria-controls')).hidden = !on;
    });
    current = i; elapsed = 0;
    if (focus) tabs[i].focus();
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => { stopped = true; select(i); });
    tab.addEventListener('keydown', (e) => {
      const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
      if (e.key in keys) {
        e.preventDefault(); stopped = true;
        select((current + keys[e.key] + tabs.length) % tabs.length, true);
      }
    });
  });

  root.addEventListener('pointerenter', () => { paused = true; });
  root.addEventListener('pointerleave', () => { paused = false; });
  root.addEventListener('focusin', () => { paused = true; });
  root.addEventListener('focusout', () => { paused = false; });
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(root);

  function loop(now) {
    const dt = last ? now - last : 0;
    last = now;
    if (!stopped && !paused && visible && !document.hidden) {
      elapsed += dt;
      tabs[current].style.setProperty('--progress', Math.min(elapsed / duration, 1).toFixed(3));
      if (elapsed >= duration) select((current + 1) % tabs.length);
    }
    if (!stopped) requestAnimationFrame(loop);
    else tabs.forEach((tab) => tab.style.setProperty('--progress', '0'));
  }
  requestAnimationFrame(loop);
})();

/* ---------- Año del pie de página ---------- */
document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- Formulario: abre WhatsApp con el mensaje armado (sin backend) ---------- */
const WHATSAPP = '56976630940';

document.getElementById('contact-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(e.target);
  const empresa = data.get('empresa') ? ` de ${data.get('empresa')}` : '';
  const text = `Hola, soy ${data.get('nombre')}${empresa}. ${data.get('mensaje')}`;
  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
});
