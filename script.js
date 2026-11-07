// Reveal on scroll
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Active nav link
const links = document.querySelectorAll('.nav-links a');
const spy = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('header[id], section[id]').forEach(s => spy.observe(s));

// Close mobile menu after click
links.forEach(a => a.addEventListener('click', () => { document.getElementById('menu-toggle').checked = false; }));

// Buttons with data-link: open if filled, otherwise show a friendly notice
const toast = document.getElementById('toast');
document.querySelectorAll('[data-link]').forEach(btn => {
  btn.addEventListener('click', () => {
    const url = btn.dataset.link.trim();
    if (url) { window.open(url, '_blank', 'noopener'); return; }
    toast.textContent = 'Link belum tersedia ✦';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  });
  btn.setAttribute('role', 'button');
  btn.setAttribute('tabindex', '0');
  btn.addEventListener('keydown', e => { if (e.key === 'Enter') btn.click(); });
});

// Typing effect (static first phrase if reduced motion)
const typed = document.getElementById('typed');
const words = ['Web Developer', 'Mobile App Developer', 'UI/UX Designer', 'Flutter Enthusiast', 'Graphic Design Lover'];
if (typed && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  let w = 0, c = 0, del = false;
  (function tick() {
    const word = words[w];
    typed.textContent = word.slice(0, c);
    if (!del && c === word.length) { del = true; return setTimeout(tick, 1400); }
    if (del && c === 0) { del = false; w = (w + 1) % words.length; }
    c += del ? -1 : 1;
    setTimeout(tick, del ? 40 : 85);
  })();
}

// Scroll progress + back-to-top
const bar = document.querySelector('.progress');
const toTop = document.querySelector('.to-top');
addEventListener('scroll', () => {
  const h = document.documentElement;
  const pct = h.scrollTop / (h.scrollHeight - h.clientHeight || 1) * 100;
  if (bar) bar.style.width = pct + '%';
  if (toTop) toTop.classList.toggle('show', h.scrollTop > 500);
}, { passive: true });

// Experience cards: wipe transition before opening experience.html
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
document.querySelectorAll('.exp-card').forEach(card => card.addEventListener('click', e => {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  e.preventDefault();
  const url = card.href;
  if (reduceMotion) { location.href = url; return; }
  card.closest('.exp-grid').classList.add('launching');
  card.classList.add('is-launching');
  const r = card.getBoundingClientRect();
  const w = document.createElement('div');
  w.className = 'wipe'; w.innerHTML = '<span>★</span>';
  w.style.setProperty('--x', r.left + r.width / 2 + 'px');
  w.style.setProperty('--y', r.top + r.height / 2 + 'px');
  document.body.appendChild(w);
  requestAnimationFrame(() => requestAnimationFrame(() => w.classList.add('go')));
  setTimeout(() => { location.href = url; }, 650);
}));
// Restore state when coming back with the browser back button
addEventListener('pageshow', e => {
  if (!e.persisted) return;
  document.querySelectorAll('.wipe').forEach(w => w.remove());
  document.querySelectorAll('.launching,.is-launching').forEach(x => x.classList.remove('launching', 'is-launching'));
});