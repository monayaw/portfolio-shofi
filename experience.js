const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const toastEl = document.getElementById('toast');
function toast(msg) {
  toastEl.textContent = msg; toastEl.classList.add('show');
  setTimeout(() => toastEl.classList.remove('show'), 2000);
}

// Reveal on scroll
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
}), { threshold: 0.08 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Scroll progress + back-to-top
const bar = document.querySelector('.progress');
const toTop = document.querySelector('.to-top');
addEventListener('scroll', () => {
  const h = document.documentElement;
  bar.style.width = h.scrollTop / (h.scrollHeight - h.clientHeight || 1) * 100 + '%';
  toTop.classList.toggle('show', h.scrollTop > 500);
}, { passive: true });

// Highlight current section in the nav
const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
const spy = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
}), { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('.exp-detail').forEach(a => spy.observe(a));

// Wipe transition when going back to the home page
document.querySelectorAll('.back-link').forEach(a => a.addEventListener('click', e => {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  e.preventDefault();
  if (reduce) { location.href = a.href; return; }
  const r = a.getBoundingClientRect();
  const w = document.createElement('div');
  w.className = 'wipe'; w.innerHTML = '<span>★</span>';
  w.style.setProperty('--x', r.left + r.width / 2 + 'px'); w.style.setProperty('--y', r.top + r.height / 2 + 'px');
  document.body.appendChild(w);
  requestAnimationFrame(() => requestAnimationFrame(() => w.classList.add('go')));
  setTimeout(() => { location.href = a.href; }, 650);
}));
addEventListener('pageshow', e => { if (e.persisted) document.querySelectorAll('.wipe:not(.wipe-in)').forEach(w => w.remove()); });

// Gallery + lightbox
const lb = document.getElementById('lightbox');
const lbImg = lb.querySelector('img'), lbCap = lb.querySelector('figcaption');
let list = [], idx = 0, lastShot = null;
document.querySelectorAll('.shot').forEach(s => {
  const img = s.querySelector('img');
  const miss = () => s.classList.add('missing');
  if (img.complete && img.naturalWidth === 0) miss();
  img.addEventListener('error', miss);
  s.addEventListener('click', () => {
    if (s.classList.contains('missing')) { toast('Foto belum ditambahkan ✦'); return; }
    list = [...s.closest('.exp-detail').querySelectorAll('.shot:not(.missing)')];
    idx = list.indexOf(s); show();
  });
});
function show() {
  const s = list[idx], img = s.querySelector('img');
  lastShot = s;
  lbImg.src = img.currentSrc || img.src; lbImg.alt = img.alt;
  lbCap.textContent = (s.dataset.caption || img.alt) + '  ·  ' + (idx + 1) + '/' + list.length;
  lb.classList.toggle('single', list.length < 2);
  lb.hidden = false; lb.classList.add('open');
  document.body.classList.add('no-scroll');
  lb.querySelector('.lb-close').focus();
}
function closeLb() {
  lb.classList.remove('open'); lb.hidden = true;
  document.body.classList.remove('no-scroll');
  if (lastShot) lastShot.focus();
}
function step(d) { idx = (idx + d + list.length) % list.length; show(); }
lb.querySelector('.lb-close').addEventListener('click', closeLb);
lb.querySelector('.lb-prev').addEventListener('click', () => step(-1));
lb.querySelector('.lb-next').addEventListener('click', () => step(1));
lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
addEventListener('keydown', e => {
  if (!lb.classList.contains('open')) return;
  if (e.key === 'Escape') closeLb();
  if (e.key === 'ArrowLeft') step(-1);
  if (e.key === 'ArrowRight') step(1);
});