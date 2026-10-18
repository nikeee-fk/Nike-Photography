const state = {
  works: [],
  projects: [],
  filtered: [],
  rowPositions: [],
  paused: false,
  filter: "all",
  lastFilter: "all",
  currentProject: null,
  currentProjectImages: [],
  animationFrame: null,
  lastFrame: 0,
  rowOffsets: [],
  projectLightbox: null,
  projectLightboxIndex: 0
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
const projectView = document.querySelector(".project-view");

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

function routeFromHash(hashValue = location.hash.slice(1)) {
  const value = hashValue || "home";
  if (value.startsWith("project/")) return "project";
  return value === "author" || value === "works" || value === "contact" || value === "home" ? value : "home";
}

function getProjectBySlug(slug) {
  return state.projects.find((project) => project.slug === slug) || null;
}

function hydrateProjects() {
  if (!state.projects.length) return;

  state.projects = state.projects.map((project) => {
    const images = state.works
      .filter((work) => work.category === project.category)
      .map((work) => ({
        id: work.id,
        src: work.image,
        title: work.title,
        location: work.location,
        year: work.year,
        description: work.description
      }));

    return {
      ...project,
      images: images.length ? images : []
    };
  });
}

function findProjectForWork(work) {
  return state.projects.find((project) => project.category === work.category) || null;
}

function renderProjectPage(projectSlug) {
  const project = getProjectBySlug(projectSlug) || state.projects[0];
  if (!project) return;

  const images = project.images && project.images.length ? project.images : [];
  const hero = images[0] || null;
  const secondary = images.slice(1, 5);
  const meta = [
    { label: "Location", value: project.location },
    { label: "Year", value: project.year },
    { label: "Category", value: project.category },
    { label: "Medium", value: "Photography" }
  ];

  const galleryMarkup = images.length
    ? images.map((image, index) => {
        const variant = index === 0 ? "hero" : index % 3 === 0 ? "wide" : index % 2 === 0 ? "tall" : "split";
        return `
          <figure class="project-photo project-photo--${variant}" data-index="${index}" data-project="${escapeHtml(project.slug)}">
            <img src="${escapeHtml(image.src)}" alt="${escapeHtml(image.title)}" loading="lazy" />
          </figure>
        `;
      }).join("")
    : `
      <div class="project-empty-state">
        <p>Currently no images are assigned to this project in the published data.</p>
      </div>
    `;

  const nextProject = getNextProject(project.slug);

  projectView.innerHTML = `
    <div class="project-shell">
      <header class="project-header">
        <div class="project-heading-kicker">01 / PHOTOGRAPHIC SERIES</div>
        <div class="project-header-row">
          <div class="project-heading-wrap">
            <h2 class="project-heading">${escapeHtml(project.title)}</h2>
          </div>
          <a class="project-back-link" href="#works">← ALL WORKS</a>
        </div>
        <div class="project-meta-summary">
          <div>${escapeHtml(project.location)}</div>
          <div>${escapeHtml(project.year)}</div>
        </div>
      </header>

      <div class="project-intro">
        <p>${escapeHtml(project.description)}</p>
      </div>

      <div class="project-gallery">
        ${galleryMarkup}
      </div>

      <div class="project-info-block">
        <div class="project-info-title">PROJECT INFORMATION</div>
        <div class="project-info-grid">
          ${meta.map((item) => `
            <div class="project-info-row">
              <span>${escapeHtml(item.label)}</span>
              <strong>${escapeHtml(item.value)}</strong>
            </div>
          `).join("")}
        </div>
      </div>

      <div class="project-next">
        <div class="project-next-label">NEXT PROJECT</div>
        <a href="#project/${escapeHtml(nextProject.slug)}" class="project-next-link">
          <span class="project-next-title">${escapeHtml(nextProject.title)}</span>
          <span class="project-next-location">${escapeHtml(nextProject.location)}</span>
          <span class="project-next-arrow">→</span>
        </a>
      </div>
    </div>
  `;

  const photoNodes = projectView.querySelectorAll(".project-photo");
  photoNodes.forEach((node) => {
    node.addEventListener("click", () => {
      const index = Number(node.dataset.index || 0);
      openProjectLightbox(project.slug, index);
    });
  });

  const backLink = projectView.querySelector(".project-back-link");
  if (backLink) {
    backLink.addEventListener("click", (event) => {
      event.preventDefault();
      const targetFilter = state.lastFilter || "all";
      state.filter = targetFilter;
      if (document.querySelector(`.filter-button[data-filter="${targetFilter}"]`)) {
        document.querySelectorAll(".filter-button").forEach((button) => button.classList.toggle("active", button.dataset.filter === targetFilter));
      }
      location.hash = "#works";
      showView("works");
    });
  }

  const nextLink = projectView.querySelector(".project-next-link");
  if (nextLink) {
    nextLink.addEventListener("click", () => {
      state.lastFilter = state.filter;
    });
  }

  state.currentProject = project;
  state.currentProjectImages = images;
}

function getNextProject(currentSlug) {
  const list = state.projects.length ? state.projects : [];
  if (!list.length) {
    return {
      slug: "mountain-studies",
      title: "MOUNTAIN STUDIES",
      location: "Nagano / Japan"
    };
  }
  const currentIndex = list.findIndex((project) => project.slug === currentSlug);
  const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % list.length : 0;
  return list[nextIndex];
}

function showView(route) {
  const normalized = route || "home";
  const resolved = routeFromHash(normalized);

  const target = resolved === "project" ? "project" : resolved;
  views.forEach((view) => {
    const match = view.dataset.view === target;
    view.hidden = !match;
    if (match && view.dataset.view === "project") {
      const slug = normalized.startsWith("project/") ? normalized.replace("project/", "") : (state.currentProject ? state.currentProject.slug : "");
      if (slug) renderProjectPage(slug);
    }
  });

  routeLinks.forEach((link) => {
    const activeRoute = resolved === "project" ? "works" : resolved;
    link.classList.toggle("active", link.dataset.route === activeRoute);
  });

  if (resolved === "works" && rowsRoot && state.works.length) {
    renderWorks();
  }

  if (resolved !== "project" && projectView) {
    projectView.innerHTML = "";
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function distributeIntoRows(items) {
  const rows = Array.from({ length: ROW_COUNT }, () => []);
  items.forEach((item, index) => rows[index % ROW_COUNT].push(item));
  return rows;
}

function renderWorks() {
  state.filtered = state.filter === "all" ? state.works : state.works.filter((work) => work.category === state.filter);
  const rows = distributeIntoRows(state.filtered);
  state.rowOffsets = rows.map(() => 0);

  rowsRoot.innerHTML = rows.map((row, rowIndex) => {
    const repeated = [...row, ...row];
    return `
      <div class="carousel-row" data-row="${rowIndex}">
        <div class="carousel-row-track">
          ${repeated.map((work) => {
            const project = findProjectForWork(work);
            return `
              <article class="work-card" data-id="${escapeHtml(work.id)}">
                <img src="${escapeHtml(work.image)}" alt="${escapeHtml(work.title)}" loading="lazy" />
                <div class="work-card-info">
                  <h3 class="work-card-title">${escapeHtml(work.title)}</h3>
                  <p class="work-card-description">${escapeHtml(work.description)}</p>
                  <div class="work-card-meta"><span>${escapeHtml(work.location)}</span><span>${escapeHtml(work.year)}</span><span>${escapeHtml(work.categoryLabel)}</span></div>
                  ${project ? `<button class="work-card-action" type="button" data-project-slug="${escapeHtml(project.slug)}">View series</button>` : ""}
                </div>
              </article>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }).join("");

  rowsRoot.querySelectorAll(".work-card").forEach((card) => {
    card.addEventListener("click", (event) => {
      if (event.target.closest(".work-card-action")) return;
      const workId = card.dataset.id;
      const work = state.filtered.find((item) => item.id === workId) || state.works.find((item) => item.id === workId);
      if (work) openPhoto(work.id);
    });
  });

  rowsRoot.querySelectorAll(".work-card-action").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const slug = button.dataset.projectSlug;
      if (slug) {
        state.lastFilter = state.filter;
        location.hash = `#project/${slug}`;
        showView(`project/${slug}`);
      }
    });
  });

  updateCounter();
}

