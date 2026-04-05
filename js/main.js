/* ===== DARK MODE ===== */
function initTheme() {
  const saved = localStorage.getItem('theme');
  const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const theme = saved || system;
  document.documentElement.setAttribute('data-theme', theme);
  _updateThemeIcon(theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  _updateThemeIcon(next);
}

function _updateThemeIcon(theme) {
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

/* ===== NAV ===== */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();

  // Mobile nav toggle
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
  }

  // Active nav link
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href').split('/').pop() || 'index.html';
    if (href === currentPath) a.classList.add('active');
  });

  // TOC (runs only on post pages)
  initTOC();

  // Reading time
  initReadingTime();
});

/* ===== TOC ===== */
function initTOC() {
  const tocNav = document.getElementById('toc-nav');
  if (!tocNav) return;
  const headings = document.querySelectorAll('.post-content h2, .post-content h3');
  if (headings.length === 0) return;

  const items = [];
  headings.forEach((h, i) => {
    if (!h.id) h.id = 'h-' + i;
    const a = document.createElement('a');
    a.href = '#' + h.id;
    a.textContent = h.textContent;
    a.className = 'toc-link toc-' + h.tagName.toLowerCase();
    a.addEventListener('click', e => {
      e.preventDefault();
      h.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // offset for sticky nav
      setTimeout(() => window.scrollBy(0, -72), 350);
    });
    tocNav.appendChild(a);
    items.push({ el: h, link: a });
  });

  // Scroll spy
  let active = null;
  const onScroll = () => {
    const scrollY = window.scrollY + 100;
    let current = items[0];
    for (const item of items) {
      if (item.el.getBoundingClientRect().top + window.scrollY <= scrollY) current = item;
    }
    if (current !== active) {
      if (active) active.link.classList.remove('active');
      current.link.classList.add('active');
      active = current;
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ===== READING TIME ===== */
function initReadingTime() {
  const content = document.querySelector('.post-content');
  const metaRow = document.querySelector('.post-meta-row');
  if (!content || !metaRow) return;
  const words = content.innerText.trim().split(/\s+/).length;
  const mins = Math.max(1, Math.round(words / 220));
  const span = document.createElement('span');
  span.style.cssText = 'font-size:0.88rem;color:var(--sub);';
  span.textContent = `읽는 시간 약 ${mins}분`;
  metaRow.appendChild(span);
}

/* ===== BLOG CARDS LOADER ===== */
async function loadPosts(options = {}) {
  const { container, limit = 9, listContainer, listLimit = 5, filter = '전체', postsPath = 'blog/posts.json' } = options;
  try {
    const res = await fetch(postsPath);
    const posts = await res.json();
    const filtered = filter === '전체' ? posts : posts.filter(p => p.category.includes(filter));
    filtered.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.date) - new Date(a.date));
    if (container) renderCards(container, filtered.slice(0, limit));
    if (listContainer) {
      window._allPosts = filtered;
      window._listOffset = 0;
      renderList(listContainer, 0, listLimit);
    }
    return filtered;
  } catch (e) {
    console.error('posts.json load failed', e);
    return [];
  }
}

function renderCards(container, posts) {
  container.innerHTML = posts.map(p => cardHTML(p)).join('');
}

function renderList(container, offset, limit) {
  const posts = window._allPosts || [];
  const chunk = posts.slice(offset, offset + limit);
  if (offset === 0) container.innerHTML = '';
  chunk.forEach(p => {
    const el = document.createElement('a');
    el.href = `${p.slug}.html`;
    el.className = 'post-item';
    el.innerHTML = `
      <div>
        <div class="post-item-cats">${p.category.map(c => `<span class="card-cat">${c}</span>`).join('')}</div>
        <div class="post-item-title">${p.title}</div>
        <div class="post-item-excerpt">${p.excerpt}</div>
      </div>
      <div class="post-item-date">${formatDate(p.date)}</div>`;
    container.appendChild(el);
  });
  window._listOffset = offset + chunk.length;
  const loadMoreWrap = document.querySelector('.load-more-wrap');
  if (loadMoreWrap) {
    loadMoreWrap.style.display = window._listOffset >= posts.length ? 'none' : 'block';
  }
}

function cardHTML(p) {
  const thumb = p.thumbnail
    ? `<img src="${p.thumbnail}" alt="${p.title}" loading="lazy">`
    : `<div class="card-thumb-placeholder">✍️</div>`;
  return `<a href="blog/${p.slug}.html" class="card">
    <div class="card-thumb">${thumb}</div>
    <div class="card-body">
      <div class="card-cats">${p.category.map(c => `<span class="card-cat">${c}</span>`).join('')}</div>
      <div class="card-title">${p.title}${p.pinned ? ' <span class="card-pinned">📌</span>' : ''}</div>
      <div class="card-excerpt">${p.excerpt}</div>
      <div class="card-meta"><span>${formatDate(p.date)}</span></div>
    </div>
  </a>`;
}

function cardHTMLRelative(p, prefix = '') {
  const thumb = p.thumbnail
    ? `<img src="${prefix}${p.thumbnail}" alt="${p.title}" loading="lazy">`
    : `<div class="card-thumb-placeholder">✍️</div>`;
  return `<a href="${prefix}blog/${p.slug}.html" class="card">
    <div class="card-thumb">${thumb}</div>
    <div class="card-body">
      <div class="card-cats">${p.category.map(c => `<span class="card-cat">${c}</span>`).join('')}</div>
      <div class="card-title">${p.title}</div>
      <div class="card-excerpt">${p.excerpt}</div>
      <div class="card-meta"><span>${formatDate(p.date)}</span></div>
    </div>
  </a>`;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

/* ===== CATEGORY FILTER ===== */
function initCatFilter(options = {}) {
  const { cardsContainer, listContainer, postsPath = '../blog/posts.json', listLimit = 5 } = options;
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.cat;
      await loadPosts({ container: cardsContainer, listContainer, filter, postsPath, listLimit });
    });
  });
}

/* ===== LOAD MORE ===== */
function initLoadMore(listContainer, limit = 5) {
  const btn = document.querySelector('.btn-load-more');
  if (btn) btn.addEventListener('click', () => renderList(listContainer, window._listOffset, limit));
}
