 :root {
  --black: #0b0b0b;
  --white: #f5f5f2;
  --gray: #888883;
  --line: rgba(245, 245, 242, .22);
  --page: clamp(20px, 4vw, 64px);
  --soft: #d8d6d0;
  --panel: #eceae5;
  --muted: #6d6d68;
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  background: var(--black);
  color: var(--white);
  font-family: Arial, "Helvetica Neue", "Noto Sans JP", sans-serif;
  -webkit-font-smoothing: antialiased;
}
body.menu-open, body.modal-open { overflow: hidden; }
a { color: inherit; text-decoration: none; }
button { color: inherit; font: inherit; cursor: pointer; }

.site-header {
  position: fixed;
  inset: 0 0 auto;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 26px var(--page);
  mix-blend-mode: difference;
}
.logo { font-size: 12px; font-weight: 700; letter-spacing: .22em; }
.main-nav { display: flex; gap: 32px; font-size: 11px; letter-spacing: .12em; }
.main-nav a { opacity: .65; transition: opacity .25s; }
.main-nav a:hover, .main-nav a.active { opacity: 1; }
.menu-button { display: none; border: 0; background: transparent; font-size: 10px; letter-spacing: .15em; }
.mobile-menu { display: none; }

.page-view { min-height: 100vh; padding: 150px var(--page) 100px; }
.home-view { position: relative; display: flex; align-items: center; overflow: hidden; background: var(--black); }
.home-view::after { position: absolute; right: 5vw; bottom: -14vw; width: 52vw; height: 52vw; border: 1px solid rgba(245,245,242,.17); border-radius: 50%; content: ""; }
.home-content { position: relative; z-index: 1; }
.eyebrow { margin: 0 0 24px; color: var(--gray); font-size: 10px; letter-spacing: .2em; text-transform: uppercase; }
h1, h2 { margin: 0; font-family: Georgia, "Times New Roman", serif; font-weight: 400; letter-spacing: -.08em; }
h1 { font-size: clamp(86px, 18vw, 260px); line-height: .78; }
.home-subtitle { margin: 38px 0 0; color: #aaa9a4; font-size: 15px; letter-spacing: .04em; }
.home-actions { display: flex; gap: 10px; margin-top: 56px; }
.route-button { display: inline-flex; min-width: 142px; justify-content: center; padding: 14px 20px; border: 1px solid var(--white); font-size: 11px; letter-spacing: .12em; transition: background .25s ease, color .25s ease; }
.route-button-dark { background: var(--white); color: var(--black); }
.route-button-light:hover { background: var(--white); color: var(--black); }
.home-index { position: absolute; right: var(--page); bottom: 32px; color: var(--gray); font-size: 10px; letter-spacing: .16em; }

.author-view, .works-view, .project-view, .contact-view { background: var(--white); color: var(--black); }
.author-view { background: var(--white); color: var(--black); }
.author-shell {
  max-width: 1180px;
  margin: 0 auto;
  display: grid;
  gap: clamp(24px, 4vw, 54px);
}
.author-header {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 20px;
}
.author-mark {
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(52px, 8vw, 120px);
  line-height: .9;
  letter-spacing: -.08em;
}
.author-body {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(260px, 0.7fr);
  gap: clamp(28px, 5vw, 90px);
  align-items: start;
}
.author-story-column { display: grid; gap: 28px; }
.author-identity {
  display: flex;
  align-items: center;
  gap: 18px;
  color: #5c5c5a;
  font-size: 10px;
  letter-spacing: .18em;
  text-transform: uppercase;
}
.author-divider { color: #8a8a87; }
.author-plate {
  width: min(100%, 520px);
  min-height: 180px;
  border: 1px solid rgba(17,17,17,.18);
  background: linear-gradient(135deg, rgba(17,17,17,0.06), rgba(17,17,17,0.02));
  display: grid;
  place-items: center;
  text-transform: uppercase;
  letter-spacing: .18em;
  font-size: 10px;
  color: #6d6d68;
}
.author-lead {
  max-width: 700px;
  margin: 0;
  font-size: clamp(28px, 4vw, 52px);
  line-height: 1.2;
  letter-spacing: -.04em;
}
.author-info-panel {
  display: grid;
  gap: 24px;
  padding-left: clamp(18px, 2vw, 32px);
  border-left: 1px solid rgba(17,17,17,.18);
}
.author-statement {
  margin: 0;
  color: #4f4f4d;
  font-size: 15px;
  line-height: 1.9;
}
.author-details {
  margin: 0;
  border-top: 1px solid rgba(17,17,17,.18);
}
.author-details div {
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 18px;
  padding: 14px 0;
  border-bottom: 1px solid rgba(17,17,17,.18);
}
dt {
  color: #888;
  font-size: 11px;
  letter-spacing: .14em;
  text-transform: uppercase;
}
dd {
  margin: 0;
  color: #1b1b1a;
  font-size: 14px;
  line-height: 1.6;
}

.page-heading { max-width: 1100px; margin: 0 auto 70px; }
.page-heading .eyebrow { color: #777; }
h2 { font-size: clamp(58px, 11vw, 150px); line-height: .85; }

.works-view {
  background: #f4f1ee;
  color: var(--black);
  padding-left: 0;
  padding-right: 0;
  overflow: hidden;
}
.works-shell {
  max-width: 1440px;
  margin: 0 auto;
  padding-bottom: 40px;
}
.works-heading {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 32px;
  max-width: 1320px;
  margin-bottom: 32px;
}
.works-heading-copy { flex: 1; }
.heading-note {
  max-width: 320px;
  color: #666;
  font-size: 12px;
  line-height: 1.7;
  margin: 0;
  text-align: right;
}
.works-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1320px;
  margin: 0 auto 14px;
  padding: 0 var(--page) 18px;
  border-bottom: 1px solid rgba(17,17,17,.16);
}
.filters { display: flex; gap: 22px; flex-wrap: wrap; }
.filter-button, .pause-button {
  border: 0;
  border-bottom: 1px solid transparent;
  background: transparent;
  color: #7a7a77;
  font-size: 10px;
  letter-spacing: .12em;
  text-transform: uppercase;
  padding: 0 0 8px;
}
.filter-button.active, .filter-button:hover, .pause-button:hover {
  border-bottom-color: var(--black);
  color: var(--black);
}
.pause-button { color: #555; }
.carousel {
  overflow: hidden;
  padding: 20px 0 18px;
  cursor: grab;
  touch-action: pan-y;
}
.carousel.dragging { cursor: grabbing; }
.works-rows { display: grid; gap: 18px; }
.carousel-row {
  overflow: hidden;
  padding: 0 var(--page);
}
.carousel-row-track {
  display: flex;
  width: max-content;
  gap: 18px;
  will-change: transform;
}
.work-card {
  position: relative;
  flex: 0 0 clamp(150px, 14vw, 240px);
  min-width: 150px;
  height: clamp(180px, 18vw, 260px);
  overflow: hidden;
  background: #d7d3cf;
  cursor: pointer;
  border: 1px solid rgba(17,17,17,.08);
}
.work-card img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(100%) contrast(1.02);
  transition: transform .45s ease, filter .35s ease, opacity .35s ease;
}
.work-card:hover img { transform: scale(1.05); filter: grayscale(80%) contrast(1.08); }
.work-card-info {
  position: absolute;
  inset: auto 0 0;
  padding: 48px 14px 12px;
  background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.78) 62%);
  color: white;
  opacity: 0;
  transition: opacity .32s ease;
  pointer-events: none;
}
.work-card:hover .work-card-info { opacity: 1; }
.work-card-title {
  margin: 0 0 6px;
  font-family: Georgia, serif;
  font-size: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.work-card-description {
  max-width: 330px;
  margin: 0 0 9px;
  font-size: 10px;
  line-height: 1.5;
  color: #ddd;
}
.work-card-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  color: #bbb;
  font-size: 8px;
  letter-spacing: .08em;
  text-transform: uppercase;
}
.work-card--feature { flex-basis: min(32vw, 420px); height: clamp(260px, 28vw, 430px); }
.work-card--wide { flex-basis: min(26vw, 330px); height: clamp(220px, 20vw, 320px); }
.work-card--portrait { flex-basis: clamp(160px, 15vw, 210px); height: clamp(240px, 25vw, 360px); }
.work-card--compact { flex-basis: clamp(140px, 12vw, 180px); height: clamp(160px, 16vw, 220px); }
.carousel-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding-top: 10px;
}
.carousel-controls button {
  border: 0;
  background: transparent;
  color: var(--black);
  font-size: 24px;
}
#worksCounter {
  color: #777;
  font-size: 10px;
  letter-spacing: .12em;
  text-transform: uppercase;
}
.swipe-note {
  margin: 18px auto 0;
  color: #7a7a75;
  font-size: 10px;
  letter-spacing: .12em;
  text-transform: uppercase;
  text-align: center;
  max-width: 1320px;
  padding: 0 var(--page);
}