function getRowLoopWidth(row) {
  const track = row.querySelector(".carousel-row-track");
  const cards = track?.querySelectorAll(".work-card");
  if (!track || !cards?.length) return 0;
  return track.scrollWidth / 2;
}

function animateRows(timestamp) {
  if (!state.lastFrame) state.lastFrame = timestamp;
  const elapsed = Math.min(timestamp - state.lastFrame, 64);
  state.lastFrame = timestamp;

  if (!state.paused && !document.hidden) {
    rowsRoot.querySelectorAll(".carousel-row").forEach((row, index) => {
      const loopWidth = getRowLoopWidth(row);
      if (!loopWidth) return;
      const direction = index % 2 === 0 ? 1 : -1;
      state.rowOffsets[index] = (state.rowOffsets[index] + direction * SPEED * elapsed / 1000) % loopWidth;
      if (state.rowOffsets[index] < 0) state.rowOffsets[index] += loopWidth;
      row.querySelector(".carousel-row-track").style.transform = `translate3d(${-state.rowOffsets[index]}px, 0, 0)`;
    });
  }
  state.animationFrame = requestAnimationFrame(animateRows);
}

function updateCounter() {
  const total = state.filtered.length;
  counter.textContent = `${total ? "01" : "00"} / ${String(total).padStart(2, "0")}`;
}

