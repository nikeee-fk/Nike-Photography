const state = {
  works: [],
  filtered: [],
  rowPositions: [],
  paused: false,
  filter: "all",
  autoTimer: null,
  animationFrame: null,
  lastFrame: 0,
  rowOffsets: [],
  activeProjectId: null
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
const projectView = document.querySelector('[data-view="project"]');
const projectTitle = document.getElementById("projectTitle");
const projectLocation = document.getElementById("projectLocation");
const projectYear = document.getElementById("projectYear");
const projectCategory = document.getElementById("projectCategory");
const projectIntro = document.getElementById("projectIntro");
const projectGallery = document.getElementById("projectGallery");
const projectKicker = document.getElementById("projectKicker");
const projectBackLink = document.getElementById("projectBackLink");
const projectNextLink = document.querySelector(".project-next-link");
const projectInfoLocation = document.getElementById("projectInfoLocation");
const projectInfoSeason = document.getElementById("projectInfoSeason");
const projectInfoFormat = document.getElementById("projectInfoFormat");
const projectInfoArchive = document.getElementById("projectInfoArchive");
const projectNextTitle = document.getElementById("projectNextTitle");
const projectNextLocation = document.getElementById("projectNextLocation");

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
  const latin = base.match(/[a-zA-Z\u00C0-\u024F]+/g);
  if (latin && latin.length) return latin.map((token) => token.toLowerCase());
  const cjk = base.match(/[\u4E00-\u9FFF\u3040-\u30FF\u3000-\u303F]+/g);
  if (cjk) return cjk;
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
        button.textContent = `ALL — ${tokens.map((token) => String(token).toUpperCase()).join(', ')}`;
        button.removeAttribute('data-place');
      } else {
        button.textContent = 'ALL';
        button.removeAttribute('data-place');
      }
      return;
    }

    const tokens = placesMap[filter] || [];
    if (tokens.length) {
      button.textContent = String(tokens[0]).toUpperCase();
      button.dataset.place = tokens[0];
    } else {
      const original = button.dataset.originalLabel || button.textContent || filter.toUpperCase();
      button.textContent = original;
      button.removeAttribute('data-place');
    }
  });
}

function showView(route) {
  const target = ["home", "author", "works", "contact", "project"].includes(route) ? route : "home";
  views.forEach((view) => {
    view.hidden = view.dataset.view !== target;
  });
  routeLinks.forEach((link) => {
    const isActive = link.dataset.route === target;
    link.classList.toggle("active", isActive);
  });
  mobileMenu.classList.remove("open");
  document.body.classList.remove("menu-open");
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function distributeIntoRows(items) {
  const rows = Array.from({ length: ROW_COUNT }, () => []);
  items.forEach((item, index) => rows[index % ROW_COUNT].push(item));
  return rows;
}

function renderWorks() {
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
            <article class="work-card work-card--${work.category === 'mountain' ? 'feature' : work.category === 'ocean' ? 'wide' : work.category === 'forest' ? 'portrait' : 'compact'}" data-id="${escapeHtml(work.id)}">
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
    card.addEventListener('click', () => openProject(card.dataset.id));
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
    row.querySelector('.carousel-row-track').style.transform = `translate3d(${-state.rowOffsets[index]}px, 0, 0)`;
  });
}

function buildProjectGallery(work) {
  const galleryItems = [
    { className: 'project-photo project-photo--hero' },
    { className: 'project-photo project-photo--tall' },
    { className: 'project-photo project-photo--split' },
    { className: 'project-photo project-photo--wide' }
  ];

  projectGallery.innerHTML = galleryItems.map((item, index) => `
    <figure class="${item.className}">
      <img src="${escapeHtml(work.image)}" alt="${escapeHtml(work.title)}" loading="lazy" />
    </figure>
  `).join('');
}