.project-view {
  background: var(--white);
  color: var(--black);
  min-height: 100vh;
  padding-top: 150px;
}
.project-shell {
  max-width: 1180px;
  margin: 0 auto;
}
.project-header {
  margin-bottom: clamp(28px, 4vw, 60px);
}
.project-heading-kicker {
  margin-bottom: 18px;
  color: var(--muted);
  font-size: 10px;
  letter-spacing: .18em;
  text-transform: uppercase;
}
.project-header-row {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 24px;
}
.project-heading {
  max-width: 760px;
  font-size: clamp(54px, 8vw, 120px);
  letter-spacing: -.06em;
}
.project-back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 10px;
  letter-spacing: .18em;
  text-transform: uppercase;
  color: #5a5a59;
  transition: transform .25s ease, opacity .25s ease;
  background: transparent;
  border: 0;
}
.project-back-link:hover { transform: translateX(-4px); }
.project-meta-summary {
  display: flex;
  gap: 28px;
  margin-top: 18px;
  color: #444;
  font-size: 11px;
  letter-spacing: .14em;
  text-transform: uppercase;
}
.project-intro {
  max-width: 620px;
  margin: 0 0 54px;
  color: #3f3f3d;
  font-size: clamp(18px, 2vw, 26px);
  line-height: 1.5;
  font-family: Georgia, "Times New Roman", serif;
}
.project-gallery {
  display: grid;
  grid-template-columns: 1.35fr 1fr 1fr;
  gap: 18px;
  margin-bottom: 80px;
}
.project-photo {
  position: relative;
  overflow: hidden;
  background: var(--soft);
  cursor: pointer;
  min-height: 220px;
  transition: transform .3s ease;
}
.project-photo:hover { transform: translateY(-2px); }
.project-photo img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(100%);
  transition: transform .5s ease, filter .4s ease, opacity .4s ease;
}
.project-photo:hover img { transform: scale(1.02); filter: grayscale(80%); }
.project-photo--hero { grid-column: 1 / span 2; min-height: 620px; }
.project-photo--wide { grid-column: 1 / span 2; min-height: 420px; }
.project-photo--tall { min-height: 520px; }
.project-photo--split { min-height: 360px; }

