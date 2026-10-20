function getWorkCardVariant(index) {
  const variants = ['feature', 'wide', 'portrait', 'compact', 'wide', 'portrait'];
  return variants[index % variants.length];
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
          ${repeated.map((work, cardIndex) => {
            const cardClass = `work-card work-card--${getWorkCardVariant(cardIndex)}`;
            return `
              <article class="${cardClass}" data-id="${escapeHtml(work.id)}">
                <img src="${escapeHtml(work.image)}" alt="${escapeHtml(work.title)}" loading="lazy" />
                <div class="work-card-info">
                  <h3 class="work-card-title">${escapeHtml(work.title)}</h3>
                  <p class="work-card-description">${escapeHtml(work.description)}</p>
                  <div class="work-card-meta"><span>${escapeHtml(work.location)}</span><span>${escapeHtml(work.year)}</span><span>${escapeHtml(work.categoryLabel)}</span></div>
                </div>
              </article>
            `;
          }).join("")}
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