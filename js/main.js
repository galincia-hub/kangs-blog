/* ===== NAV TOGGLE ===== */
document.addEventListener('DOMContentLoaded', () => {
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
});

/* ===== BLOG CARDS LOADER ===== */
async function loadPosts(options = {}) {
  const { container, limit = 9, listContainer, listLimit = 5, filter = '전체', postsPath = 'blog/posts.json' } = options;
  try {
    const res = await fetch(postsPath);
    const posts = await res.json();
    const filtered = filter === '전체' ? posts : posts.filter(p => p.category.includes(filter));
    // Pinned first
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