function nudgeRows(direction) {
  rowsRoot.querySelectorAll(".carousel-row").forEach((row, index) => {
    const cards = row.querySelectorAll(".work-card");
    if (!cards.length) return;
    const amount = cards[0].getBoundingClientRect().width + 14;
    const loopWidth = getRowLoopWidth(row);
    state.rowOffsets[index] = (state.rowOffsets[index] + direction * amount + loopWidth) % loopWidth;
  });
}

function openPhoto(id) {
  const work = state.filtered.find((item) => item.id === id) || state.works.find((item) => item.id === id);
  if (!work) return;
  const modal = document.getElementById("photoModal") || createPhotoModal();
  modal.querySelector(".photo-modal-image").src = work.image;
  modal.querySelector(".photo-modal-image").alt = work.title;
  modal.querySelector(".photo-modal-title").textContent = `${work.title} / ${work.location} / ${work.year}`;
  modal.querySelector(".photo-modal-description").textContent = work.description;
  modal.classList.add("open");
  document.body.classList.add("modal-open");
}

function createPhotoModal() {
  const modal = document.createElement("div");
  modal.id = "photoModal";
  modal.className = "photo-modal";
  modal.innerHTML = `
    <div class="photo-modal-inner" role="dialog" aria-modal="true" aria-label="作品の拡大表示">
      <button class="photo-modal-close" type="button" aria-label="閉じる">×</button>
      <img class="photo-modal-image" src="" alt="" />
      <div class="photo-modal-caption"><strong class="photo-modal-title"></strong><span>クリックまたはESCで閉じる</span></div>
      <p class="photo-modal-description"></p>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal || event.target.closest(".photo-modal-close")) closePhotoModal();
  });
  return modal;
}

function closePhotoModal() {
  const modal = document.getElementById("photoModal");
  modal?.classList.remove("open");
  document.body.classList.remove("modal-open");
}

function openProjectLightbox(projectSlug, startIndex = 0) {
  const project = getProjectBySlug(projectSlug);
  if (!project || !project.images || !project.images.length) return;

  const lightbox = document.getElementById("projectLightbox") || createProjectLightbox();
  state.projectLightboxIndex = Number.isInteger(startIndex) ? startIndex : 0;
  state.projectLightbox = { slug: project.slug, index: state.projectLightboxIndex };
  updateProjectLightbox();
  lightbox.classList.add("open");
  document.body.classList.add("modal-open");
}

function updateProjectLightbox() {
  const lightbox = document.getElementById("projectLightbox");
  const project = state.projectLightbox ? getProjectBySlug(state.projectLightbox.slug) : null;
  if (!lightbox || !project || !project.images || !project.images.length) return;

  const maxIndex = project.images.length - 1;
  const nextIndex = ((state.projectLightboxIndex % project.images.length) + project.images.length) % project.images.length;
  state.projectLightboxIndex = nextIndex;

  const image = project.images[nextIndex];
  const imageEl = lightbox.querySelector(".project-lightbox-image");
  const countEl = lightbox.querySelector(".project-lightbox-counter");
  const captionEl = lightbox.querySelector(".project-lightbox-caption");

  imageEl.src = image.src;
  imageEl.alt = image.title;
  countEl.textContent = `${nextIndex + 1} / ${project.images.length}`;
  captionEl.textContent = `${image.title} / ${image.location} / ${image.year}`;
}

function stepProjectLightbox(direction) {
  if (!state.projectLightbox) return;
  const project = getProjectBySlug(state.projectLightbox.slug);
  if (!project || !project.images || !project.images.length) return;
  state.projectLightboxIndex = (state.projectLightboxIndex + direction + project.images.length) % project.images.length;
  updateProjectLightbox();
}

function createProjectLightbox() {
  const lightbox = document.createElement("div");
  lightbox.id = "projectLightbox";
  lightbox.className = "project-lightbox";
  lightbox.innerHTML = `
    <div class="project-lightbox-shell" role="dialog" aria-modal="true" aria-label="Project image viewer">
      <button class="project-lightbox-close" type="button" aria-label="Close">×</button>
      <button class="project-lightbox-nav project-lightbox-prev" type="button" aria-label="Previous image">←</button>
      <img class="project-lightbox-image" src="" alt="" />
      <button class="project-lightbox-nav project-lightbox-next" type="button" aria-label="Next image">→</button>
    </div>
    <div class="project-lightbox-meta">
      <span class="project-lightbox-counter">1 / 1</span>
      <span class="project-lightbox-caption"></span>
    </div>
  `;
  document.body.appendChild(lightbox);

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox || event.target.closest(".project-lightbox-close")) {
      closeProjectLightbox();
    }
  });

  const prevButton = lightbox.querySelector(".project-lightbox-prev");
  const nextButton = lightbox.querySelector(".project-lightbox-next");
  prevButton.addEventListener("click", () => stepProjectLightbox(-1));
  nextButton.addEventListener("click", () => stepProjectLightbox(1));

  return lightbox;
}

function closeProjectLightbox() {
  const lightbox = document.getElementById("projectLightbox");
  lightbox?.classList.remove("open");
  state.projectLightbox = null;
  document.body.classList.remove("modal-open");
}

routeLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const route = link.dataset.route;
    if (route === "home" || route === "author" || route === "works" || route === "contact") {
      event.preventDefault();
      location.hash = route === "home" ? "#home" : `#${route}`;
      showView(route === "home" ? "home" : route);
    }
  });
});