.project-info-block {
  margin: 90px 0 60px;
  padding-top: 18px;
  border-top: 1px solid #d4d1cc;
}
.project-info-title {
  margin-bottom: 22px;
  font-size: 10px;
  letter-spacing: .18em;
  text-transform: uppercase;
  color: var(--muted);
}
.project-info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 42px;
}
.project-info-row {
  display: grid;
  grid-template-columns: minmax(120px, 180px) 1fr;
  gap: 18px;
  padding: 14px 0;
  border-bottom: 1px solid #d2d0cc;
  font-size: 11px;
  letter-spacing: .12em;
  text-transform: uppercase;
}
.project-info-row span { color: var(--muted); }
.project-info-row strong {
  color: var(--black);
  letter-spacing: .08em;
  text-transform: none;
  font-size: 15px;
  font-weight: 400;
}

.project-next {
  margin-top: 90px;
  padding-top: 18px;
  border-top: 1px solid #d4d1cc;
}
.project-next-label {
  margin-bottom: 18px;
  color: var(--muted);
  font-size: 10px;
  letter-spacing: .18em;
  text-transform: uppercase;
}
.project-next-link {
  display: block;
  transition: transform .25s ease, opacity .25s ease;
}
.project-next-link:hover { transform: translateY(-2px); }
.project-next-title {
  display: block;
  font-size: clamp(28px, 4vw, 58px);
  font-family: Georgia, "Times New Roman", serif;
  letter-spacing: -.04em;
}
.project-next-location {
  display: block;
  margin-top: 8px;
  color: var(--muted);
  font-size: 10px;
  letter-spacing: .14em;
  text-transform: uppercase;
}
.project-next-arrow {
  display: inline-block;
  margin-top: 8px;
  font-size: 28px;
}

