const state = {
  works: [],
  filtered: [],
  filter: "all",
  paused: false,
  offsets: [],
  last: 0,
};

const ROWS = 5;
const SPEED = 18;
const FALLBACK_IMAGE = "images/DSC_0151.jpg";

const rows = document.getElementById("worksRows");
const pauseButton = document.getElementById("pauseButton");
const modal = document.getElementById("photoModal");
const modalImage = document.getElementById("modalImage");
const modalTitle = document.getElementById("modalTitle");
const modalCounter = document.getElementById("modalCounter");
const modalDescription = document.getElementById("modalDescription");
const views = document.querySelectorAll("[data-view]");
const routeLinks = document.querySelectorAll("[data-route]");

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[char]));
}

function showView(route) {
  const target = ["author", "works", "archive", "contact"].includes(route) ? route : "home";

  views.forEach((view) => {
    view.hidden = view.dataset.view !== target;
  });

  routeLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.route === target);
  });

  const mobileMenu = document.getElementById("mobileMenu");
  if (mobileMenu) mobileMenu.classList.remove("open");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

routeLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const route = link.dataset.route;
    if (!route) return;
    event.preventDefault();
    history.pushState({}, "", `#${route}`);
    showView(route);
  });
});

window.addEventListener("hashchange", () => showView(location.hash.slice(1)));
window.addEventListener("popstate", () => showView(location.hash.slice(1)));

function splitRows(items) {
  const grouped = Array.from({ length: ROWS }, () => []);
  items.forEach((item, index) => grouped[index % ROWS].push(item));
  return grouped;
}

function render() {
  const filtered = state.filter === "all"
    ? state.works
    : state.works.filter((item) => item.category === state.filter);

  state.filtered = filtered;
  state.offsets = Array(ROWS).fill(0);

  rows.innerHTML = splitRows(filtered)
    .map((row) => `
      <div class="carousel-row">
        <div class="carousel-row-track">
          ${[...row, ...row].map((item) => `
            <article class="work-card" data-id="${escapeHtml(item.id)}">
              <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" loading="lazy">
              <div class="work-card-info">
                <h3 class="work-card-title">${escapeHtml(item.title)}</h3>
                <p class="work-card-description">${escapeHtml(item.description)}</p>
                <div class="work-card-meta">
                  <span>${escapeHtml(item.location)}</span>
                  <span>${escapeHtml(item.year)}</span>
                </div>
              </div>
            </article>
          `).join("")}
        </div>
      </div>
    `).join("");

  rows.querySelectorAll(".work-card").forEach((card) => {
    card.addEventListener("click", () => openModal(card.dataset.id));
  });

  rows.querySelectorAll(".work-card img").forEach((img) => {
    img.addEventListener("error", () => {
      img.src = FALLBACK_IMAGE;
    }, { once: true });
  });
}

function getTrackWidth(row) {
  const track = row.querySelector(".carousel-row-track");
  return track ? track.scrollWidth / 2 : 0;
}

function animate(timestamp) {
  if (!state.last) state.last = timestamp;
  const delta = Math.min(timestamp - state.last, 64);
  state.last = timestamp;

  if (!state.paused && !document.hidden) {
    rows.querySelectorAll(".carousel-row").forEach((row, index) => {
      const width = getTrackWidth(row);
      if (!width) return;
      const direction = index % 2 === 0 ? 1 : -1;
      state.offsets[index] = (state.offsets[index] + direction * SPEED * delta / 1000 + width) % width;
      row.querySelector(".carousel-row-track").style.transform = `translate3d(${-state.offsets[index]}px, 0, 0)`;
    });
  }

  requestAnimationFrame(animate);
}

function openModal(id) {
  const item = state.filtered.find((entry) => entry.id === id);
  if (!item) return;

  const index = state.filtered.indexOf(item);

  modalImage.onerror = () => {
    modalImage.onerror = null;
    modalImage.src = FALLBACK_IMAGE;
  };

  modalImage.src = item.image;
  modalImage.alt = item.title;
  modalTitle.textContent = `${item.title} / ${item.location} / ${item.year}`;
  modalCounter.textContent = `${String(index + 1).padStart(2, "0")} / ${String(state.filtered.length).padStart(2, "0")}`;
  modalDescription.textContent = item.description;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("locked");
}

function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("locked");
}

document.querySelectorAll(".filter-button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter-button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    state.filter = button.dataset.filter;
    render();
  });
});

if (pauseButton) {
  pauseButton.addEventListener("click", () => {
    state.paused = !state.paused;
    pauseButton.textContent = state.paused ? "Resume motion" : "Pause motion";
  });
}

if (document.getElementById("modalClose")) {
  document.getElementById("modalClose").addEventListener("click", closeModal);
}

if (modal) {
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });
}

document.addEventListener("keydown", (event) => {
  if (!modal.classList.contains("open")) return;
  if (event.key === "Escape") closeModal();
});

const mobileMenu = document.getElementById("mobileMenu");
const menuButton = document.getElementById("menuButton");
if (menuButton && mobileMenu) {
  menuButton.addEventListener("click", () => {
    mobileMenu.classList.toggle("open");
  });
}

async function loadWorks() {
  try {
    const response = await fetch("./works.json?v=8");
    if (!response.ok) throw new Error("works.json not found");
    state.works = await response.json();
    render();
    requestAnimationFrame(animate);
  } catch (error) {
    console.error(error);
    if (rows) {
      rows.innerHTML = '<p class="works-note">Unable to load works.</p>';
    }
  }
}

showView(location.hash.slice(1) || "home");
loadWorks();
