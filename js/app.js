const state = {
  works: [],
  filtered: [],
  rowPositions: [],
  paused: false,
  filter: "all",
  autoTimer: null,
  animationFrame: null,
  lastFrame: 0,
  rowOffsets: []
};

const views = document.querySelectorAll("[data-view]");
const routeLinks = document.querySelectorAll("[data-route]");
const rowsRoot = document.getElementById("worksRows");
const carousel = document.getElementById("carousel");
const counter = document.getElementById("worksCounter");
const pauseButton = document.getElementById("pauseButton");
const previousButton = document.getElementById("previousButton");
const nextButton = document.getElementById("nextButton");
const mobileMenu = document.getElementById("mobileMenu");
const menuButton = document.getElementById("menuButton");

const ROW_COUNT = 5;
const SPEED = 22;

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getPlaceTokensFromFilename(image) {
  if (!image) return [];
  const fileName = String(image).split('/').pop() || '';
  const base = fileName.replace(/\.[^/.]+$/, '');
  // find latin tokens first
  const latin = base.match(/[a-zA-Z\u00C0-\u024F]+/g);
  if (latin && latin.length) return latin.map(s => s.toLowerCase());
  // fallback to CJK runs
  const cjk = base.match(/[\u4E00-\u9FFF\u3040-\u30FF\u3000-\u303F]+/g);
  if (cjk && cjk.length) return cjk;
  return [];
}

function extractPlacesFromFilenamesByCategory() {
  const map = { all: [] };
  state.works.forEach((work) => {
    if (!work) return;
    const tokens = getPlaceTokensFromFilename(work.image);
    work._placeTokens = tokens;
    tokens.forEach((token) => {
      if (!map.all.includes(token)) map.all.push(token);
      const category = work.category || 'uncategorized';
      if (!map[category]) map[category] = [];
      if (!map[category].includes(token)) map[category].push(token);
    });
  });
  return map;
}

function updateFilterButtonLabels() {
  const placesMap = extractPlacesFromFilenamesByCategory();

  document.querySelectorAll('.filter-button').forEach((button) => {
    const filter = button.dataset.filter || 'all';

    if (filter === 'all') {
      const tokens = placesMap.all ? placesMap.all.slice(0, 3) : [];
      if (tokens.length) {
        // show as ALL — TOK1, TOK2
        button.textContent = `ALL — ${tokens.map(t => String(t).toUpperCase()).join(', ')}`;
        button.removeAttribute('data-place');
      } else {
        button.textContent = 'ALL';
        button.removeAttribute('data-place');
      }
      return;
    }

    const tokens = placesMap[filter] || [];
    if (tokens.length) {
      // set button label to first token, and add data-place so clicking filters by place
      button.textContent = String(tokens[0]).toUpperCase();
      button.dataset.place = tokens[0];
    } else {
      // fallback to original label
      const original = button.dataset.originalLabel || button.textContent || filter.toUpperCase();
      button.textContent = original;
      button.removeAttribute('data-place');
    }
  });
}