.contact-view {
  background: var(--white);
  color: var(--black);
}
.contact-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(200px, 0.7fr);
  gap: clamp(26px, 5vw, 90px);
  max-width: 1100px;
  margin: 0 auto;
}
.contact-copy {
  color: #4d4d4b;
  font-size: 18px;
  line-height: 1.7;
}
.contact-email {
  margin-top: 28px;
  font-size: clamp(28px, 4vw, 52px);
  font-family: Georgia, "Times New Roman", serif;
  letter-spacing: -.03em;
  color: var(--black);
}
.contact-info {
  border-left: 1px solid rgba(17,17,17,.18);
  padding-left: 24px;
}
.small-eyebrow {
  margin: 0 0 18px;
  color: var(--muted);
  font-size: 10px;
  letter-spacing: .18em;
  text-transform: uppercase;
}
.contact-info ul {
  margin: 0;
  padding-left: 18px;
  color: #4a4a49;
  line-height: 2;
}

.site-footer {
  display: flex;
  justify-content: space-between;
  padding: 24px var(--page);
  border-top: 1px solid var(--line);
  color: #888;
  font-size: 10px;
  letter-spacing: .13em;
  text-transform: uppercase;
  background: var(--black);
}

.photo-modal { position: fixed; inset: 0; z-index: 100; display: grid; place-items: center; padding: clamp(28px, 7vw, 96px); background: rgba(8, 8, 8, .94); opacity: 0; pointer-events: none; transition: opacity .25s ease; }
.photo-modal.open { opacity: 1; pointer-events: auto; }
.photo-modal-inner { position: relative; width: min(78vw, 1040px); max-height: 82vh; padding: 22px; background: #151515; }
.photo-modal-image { display: block; width: 100%; height: min(72vh, 720px); object-fit: contain; background: #090909; }
.photo-modal-close { position: absolute; top: -44px; right: 0; border: 0; background: transparent; color: white; font-size: 28px; line-height: 1; }
.photo-modal-caption { display: flex; justify-content: space-between; gap: 20px; padding-top: 12px; color: #aaa; font-size: 10px; letter-spacing: .1em; }
.photo-modal-description { margin-top: 8px; color: #c7c7c3; font-size: 12px; line-height: 1.6; }

[hidden] { display: none !important; }

@media (max-width: 700px) {
  .main-nav { display: none; }
  .menu-button { display: block; }
  .mobile-menu { position: fixed; inset: 0; z-index: 10; flex-direction: column; justify-content: center; gap: 24px; padding: var(--page); background: var(--black); }
  .mobile-menu.open { display: flex; }
  .mobile-menu a { font-family: Georgia, serif; font-size: 42px; }
  .home-actions { flex-direction: column; width: 190px; }
  .author-header { display: grid; gap: 18px; }
  .author-body { grid-template-columns: 1fr; }
  .author-info-panel { border-left: 0; border-top: 1px solid rgba(17,17,17,.18); padding-left: 0; padding-top: 16px; }
  .author-identity { flex-wrap: wrap; gap: 8px 18px; }
  .author-plate { min-height: 140px; }
  .works-heading { display: block; }
  .heading-note { margin-top: 28px; }
  .works-toolbar { align-items: flex-start; flex-direction: column; gap: 20px; }
  .carousel-row { padding: 0 18px; }
  .carousel-row-track { gap: 10px; }
  .work-card { flex-basis: calc((100vw - (2 * var(--page)) - (4 * 10px)) / 5); min-width: 72px; }
  .work-card img { height: 110px; }
  .work-card-info { opacity: 1; }
  .project-header-row { display: block; }
  .project-back-link { margin-top: 18px; }
  .project-gallery { grid-template-columns: 1fr; }
  .project-photo--hero, .project-photo--wide { grid-column: auto; min-height: 300px; }
  .project-photo--tall, .project-photo--split { min-height: 280px; }
  .project-info-grid { grid-template-columns: 1fr; }
  .contact-layout { grid-template-columns: 1fr; }
  .contact-info { border-left: none; border-top: 1px solid rgba(17,17,17,.18); padding-left: 0; padding-top: 16px; }
  .photo-modal { padding: 26px; }
  .photo-modal-inner { width: 92vw; padding: 12px; }
  .photo-modal-image { height: 66vh; }
  .site-footer { align-items: flex-start; flex-direction: column; gap: 10px; }
}
