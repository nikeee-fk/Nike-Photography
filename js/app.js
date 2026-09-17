const state = {
  works: [],
  filtered: [],
  rowPositions: [],
  paused: false,
  filter: "all",
  autoTimer: null
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
const AUTOPLAY_MS = 2000;

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showView(route) {
  const target = route === "author" || route === "works" ? route : "home";
  views.forEach((view) => {
    view.hidden = view.dataset.view !== target;
  });
  routeLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.route === target);
  });
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
  state.filtered = state.filter === "all"
    ? state.works
    : state.works.filter((work) => work.category === state.filter);

  const rows = distributeIntoRows(state.filtered);
  state.rowPositions = rows.map(() => 0);

  rowsRoot.innerHTML = rows.map((row, rowIndex) => `
    <div class="carousel-row" data-row="${rowIndex}">
      <div class="carousel-row-track">
        ${row.map((work) => `
          <article class="work-card">
            <img src="${escapeHtml(work.image)}" alt="${escapeHtml(work.title)}" loading="lazy" />
            <div class="work-card-info">
              <h3 class="work-card-title">${escapeHtml(work.title)}</h3>
              <p class="work-card-description">${escapeHtml(work.description)}</p>
              <div class="work-card-meta">
                <span>${escapeHtml(work.location)}</span>
                <span>${escapeHtml(work.year)}</span>
                <span>${escapeHtml(work.categoryLabel)}</span>
              </div>
            </div>
          </article>
        `).join("")}
      </div>
    </div>
  `).join("");

  updatePositions();
  updateCounter();
}

function updatePositions() {
  rowsRoot.querySelectorAll(".carousel-row").forEach((row, rowIndex) => {
    const track = row.querySelector(".carousel-row-track");
    const card = track?.querySelector(".work-card");
    if (!card) return;
    const gap = 14;
    const distance = card.getBoundingClientRect().width + gap;
    track.style.transform = `translate3d(-${state.rowPositions[rowIndex] * distance}px, 0, 0)`;
  });
}

function updateCounter() {
  const total = state.filtered.length;
  const current = total ? Math.min(state.rowPositions.reduce((sum, value) => sum + value, 0) + 1, total) : 0;
  counter.textContent = `${String(current).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
}

function shiftRows(direction) {
  const rows = rowsRoot.querySelectorAll(".carousel-row");
  rows.forEach((row, rowIndex) => {
    const count = row.querySelectorAll(".work-card").length;
    if (!count) return;
    state.rowPositions[rowIndex] = (state.rowPositions[rowIndex] + direction + count) % count;
  });
  updatePositions();
  updateCounter();
}

function startAutoPlay() {
  clearInterval(state.autoTimer);
  state.autoTimer = setInterval(() => {
    if (!state.paused && !document.hidden) shiftRows(1);
  }, AUTOPLAY_MS);
}

routeLinks.forEach((link) => {
  link.addEventListener("click", () => showView(link.dataset.route));
});

window.addEventListener("hashchange", () => showView(location.hash.slice(1)));

document.querySelectorAll(".filter-button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter-button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    state.filter = button.dataset.filter;
    renderWorks();
  });
});

pauseButton.addEventListener("click", () => {
  state.paused = !state.paused;
  pauseButton.textContent = state.paused ? "自動再生を開始" : "自動再生を停止";
});
previousButton.addEventListener("click", () => shiftRows(-1));
nextButton.addEventListener("click", () => shiftRows(1));
window.addEventListener("resize", updatePositions);

menuButton.addEventListener("click", () => {
  mobileMenu.classList.toggle("open");
  document.body.classList.toggle("menu-open");
});

let dragStart = null;
carousel.addEventListener("pointerdown", (event) => {
  dragStart = event.clientX;
  carousel.classList.add("dragging");
  carousel.setPointerCapture(event.pointerId);
});
carousel.addEventListener("pointerup", (event) => {
  if (dragStart !== null) {
    const distance = event.clientX - dragStart;
    if (Math.abs(distance) > 45) distance < 0 ? shiftRows(1) : shiftRows(-1);
  }
  dragStart = null;
  carousel.classList.remove("dragging");
});
carousel.addEventListener("pointercancel", () => {
  dragStart = null;
  carousel.classList.remove("dragging");
});

async function loadWorks() {
  try {
    const response = await fetch("./works.json");
    if (!response.ok) throw new Error("作品データを読み込めませんでした。");
    state.works = await response.json();
    renderWorks();
    startAutoPlay();
  } catch (error) {
    rowsRoot.innerHTML = `<p>作品データを読み込めませんでした。works.jsonをご確認ください。</p>`;
    console.error(error);
  }
}

showView(location.hash.slice(1) || "home");
loadWorks();