function showView(route) {
  const target = route === "author" || route === "works" ? route : "home";
  views.forEach((view) => { view.hidden = view.dataset.view !== target; });
  routeLinks.forEach((link) => link.classList.toggle("active", link.dataset.route === target));
  mobileMenu.classList.remove("open");
  document.body.classList.remove("menu-open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function distributeIntoRows(items) {
  const rows = Array.from({ length: ROW_COUNT }, () => []);
  items.forEach((item, index) => rows[index % ROW_COUNT].push(item));
  return rows;
}

function renderWorks() {
  // support filtering by place tokens: state.filter can be 'all', category like 'mountain', or 'place:tok'
  if (typeof state.filter === 'string' && state.filter.startsWith('place:')) {
    const token = state.filter.slice(6);
    state.filtered = state.works.filter((work) => Array.isArray(work._placeTokens) && work._placeTokens.includes(token));
  } else if (state.filter === 'all') {
    state.filtered = state.works;
  } else {
    state.filtered = state.works.filter((work) => work.category === state.filter);
  }

  const rows = distributeIntoRows(state.filtered);
  state.rowOffsets = rows.map(() => 0);

  rowsRoot.innerHTML = rows.map((row, rowIndex) => {
    const repeated = [...row, ...row];
    return `
      <div class="carousel-row" data-row="${rowIndex}">
        <div class="carousel-row-track">
          ${repeated.map((work) => `
            <article class="work-card" data-id="${escapeHtml(work.id)}">
              <img src="${escapeHtml(work.image)}" alt="${escapeHtml(work.title)}" loading="lazy" />
              <div class="work-card-info">
                <h3 class="work-card-title">${escapeHtml(work.title)}</h3>
                <p class="work-card-description">${escapeHtml(work.description)}</p>
                <div class="work-card-meta"><span>${escapeHtml(work.location)}</span><span>${escapeHtml(work.year)}</span><span>${escapeHtml(work.categoryLabel)}</span></div>
              </div>
            </article>
          `).join("")}
        </div>
      </div>
    `;
  }).join("");

  rowsRoot.querySelectorAll('.work-card').forEach((card) => {
    card.addEventListener('click', () => openPhoto(card.dataset.id));
  });

  updateFilterButtonLabels();
  updateCounter();
}

function getRowLoopWidth(row) {
  const track = row.querySelector('.carousel-row-track');
  const cards = track?.querySelectorAll('.work-card');
  if (!track || !cards?.length) return 0;
  return track.scrollWidth / 2;
}

function animateRows(timestamp) {
  if (!state.lastFrame) state.lastFrame = timestamp;
  const elapsed = Math.min(timestamp - state.lastFrame, 64);
  state.lastFrame = timestamp;

  if (!state.paused && !document.hidden) {
    rowsRoot.querySelectorAll('.carousel-row').forEach((row, index) => {
      const loopWidth = getRowLoopWidth(row);
      if (!loopWidth) return;
      const direction = index % 2 === 0 ? 1 : -1;
      state.rowOffsets[index] = (state.rowOffsets[index] + direction * SPEED * elapsed / 1000) % loopWidth;
      if (state.rowOffsets[index] < 0) state.rowOffsets[index] += loopWidth;
      row.querySelector('.carousel-row-track').style.transform = `translate3d(${-state.rowOffsets[index]}px, 0, 0)`;
    });
  }
  state.animationFrame = requestAnimationFrame(animateRows);
}

function updateCounter() {
  const total = state.filtered.length;
  counter.textContent = `${total ? '01' : '00'} / ${String(total).padStart(2, '0')}`;
}

function nudgeRows(direction) {
  rowsRoot.querySelectorAll('.carousel-row').forEach((row, index) => {
    const cards = row.querySelectorAll('.work-card');
    if (!cards.length) return;
    const amount = cards[0].getBoundingClientRect().width + 14;
    const loopWidth = getRowLoopWidth(row);
    state.rowOffsets[index] = (state.rowOffsets[index] + direction * amount + loopWidth) % loopWidth;
  });
}

function openPhoto(id) {
  const work = state.filtered.find((item) => item.id === id) || state.works.find((item) => item.id === id);
  if (!work) return;
  const modal = document.getElementById('photoModal') || createPhotoModal();
  modal.querySelector('.photo-modal-image').src = work.image;
  modal.querySelector('.photo-modal-image').alt = work.title;
  modal.querySelector('.photo-modal-title').textContent = `${work.title} / ${work.location} / ${work.year}`;
  modal.querySelector('.photo-modal-description').textContent = work.description;
  modal.classList.add('open');
  document.body.classList.add('modal-open');
}

function createPhotoModal() {
  const modal = document.createElement('div');
  modal.id = 'photoModal';
  modal.className = 'photo-modal';
  modal.innerHTML = `
    <div class="photo-modal-inner" role="dialog" aria-modal="true" aria-label="作品の拡大表示">
      <button class="photo-modal-close" type="button" aria-label="閉じる">×</button>
      <img class="photo-modal-image" src="" alt="" />
      <div class="photo-modal-caption"><strong class="photo-modal-title"></strong><span>クリックまたはESCで閉じる</span></div>
      <p class="photo-modal-description"></p>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener('click', (event) => {
    if (event.target === modal || event.target.closest('.photo-modal-close')) closePhotoModal();
  });
  return modal;
}

function closePhotoModal() {
  const modal = document.getElementById('photoModal');
  modal?.classList.remove('open');
  document.body.classList.remove('modal-open');
}

routeLinks.forEach((link) => link.addEventListener('click', () => showView(link.dataset.route)));
window.addEventListener('hashchange', () => showView(location.hash.slice(1)));

document.querySelectorAll('.filter-button').forEach((button) => {
  // store original label for fallback
  if (!button.dataset.originalLabel) button.dataset.originalLabel = button.textContent.trim();
  button.addEventListener('click', () => {
    document.querySelectorAll('.filter-button').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');

    // if the button has a data-place, use place filtering
    if (button.dataset.place) {
      state.filter = `place:${button.dataset.place}`;
    } else {
      state.filter = button.dataset.filter;
    }

    renderWorks();
  });
});

pauseButton.addEventListener('click', () => {
  state.paused = !state.paused;
  pauseButton.textContent = state.paused ? '自動再生を開始' : '自動再生を停止';
});
previousButton.addEventListener('click', () => nudgeRows(-1));
nextButton.addEventListener('click', () => nudgeRows(1));
window.addEventListener('resize', () => { state.lastFrame = 0; });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closePhotoModal(); });

menuButton.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
  document.body.classList.toggle('menu-open');
});

let dragStart = null;
carousel.addEventListener('pointerdown', (event) => { dragStart = event.clientX; carousel.classList.add('dragging'); carousel.setPointerCapture(event.pointerId); });
carousel.addEventListener('pointerup', (event) => {
  if (dragStart !== null && Math.abs(event.clientX - dragStart) > 35) nudgeRows(event.clientX < dragStart ? 1 : -1);
  dragStart = null;
  carousel.classList.remove('dragging');
});
carousel.addEventListener('pointercancel', () => { dragStart = null; carousel.classList.remove('dragging'); });

async function loadWorks() {
  try {
    const response = await fetch('./works.json');
    if (!response.ok) throw new Error('作品データを読み込めませんでした。');
    state.works = await response.json();

    // ensure each work has _placeTokens before rendering
    state.works.forEach((w) => { w._placeTokens = getPlaceTokensFromFilename(w.image); });

    renderWorks();
    state.animationFrame = requestAnimationFrame(animateRows);
  } catch (error) {
    rowsRoot.innerHTML = `<p>作品データを読み込めませんでした。works.jsonをご確認ください。</p>`;
    console.error(error);
  }
}

showView(location.hash.slice(1) || 'home');
loadWorks();
