// enhance.js — muat SETELAH script.js
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // reveal untuk elemen yang disisipkan di sini
  const countUp = el => {
    const to = +el.dataset.to;
    if (reduce) { el.textContent = to; return; }
    const t0 = performance.now();
    (function step(t) {
      const p = Math.min((t - t0) / 1100, 1);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  };
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('visible');
    $$('[data-to]', e.target).forEach(countUp);
    io.unobserve(e.target);
  }), { threshold: 0.15 });
  const add = el => { el.classList.add('reveal'); io.observe(el); };

  // 1. eyebrow label di atas judul section
  const labels = { about: '01 · Tentang', education: '02 · Pendidikan', experience: '03 · Pengalaman',
    skills: '04 · Keahlian', projects: '05 · Karya', certificates: '06 · Sertifikat' };
  Object.entries(labels).forEach(([id, text]) => {
    const title = $(`#${id} > .title`);
    if (!title) return;
    const p = document.createElement('span');
    p.className = 'eyebrow'; p.textContent = `✦ ${text} ✦`;
    title.before(p); add(p);
  });

  // 2. statistik di About (dihitung otomatis dari isi halaman)
  const about = $('#about');
  if (about) {
    const n = s => $$(s).length;
    const tech = new Set($$('#skills .grid-3 .card:nth-child(-n+4) .chips span').map(s => s.textContent.trim()));
    const data = [[n('#projects .project'), 'Projects'], [n('#certificates .cert'), 'Certificates'],
      [n('#experience .exp-card'), 'Experiences'], [tech.size, 'Tech Skills']];
    const w = document.createElement('div');
    w.className = 'stats';
    w.innerHTML = data.map(([v, l]) => `<div class="stat"><b data-to="${v}">0</b><span>${l}</span></div>`).join('');
    about.appendChild(w); add(w);
  }

  // 3. marquee teknologi
  const skills = $('#skills');
  if (skills) {
    const names = [...new Set($$('.grid-3 .card:nth-child(-n+4) .chips span', skills).map(s => s.textContent.replace(/\s+/g, ' ').trim()))];
    if (names.length) {
      const half = names.map(t => `<span>${t}</span>`).join('');
      const cap = document.createElement('p');
      cap.className = 'hand m-cap'; cap.textContent = 'Tech stack favoritku';
      const m = document.createElement('div');
      m.className = 'marquee';
      m.setAttribute('aria-label', 'Teknologi yang digunakan');
      m.innerHTML = `<div class="m-track">${half}<span class="dup" aria-hidden="true" hidden></span>${half}</div>`;
      $$('.m-track span:nth-last-child(-n+' + names.length + ')', m).forEach(s => s.setAttribute('aria-hidden', 'true'));
      $('.dup', m).remove();
      skills.append(cap, m); add(cap); add(m);
    }
  }

  // 4. footer: tagline + navigasi
  const f = $('.footer');
  if (f) {
    const tag = document.createElement('p');
    tag.className = 'footer-tag'; tag.textContent = '';
    const nav = document.createElement('nav');
    nav.className = 'footer-links'; nav.setAttribute('aria-label', 'Footer');
    nav.innerHTML = $$('.nav-links a').map(a => `<a href="${a.getAttribute('href')}">${a.textContent}</a>`).join('');
    f.prepend(tag, nav);
  }

  // 5. sparkle halus saat hover (hanya mouse, ada jeda agar tidak ramai)
  if (!reduce && matchMedia('(hover:hover)').matches) {
    const glyphs = ['✦', '★', '✧'];
    const spark = (x, y) => {
      for (let i = 0; i < 4; i++) {
        const s = document.createElement('i');
        s.className = 'spk'; s.textContent = glyphs[i % 3];
        s.style.left = x + 'px'; s.style.top = y + 'px';
        s.style.fontSize = 10 + Math.random() * 10 + 'px';
        s.style.setProperty('--dx', Math.random() * 80 - 40 + 'px');
        s.style.setProperty('--dy', -20 - Math.random() * 50 + 'px');
        document.body.appendChild(s);
        setTimeout(() => s.remove(), 900);
      }
    };
    const last = new WeakMap();
    $$('.card, .btn, .view-more, .stat, .to-top').forEach(el => el.addEventListener('mouseenter', e => {
      const now = Date.now();
      if (now - (last.get(el) || 0) < 1500) return;
      last.set(el, now); spark(e.clientX, e.clientY);
    }));
  }
})();

// icon doodle di margin kiri/kanan tiap section
(() => {
  const set = {
    about:        [['horseshoe','l',10,'sway'],['hat','r',42,'bounce'],['cactus','l',74,'float']],
    education:    [['cactus','l',12,'bounce'],['boot','r',48,'sway'],['star','l',78,'pulse']],
    experience:   [['boot','l',14,'sway'],['tumbleweed','r',40,'float'],['horseshoe','r',78,'sway']],
    skills:       [['hat','l',12,'float'],['cactus','r',46,'bounce'],['sun','l',76,'pulse']],
    projects:     [['tumbleweed','l',12,'float'],['horseshoe','r',44,'sway'],['cactus','l',76,'bounce']],
    certificates: [['cactus','l',14,'bounce'],['sun','r',44,'pulse'],['hat','l',76,'sway']]
  };
  const NS = 'http://www.w3.org/2000/svg';
  Object.entries(set).forEach(([id, icons]) => {
    const sec = document.getElementById(id);
    if (!sec) return;
    icons.forEach(([name, side, top, anim], i) => {
      const s = document.createElementNS(NS, 'svg');
      s.setAttribute('class', `sd sd-${side} i-${name} a-${anim}`);
      s.setAttribute('aria-hidden', 'true');
      s.style.top = top + '%';
      s.style.animation = `${anim} ${3.6 + i * .7}s ease-in-out infinite`;
      s.innerHTML = `<use href="#${name}"/>`;
      sec.appendChild(s);
    });
  });
})();