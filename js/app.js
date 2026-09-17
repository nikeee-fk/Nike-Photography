const ROW_COUNT = 5;
const WORKS_PER_ROW = 8;
const AUTO_SCROLL_SPEED = 0.7;

const state = {
  works: [],
  filtered: [],
  currentFilter: "all",
  currentIndex: 0,
  rowOffsets: [],
  paused: false,
  lastTimestamp: 0,
  rafId: null,
};

const worksGrid = document.getElementById("worksGrid");
const worksList = document.getElementById("worksList");
const loadMoreButton = document.getElementById("loadMoreButton");
const filterButtons = document.querySelectorAll(".filter-button");
const viewButtons = document.querySelectorAll(".view-button");
const menuButton = document.getElementById("menuButton");
const mobileMenu = document.getElementById("mobileMenu");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxTitle = document.getElementById("lightboxTitle");
const lightboxCounter = document.getElementById("lightboxCounter");
const lightboxDescription = document.getElementById("lightboxDescription");
const lightboxClose = document.getElementById("lightboxClose");
const lightboxPrev = document.getElementById("lightboxPrev");
const lightboxNext = document.getElementById("lightboxNext");

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getFilteredWorks() {
  return state.currentFilter === "all"
    ? state.works
    : state.works.filter((work) => work.category === state.currentFilter);
}

function updateVisibleCount() {
  const total = state.filtered.length;
  if (total <= WORKS_PER_ROW * ROW_COUNT) {
    loadMoreButton.style.display = "none";
    return;
  }
  loadMoreButton.style.display = "inline-flex";
}

function renderWorks() {
  state.filtered = getFilteredWorks();
  updateVisibleCount();

  const visibleWorks = state.filtered.slice(0, WORKS_PER_ROW * ROW_COUNT);

  worksGrid.innerHTML = "";
  worksList.innerHTML = "";

  visibleWorks.forEach((work, index) => {
    const item = document.createElement("article");
    item.className = "work-item";
    item.innerHTML = `
      <div class="work-image-wrap">
        <img src="${work.image}" alt="${escapeHtml(work.title)}" loading="lazy" />
        <div class="work-overlay">
          <div>
            <h3 class="work-title">${escapeHtml(work.title)}</h3>
            <p class="work-description">${escapeHtml(work.description)}</p>
          </div>

          <div class="work-meta">
            <span>${escapeHtml(work.location)}</span>
            <span>${escapeHtml(work.year)}</span>
          </div>
        </div>
      </div>

      <div class="work-info">
        <div class="work-text-main">${escapeHtml(work.title)}</div>
        <div class="work-meta-text">${escapeHtml(work.year)}</div>
      </div>
    `;

    item.addEventListener("click", () => openLightbox(state.filtered.indexOf(work)));
    worksGrid.appendChild(item);

    const listRow = document.createElement("article");
    listRow.className = "list-row";
    listRow.innerHTML = `
      <span class="list-index">${String(index + 1).padStart(2, "0")}</span>
      <span class="list-title">${escapeHtml(work.title)}</span>
      <span class="list-category">${escapeHtml(work.categoryLabel)} / ${escapeHtml(work.location)}</span>
      <span class="list-year">${escapeHtml(work.year)}</span>
    `;

    listRow.addEventListener("click", () => openLightbox(state.filtered.indexOf(work)));
    worksList.appendChild(listRow);
  });
}

function openLightbox(index) {
  const currentItem = state.filtered[index];
  if (!currentItem) return;

  state.currentIndex = index;
  lightboxImage.src = currentItem.image;
  lightboxImage.alt = currentItem.title;
  lightboxTitle.textContent = `${currentItem.title} / ${currentItem.location} / ${currentItem.year}`;
  lightboxCounter.textContent = `${String(index + 1).padStart(2, "0")} / ${String(state.filtered.length).padStart(2, "0")}`;
  lightboxDescription.textContent = currentItem.description;
  lightbox.classList.add("open");
  document.body.classList.add("locked");
}