function openProject(id) {
  const work = state.filtered.find((item) => item.id === id) || state.works.find((item) => item.id === id);
  if (!work) return;

  const projectItems = state.filtered.length ? state.filtered : state.works;
  const currentIndex = projectItems.findIndex((item) => item.id === work.id);
  const next = projectItems[(currentIndex + 1) % projectItems.length] || work;

  state.activeProjectId = work.id;
  projectTitle.textContent = work.title;
  projectLocation.textContent = work.location;
  projectYear.textContent = work.year;
  projectCategory.textContent = work.categoryLabel;
  projectKicker.textContent = `Project / ${work.year}`;
  projectIntro.textContent = work.description;
  projectInfoLocation.textContent = work.location;
  projectInfoSeason.textContent = work.categoryLabel;
  projectInfoFormat.textContent = 'Digital';
  projectInfoArchive.textContent = work.year;
  projectNextTitle.textContent = next.title;
  projectNextLocation.textContent = `${next.location} / ${next.year}`;
  projectNextLink.dataset.projectId = next.id;
  projectNextLink.href = '#project';

  buildProjectGallery(work);
  showView('project');
  location.hash = 'project';
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

routeLinks.forEach((link) => {
  link.addEventListener('click', () => {
    const route = link.dataset.route;
    if (route === 'works' || route === 'author' || route === 'contact' || route === 'home') {
      showView(route);
      location.hash = route === 'home' ? '' : route;
    }
  });
});

window.addEventListener('hashchange', () => {
  const hash = location.hash.slice(1);
  if (hash === 'project') {
    const id = state.activeProjectId || state.filtered[0]?.id || state.works[0]?.id;
    if (id) openProject(id);
    return;
  }
  showView(hash || 'home');
});

document.querySelectorAll('.filter-button').forEach((button) => {
  if (!button.dataset.originalLabel) button.dataset.originalLabel = button.textContent.trim();
  button.addEventListener('click', () => {
    document.querySelectorAll('.filter-button').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');

    if (button.dataset.place) {
      state.filter = `place:${button.dataset.place}`;
    } else {
      state.filter = button.dataset.filter;
    }

    renderWorks();
    if (state.filtered.length) {
      state.activeProjectId = state.filtered[0].id;
    }
  });
});

pauseButton.addEventListener('click', () => {
  state.paused = !state.paused;
  pauseButton.textContent = state.paused ? '自動再生を開始' : '自動再生を停止';
});
previousButton.addEventListener('click', () => nudgeRows(-1));
nextButton.addEventListener('click', () => nudgeRows(1));
window.addEventListener('resize', () => { state.lastFrame = 0; });
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (document.getElementById('photoModal')?.classList.contains('open')) {
      closePhotoModal();
      return;
    }
    if (!projectView.hidden) {
      showView('works');
      location.hash = '#works';
    }
  }
});

menuButton.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
  document.body.classList.toggle('menu-open');
});

let dragStart = null;
carousel.addEventListener('pointerdown', (event) => {
  dragStart = event.clientX;
  carousel.classList.add('dragging');
  carousel.setPointerCapture(event.pointerId);
});
carousel.addEventListener('pointerup', (event) => {
  if (dragStart !== null && Math.abs(event.clientX - dragStart) > 35) nudgeRows(event.clientX < dragStart ? 1 : -1);
  dragStart = null;
  carousel.classList.remove('dragging');
});
carousel.addEventListener('pointercancel', () => {
  dragStart = null;
  carousel.classList.remove('dragging');
});

projectBackLink.addEventListener('click', () => {
  showView('works');
  location.hash = '#works';
});

if (projectNextLink) {
  projectNextLink.addEventListener('click', (event) => {
    const nextId = projectNextLink.dataset.projectId;
    if (!nextId) {
      event.preventDefault();
      showView('works');
      location.hash = '#works';
      return;
    }
    event.preventDefault();
    openProject(nextId);
  });
}

async function loadWorks() {
  try {
    const response = await fetch('./works.json');
    if (!response.ok) throw new Error('作品データを読み込めませんでした。');
    state.works = await response.json();
    state.works.forEach((work) => { work._placeTokens = getPlaceTokensFromFilename(work.image); });
    renderWorks();
    if (state.works.length) {
      state.activeProjectId = state.works[0].id;
    }
    state.animationFrame = requestAnimationFrame(animateRows);
  } catch (error) {
    rowsRoot.innerHTML = `<p>作品データを読み込めませんでした。works.jsonをご確認ください。</p>`;
    console.error(error);
  }
}

showView(location.hash.slice(1) || 'home');
loadWorks();

window.addEventListener('load', () => {
  if (location.hash === '#project') {
    const fallbackId = state.activeProjectId || state.filtered[0]?.id || state.works[0]?.id;
    if (fallbackId) openProject(fallbackId);
  }
});

projectView?.addEventListener('click', (event) => {
  const image = event.target.closest('.project-photo img');
  if (!image) return;
  const card = image.closest('.project-photo');
  if (!card) return;
  const work = state.filtered.find((item) => item.id === state.activeProjectId) || state.works.find((item) => item.id === state.activeProjectId);
  if (!work) return;
  openPhoto(work.id);
});

if (projectView) {
  projectView.hidden = true;
}
