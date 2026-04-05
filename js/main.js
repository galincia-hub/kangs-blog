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

/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initTOC();
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
      setTimeout(() => window.scrollBy(0, -72), 350);
    });
    tocNav.appendChild(a);
    items.push({ el: h, link: a });
  });

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
  span.textContent = `읽는 시간 약 ${mins}분`;
  metaRow.appendChild(span);
}

/* ===== POSTS ===== */
async function loadPosts(options = {}) {
  const { postsPath = 'blog/posts.json', filter = '전체' } = options;
  try {
    const res = await fetch(postsPath);
    const posts = await res.json();
    const filtered = filter === '전체' ? posts : posts.filter(p => p.category.includes(filter));
    filtered.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.date) - new Date(a.date));
    return filtered;
  } catch (e) {
    console.error('posts.json load failed', e);
    return [];
  }
}

function renderMinimalList(container, posts, slugPrefix = '') {
  container.innerHTML = posts.map(p => `
    <li class="post-list-item">
      <div class="post-date">${formatDate(p.date)}</div>
      <a href="${slugPrefix}${p.slug}.html" class="post-title-link">${p.title}</a>
      <div class="post-cats">${p.category.map(c => `<span class="post-cat-tag">${c}</span>`).join('')}</div>
    </li>`).join('');
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

/* ===== CATEGORY FILTER ===== */
function initCatFilter(options = {}) {
  const { container, slugPrefix = '', postsPath = '../blog/posts.json' } = options;
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.cat;
      const posts = await loadPosts({ postsPath, filter });
      renderMinimalList(container, posts, slugPrefix);
    });
  });
}

/* ===== ADMIN ===== */
async function loadAdminPosts(postsPath = 'blog/posts.json') {
  const posts = await loadPosts({ postsPath });
  const tbody = document.getElementById('admin-tbody');
  const statTotal = document.getElementById('stat-total');
  const statPinned = document.getElementById('stat-pinned');
  if (statTotal) statTotal.textContent = posts.length;
  if (statPinned) statPinned.textContent = posts.filter(p => p.pinned).length;
  if (!tbody) return;
  tbody.innerHTML = posts.map(p => `
    <tr>
      <td class="admin-table-title">${p.title}</td>
      <td>${formatDate(p.date)}</td>
      <td>${p.category.join(', ')}</td>
      <td>${p.pinned ? '📌' : ''}</td>
    </tr>`).join('');
}
