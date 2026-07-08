(() => {
  'use strict';

  const FOLDER_DEFS = [
    { key: 'illustration', tabWidth: 150, dark: false, height: 210,
      copy: 'A self-initiated line-art series — expression distilled to a single stroke.' },
    { key: 'print', tabWidth: 252, dark: false, height: 220,
      copy: 'Large-format work built for the street — murals, banners, vehicle wraps and out-of-home.' },
    { key: 'web', tabWidth: 206, dark: true, height: 230,
      copy: 'Digital front-ends for print houses and brands — bold, high-contrast interface design.' },
    { key: 'branding', tabWidth: 234, dark: false, height: 240,
      copy: 'Identity systems and rollouts — from a national bank launch to a shelf of logotypes.' },
    { key: 'campaign', tabWidth: 238, dark: false, height: 264, front: true, openRow: true,
      copy: "The bulk of the work — always-on campaigns and social systems for Orange, Hilton, Nando's, BIFM and more." }
  ];

  let content = null;
  const state = { menuOpen: false, cat: null, proj: null };

  const el = (sel) => document.querySelector(sel);
  const folderStackEl = el('#folderStack');
  const menuListEl = el('#menuList');
  const categoryOverlay = el('#categoryOverlay');
  const menuOverlay = el('#menuOverlay');
  const overlayContent = el('#overlayContent');
  const overlayBackBtn = el('#overlayBackBtn');

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  async function init() {
    const res = await fetch('content.json');
    content = await res.json();

    el('#sidebarName').innerHTML = escapeHtml(content.identity.name).replace(' ', '<br>');
    el('#monogram').textContent = content.identity.monogram;
    el('#sidebarRole').textContent = content.identity.role;
    el('#sidebarTenure').textContent = content.identity.tenure;
    el('#sidebarLocation').textContent = content.identity.location;

    ['#behanceLink', '#contactBehance', '#menuBehance'].forEach(s => el(s).href = content.contact.behance);
    ['#linkedinLink', '#contactLinkedin', '#menuLinkedin'].forEach(s => el(s).href = content.contact.linkedin);

    renderFolders();
    renderMenu();
    bindNav();
    startFloatLoop();
  }

  function renderFolders() {
    folderStackEl.innerHTML = FOLDER_DEFS.map((f, i) => {
      const cat = content.categories[f.key];
      const classes = ['folder', f.dark ? 'folder--dark' : 'folder--light'];
      if (f.front) classes.push('folder--front');
      return `
        <div class="${classes.join(' ')}" data-index="${i}" data-cat="${f.key}" style="z-index:${i + 1};">
          <div class="folder-tab" style="width:${f.tabWidth}px;">
            <span class="tab-label">${escapeHtml(cat.label)}</span>
            <span class="folder-swoop"></span>
          </div>
          <div class="folder-body" style="width:420px; height:${f.height}px;">
            <p class="folder-copy">${escapeHtml(f.copy)}</p>
            ${f.openRow ? '<div class="folder-open-row">Open folder →</div>' : ''}
          </div>
        </div>`;
    }).join('');

    // base position (left/top offsets); float/lift applied on top via rAF loop
    FOLDER_DEFS.forEach((f, i) => {
      const node = folderStackEl.children[i];
      node.style.top = `${i * 66}px`;
      node.style.left = `${i * 56}px`;
      node.addEventListener('click', () => openCategory(f.key));
      node.addEventListener('mouseenter', () => { hoverState[i] = true; });
      node.addEventListener('mouseleave', () => { hoverState[i] = false; });
    });
  }

  const hoverState = FOLDER_DEFS.map(() => false);
  const liftState = FOLDER_DEFS.map(() => 0);
  let startTime = null;

  function startFloatLoop() {
    // Skip float/lift transforms entirely on touch/mobile layout (folders become a static list)
    function frame(ts) {
      if (startTime === null) startTime = ts;
      const t = (ts - startTime) / 1000;
      const isMobile = window.matchMedia('(max-width:820px)').matches;

      FOLDER_DEFS.forEach((f, i) => {
        const node = folderStackEl.children[i];
        if (!node) return;
        if (isMobile) {
          node.style.transform = 'none';
          node.style.zIndex = String(i + 1);
          return;
        }
        const floatDistance = 10;
        const floatSpeed = 1;
        const floatY = floatDistance * Math.sin(t * floatSpeed * 1.05 + i * 0.85);
        const target = hoverState[i] ? -16 : 0;
        liftState[i] += (target - liftState[i]) * 0.16;
        node.style.transform = `translateY(${floatY + liftState[i]}px)`;
        node.style.zIndex = hoverState[i] ? '30' : String(i + 1);
      });

      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function renderMenu() {
    menuListEl.innerHTML = Object.entries(content.categories).map(([key, cat]) =>
      `<button type="button" data-cat="${key}">${escapeHtml(cat.label)}</button>`
    ).join('');
    menuListEl.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        closeMenu();
        openCategory(btn.dataset.cat);
      });
    });
  }

  function bindNav() {
    el('#hamburgerBtn').addEventListener('click', openMenu);
    el('#mobileMenuBtn').addEventListener('click', openMenu);
    el('#menuCloseBtn').addEventListener('click', closeMenu);
    el('#overlayCloseBtn').addEventListener('click', closeOverlay);
    overlayBackBtn.addEventListener('click', () => {
      if (state.proj) {
        state.proj = null;
        renderCategoryOverlay();
      } else {
        closeOverlay();
      }
    });
  }

  function openMenu() {
    state.menuOpen = true;
    menuOverlay.hidden = false;
  }
  function closeMenu() {
    state.menuOpen = false;
    menuOverlay.hidden = true;
  }

  function openCategory(key) {
    state.cat = key;
    state.proj = null;
    categoryOverlay.hidden = false;
    categoryOverlay.scrollTop = 0;
    renderCategoryOverlay();
  }

  function openProject(key) {
    state.proj = key;
    renderCategoryOverlay();
    categoryOverlay.scrollTop = 0;
  }

  function closeOverlay() {
    state.cat = null;
    state.proj = null;
    categoryOverlay.hidden = true;
  }

  function renderCategoryOverlay() {
    const cat = content.categories[state.cat];
    overlayBackBtn.textContent = state.proj ? `← ${cat.label}` : '← Home';

    if (!state.proj) {
      overlayContent.className = 'overlay-content';
      overlayContent.innerHTML = `
        <h2 class="category-h2">${escapeHtml(cat.label)}</h2>
        <p class="category-blurb">${escapeHtml(cat.blurb)}</p>
        <div class="project-grid">
          ${cat.projects.map(pKey => {
            const p = content.projects[pKey];
            const cover = p.images[0];
            return `
              <div class="project-card" data-proj="${pKey}">
                <div class="project-tile" style="background:${cover.bg};">
                  <img src="${cover.src}" alt="${escapeHtml(p.client)}" loading="lazy">
                </div>
                <div class="project-meta-row">
                  <span class="project-client">${escapeHtml(p.client)}</span>
                  <span class="project-count">${p.images.length} image${p.images.length > 1 ? 's' : ''}</span>
                </div>
                <p class="project-tagline">${escapeHtml(p.tagline)}</p>
              </div>`;
          }).join('')}
        </div>`;
      overlayContent.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', () => openProject(card.dataset.proj));
      });
    } else {
      const p = content.projects[state.proj];
      overlayContent.className = 'overlay-content case-study';
      overlayContent.innerHTML = `
        <p class="case-eyebrow">${escapeHtml(p.cat)}</p>
        <h2 class="case-h2">${escapeHtml(p.client)}</h2>
        <p class="case-tagline">${escapeHtml(p.tagline)}</p>
        <div class="meta-row">
          <div class="meta-item"><span class="meta-label">Role</span><span class="meta-value">${escapeHtml(p.role)}</span></div>
          <div class="meta-item"><span class="meta-label">Year</span><span class="meta-value">${escapeHtml(p.year)}</span></div>
          <div class="meta-item"><span class="meta-label">Deliverables</span><span class="meta-value">${escapeHtml(p.deliverables)}</span></div>
        </div>
        <div class="case-columns">
          <div class="case-col"><h4>Challenge</h4><p>${escapeHtml(p.challenge)}</p></div>
          <div class="case-col"><h4>Approach</h4><p>${escapeHtml(p.approach)}</p></div>
          <div class="case-col"><h4>Outcome</h4><p>${escapeHtml(p.results)}</p></div>
        </div>
        <div class="gallery">
          ${p.images.map(img => `
            <figure>
              <div class="project-tile" style="background:${img.bg};">
                <img src="${img.src}" alt="${escapeHtml(img.caption)}" loading="lazy">
              </div>
              <figcaption>${escapeHtml(img.caption)}</figcaption>
            </figure>`).join('')}
        </div>
        <div class="case-footer">
          <button type="button" class="pill-btn" id="moreBtn">← More ${escapeHtml(cat.label)}</button>
        </div>`;
      el('#moreBtn').addEventListener('click', () => {
        state.proj = null;
        renderCategoryOverlay();
      });
    }
  }

  init();
})();
