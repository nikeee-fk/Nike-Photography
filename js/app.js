const state = {
  works: [],
  filtered: [],
  currentIndex: 0,
  paused: false,
  filter: "all",
  autoTimer: null
};

const views = document.querySelectorAll("[data-view]");
const routeLinks = document.querySelectorAll("[data-route]");
const track = document.getElementById("worksTrack");
const carousel = document.getElementById("carousel");
const counter = document.getElementById("worksCounter");
const pauseButton = document.getElementById("pauseButton");
const previousButton = document.getElementById("previousButton");
const nextButton = document.getElementById("nextButton");
const mobileMenu = document.getElementById("mobileMenu");
const menuButton = document.getElementById("menuButton");

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

function renderWorks() {
  state.filtered = state.filter === "all"
    ? state.works
    : state.works.filter((work) => work.category === state.filter);

  track.innerHTML = state.filtered.map((work, index) => `
    <article class="work-card" data-index="${index}">
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
  `).join("");

  track.querySelectorAll(".work-card").forEach((card) => {
    card.addEventListener("click", () => goTo(Number(card.dataset.index)));
  });
  state.currentIndex = 0;
  updatePosition();
}

function updatePosition() {
  const card = track.querySelector(".work-card");
  if (!card) return;
  const gap = 18;
  const offset = state.currentIndex * (card.getBoundingClientRect().width + gap);
  track.style.transform = `translate3d(-${offset}px, 0, 0)`;
  counter.textContent = `${String(state.currentIndex + 1).padStart(2, "0")} / ${String(state.filtered.length).padStart(2, "0")}`;
}

function goTo(index) {
  if (!state.filtered.length) return;
  state.currentIndex = (index + state.filtered.length) % state.filtered.length;
  updatePosition();
}

function next() { goTo(state.currentIndex + 1); }
function previous() { goTo(state.currentIndex - 1); }

function startAutoPlay() {
  clearInterval(state.autoTimer);
  state.autoTimer = setInterval(() => {
    if (!state.paused && !document.hidden) next();
  }, 4200);
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
previousButton.addEventListener("click", previous);
nextButton.addEventListener("click", next);
window.addEventListener("resize", updatePosition);

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
    if (Math.abs(distance) > 45) distance < 0 ? next() : previous();
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
    track.innerHTML = `<p>作品データを読み込めませんでした。works.jsonをご確認ください。</p>`;
    console.error(error);
  }
}

showView(location.hash.slice(1) || "home");
loadWorks();