window.addEventListener("hashchange", () => {
  const hashValue = location.hash.slice(1);
  const route = hashValue || "home";
  if (route.startsWith("project/")) {
    showView(route);
    return;
  }
  showView(route);
});

document.querySelectorAll(".filter-button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter-button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    state.filter = button.dataset.filter;
    state.lastFilter = state.filter;
    renderWorks();
  });
});

pauseButton.addEventListener("click", () => {
  state.paused = !state.paused;
  pauseButton.textContent = state.paused ? "自動再生を開始" : "自動再生を停止";
});
previousButton.addEventListener("click", () => nudgeRows(-1));
nextButton.addEventListener("click", () => nudgeRows(1));
window.addEventListener("resize", () => { state.lastFrame = 0; });
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closePhotoModal();
    closeProjectLightbox();
  }
  if (event.key === "ArrowLeft" && state.projectLightbox) stepProjectLightbox(-1);
  if (event.key === "ArrowRight" && state.projectLightbox) stepProjectLightbox(1);
});

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
  if (dragStart !== null && Math.abs(event.clientX - dragStart) > 35) nudgeRows(event.clientX < dragStart ? 1 : -1);
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
    hydrateProjects();
    renderWorks();
    if (state.projects.length && location.hash.startsWith("#project/")) {
      const slug = location.hash.slice(9);
      renderProjectPage(slug);
    }
    state.animationFrame = requestAnimationFrame(animateRows);
  } catch (error) {
    rowsRoot.innerHTML = `<p>作品データを読み込めませんでした。works.jsonをご確認ください。</p>`;
    console.error(error);
  }
}

async function loadProjects() {
  try {
    const response = await fetch("./projects.json");
    if (!response.ok) throw new Error("プロジェクトデータを読み込めませんでした。");
    state.projects = await response.json();
    hydrateProjects();
    if (location.hash.startsWith("#project/")) {
      const slug = location.hash.slice(9);
      renderProjectPage(slug);
    }
  } catch (error) {
    console.error(error);
  }
}

showView(location.hash.slice(1) || "home");
loadProjects();
loadWorks();
