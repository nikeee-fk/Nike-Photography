const projectView = document.querySelector('[data-view="project"]');
const projectTitle = document.getElementById('projectTitle');
const projectLocation = document.getElementById('projectLocation');
const projectYear = document.getElementById('projectYear');
const projectCategory = document.getElementById('projectCategory');
const projectIntro = document.getElementById('projectIntro');
const projectGallery = document.getElementById('projectGallery');
const projectKicker = document.getElementById('projectKicker');
const projectBackLink = document.getElementById('projectBackLink');
const projectInfoLocation = document.getElementById('projectInfoLocation');
const projectInfoSeason = document.getElementById('projectInfoSeason');
const projectInfoFormat = document.getElementById('projectInfoFormat');
const projectInfoArchive = document.getElementById('projectInfoArchive');
const projectNextTitle = document.getElementById('projectNextTitle');
const projectNextLocation = document.getElementById('projectNextLocation');

function showView(route) {
  const target = ['author', 'works', 'project'].includes(route) ? route : 'home';
  views.forEach((view) => {
    view.hidden = view.dataset.view !== target;
  });
  routeLinks.forEach((link) => link.classList.toggle('active', link.dataset.route === target));
  mobileMenu.classList.remove('open');
  document.body.classList.remove('menu-open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function buildProjectGallery(work) {
  const galleryItems = [
    { image: work.image, className: 'project-photo project-photo--hero' },
    { image: work.image, className: 'project-photo project-photo--tall' },
    { image: work.image, className: 'project-photo project-photo--split' },
    { image: work.image, className: 'project-photo project-photo--wide' },
  ];

  projectGallery.innerHTML = galleryItems.map((item) => `
    <figure class="${item.className}">
      <img src="${escapeHtml(item.image)}" alt="${escapeHtml(work.title)}" loading="lazy" />
    </figure>
  `).join('');
}

function openProject(id) {
  const work = state.filtered.find((item) => item.id === id) || state.works.find((item) => item.id === id);
  if (!work) return;

  const next = state.filtered.find((item) => item.id !== work.id) || state.works.find((item) => item.id !== work.id);

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

  projectNextTitle.textContent = next ? next.title : 'Back to archive';
  projectNextLocation.textContent = next ? `${next.location} / ${next.year}` : 'Archive';

  buildProjectGallery(work);
  showView('project');
}

projectBackLink.addEventListener('click', () => showView('works'));

routeLinks.forEach((link) => link.addEventListener('click', () => {
  if (link.dataset.route === 'works') showView('works');
  else showView(link.dataset.route);
}));

window.addEventListener('hashchange', () => {
  const route = location.hash.slice(1);
  if (route === 'project') {
    const activeId = document.querySelector('.work-card.active')?.dataset.id || state.filtered[0]?.id;
    if (activeId) openProject(activeId);
    return;
  }
  showView(route);
});

rowsRoot.querySelectorAll('.work-card').forEach((card) => {
  card.addEventListener('click', () => {
    card.classList.add('active');
    openProject(card.dataset.id);
  });
});

routeLinks.forEach((link) => {
  if (link.dataset.route === 'works') {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      showView('works');
    });
  }
});