function closeLightbox() {
  lightbox.classList.remove("open");
  document.body.classList.remove("locked");
}

function showNext() {
  if (!state.filtered.length) return;
  state.currentIndex = (state.currentIndex + 1) % state.filtered.length;
  openLightbox(state.currentIndex);
}

function showPrev() {
  if (!state.filtered.length) return;
  state.currentIndex = (state.currentIndex - 1 + state.filtered.length) % state.filtered.length;
  openLightbox(state.currentIndex);
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    state.currentFilter = button.dataset.filter;
    renderWorks();
  });
});

viewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    viewButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");

    const selectedView = button.dataset.view;
    const root = document.querySelector(".works-wrap");
    if (selectedView === "list") {
      root.classList.add("list-mode");
    } else {
      root.classList.remove("list-mode");
    }
  });
});

loadMoreButton.addEventListener("click", () => {
  const nextCount = Math.min(state.filtered.length, WORKS_PER_ROW * ROW_COUNT + WORKS_PER_ROW * ROW_COUNT);
  const visibleWorks = state.filtered.slice(0, nextCount);
  worksGrid.innerHTML = "";
  worksList.innerHTML = "";

  visibleWorks.forEach((work, index) => {
    const item = document.createElement("article");
    item.className = "work-item";
    item.innerHTML = `
      <div class="work-image-wrap">
        <img src="${work.image}" alt="${escapeHtml(work.title)}" loading="lazy" />
        <div class="work-overlay">
          <div>
            <h3 class="work-title">${escapeHtml(work.title)}</h3>
            <p class="work-description">${escapeHtml(work.description)}</p>
          </div>
          <div class="work-meta">
            <span>${escapeHtml(work.location)}</span>
            <span>${escapeHtml(work.year)}</span>
          </div>
        </div>
      </div>
      <div class="work-info">
        <div class="work-text-main">${escapeHtml(work.title)}</div>
        <div class="work-meta-text">${escapeHtml(work.year)}</div>
      </div>
    `;
    item.addEventListener("click", () => openLightbox(state.filtered.indexOf(work)));
    worksGrid.appendChild(item);

    const listRow = document.createElement("article");
    listRow.className = "list-row";
    listRow.innerHTML = `
      <span class="list-index">${String(index + 1).padStart(2, "0")}</span>
      <span class="list-title">${escapeHtml(work.title)}</span>
      <span class="list-category">${escapeHtml(work.categoryLabel)} / ${escapeHtml(work.location)}</span>
      <span class="list-year">${escapeHtml(work.year)}</span>
    `;
    listRow.addEventListener("click", () => openLightbox(state.filtered.indexOf(work)));
    worksList.appendChild(listRow);
  });

  if (visibleWorks.length >= state.filtered.length) {
    loadMoreButton.style.display = "none";
  }
});

lightboxClose.addEventListener("click", closeLightbox);
lightboxPrev.addEventListener("click", showPrev);
lightboxNext.addEventListener("click", showNext);
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});
document.addEventListener("keydown", (event) => {
  if (!lightbox.classList.contains("open")) return;
  if (event.key === "Escape") closeLightbox();
  if (event.key === "ArrowRight") showNext();
  if (event.key === "ArrowLeft") showPrev();
});

menuButton.addEventListener("click", () => {
  mobileMenu.classList.toggle("open");
});
mobileMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => mobileMenu.classList.remove("open"));
});

async function loadWorks() {
  try {
    const response = await fetch("./works.json");
    if (!response.ok) throw new Error("works.json not found");

    state.works = await response.json();
    state.filtered = [...state.works];
    renderWorks();
  } catch (error) {
    console.error(error);
    worksGrid.innerHTML = "<div style='padding:20px;color:#666;'>Failed to load works.json.</div>";
  }
}

loadWorks();
