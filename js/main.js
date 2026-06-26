/* ===================== Atenis Games — UI ===================== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const favs = () => JSON.parse(localStorage.atenisFavs || "[]");
const isFav = (id) => favs().includes(id);
function toggleFav(id) {
  const f = favs(); const i = f.indexOf(id);
  if (i < 0) { f.push(id); toast("❤️ Adicionado aos favoritos"); }
  else { f.splice(i, 1); toast("Removido dos favoritos"); }
  localStorage.atenisFavs = JSON.stringify(f);
  return i < 0;
}

/* ---------- stars ---------- */
function stars(r) {
  let s = "";
  for (let i = 1; i <= 5; i++) s += i <= Math.round(r) ? "★" : "☆";
  return `<span class="stars">${s}<span class="n">${r.toFixed(1)}</span></span>`;
}

/* ---------- procedural art (data URI SVG) ---------- */
function artURL(g, i = 0) {
  const a = g.accent, seeds = [
    `<circle cx='120' cy='70' r='90' fill='${a}' opacity='.5'/><circle cx='540' cy='250' r='130' fill='#fff' opacity='.06'/>`,
    `<rect x='-20' y='160' width='700' height='120' fill='${a}' opacity='.35' transform='rotate(-8 320 200)'/><circle cx='560' cy='60' r='70' fill='#fff' opacity='.08'/>`,
    `<polygon points='0,360 220,120 420,360' fill='${a}' opacity='.4'/><polygon points='300,360 520,180 680,360' fill='#fff' opacity='.07'/>`,
    `<circle cx='340' cy='200' r='150' fill='none' stroke='${a}' stroke-width='40' opacity='.4'/>`,
  ];
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='680' height='382'>
    <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0' stop-color='${shade(a, -40)}'/><stop offset='1' stop-color='${shade(a, -75)}'/></linearGradient></defs>
    <rect width='680' height='382' fill='url(#g)'/>${seeds[i % seeds.length]}
    <text x='50%' y='54%' font-size='150' text-anchor='middle' dominant-baseline='middle'>${g.icon}</text></svg>`;
  return "data:image/svg+xml," + encodeURIComponent(svg);
}
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) + amt, gg = ((n >> 8) & 255) + amt, b = (n & 255) + amt;
  const c = (x) => Math.max(0, Math.min(255, x));
  return "#" + ((1 << 24) + (c(r) << 16) + (c(gg) << 8) + c(b)).toString(16).slice(1);
}

/* ---------- toast ---------- */
let toastT;
function toast(msg) {
  let t = $("#toast"); if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add("show");
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2200);
}

/* ---------- card ---------- */
function cardHTML(g) {
  const badges = (g.flags || []).map(f =>
    f === "TOP" ? `<span class="badge top">🔥 TOP</span>` :
    f === "NEW" ? `<span class="badge new">NOVO</span>` : "").join("");
  return `
    <a class="card reveal" href="game.html?id=${g.id}">
      <div class="thumb">
        <img class="art" src="${artURL(g, 0)}" alt="${g.title}" loading="lazy">
        <div class="badges">${badges}</div>
        <span class="badge cat">${g.catName}</span>
        <span class="em">${g.icon}</span>
        <div class="play-over"><div class="pbtn">▶</div></div>
      </div>
      <div class="info">
        <div class="title">${g.title}</div>
        <div class="row">${stars(g.rating)}</div>
        <div class="row"><span class="chip">${g.catName}</span><span>▶ ${g.plays} jogadas</span></div>
      </div>
    </a>`;
}

/* ---------- sidebar ---------- */
function buildSidebar(active) {
  const item = (c, count) => `
    <a class="nav-item ${c.id === active ? "active" : ""}" href="${c.id === 'todos' ? 'index.html' : 'index.html?cat=' + c.id}">
      <span class="ic">${c.icon}</span><span>${c.name}</span>
      ${count != null ? `<span class="count">${count}</span>` : ""}
    </a>`;
  const cats = CATEGORIES.slice(1).map(c => item(c, catCount(c.id))).join("");
  return `
    ${item(CATEGORIES[0])}
    <a class="nav-item" href="index.html#favoritos"><span class="ic">❤️</span><span>Favoritos</span></a>
    <div class="nav-label">Categorias</div>
    ${cats}
    <div class="nav-sep"></div>
    <div class="side-cta">
      <h4>🎮 Atenis Games</h4>
      <p>Jogos grátis no navegador, sem instalar nada.</p>
    </div>`;
}

/* ---------- search suggestions ---------- */
function wireSearch() {
  const input = $("#search"); if (!input) return;
  let box = $("#suggest");
  if (!box) { box = document.createElement("div"); box.id = "suggest"; box.className = "suggest"; input.parentNode.appendChild(box); }
  const row = g => `<a href="game.html?id=${g.id}"><span class="em" style="background:${g.grad}">${g.icon}</span>
      <div><div style="font-weight:800">${g.title}</div></div><small>${g.catName}</small></a>`;
  function fill(q) {
    const hits = q ? GAMES.filter(g => (g.title + g.catName + g.tags.join()).toLowerCase().includes(q)) : GAMES;
    box.innerHTML = `<div class="lbl">${q ? "Resultados" : "🔥 Em alta"}</div>` +
      (hits.length ? hits.map(row).join("") : `<a><span class="em">🔍</span><div>Nada encontrado</div></a>`);
  }
  input.addEventListener("focus", () => { fill(input.value.trim().toLowerCase()); box.classList.add("show"); });
  input.addEventListener("input", () => fill(input.value.trim().toLowerCase()));
  document.addEventListener("click", e => { if (!input.parentNode.contains(e.target)) box.classList.remove("show"); });
}

/* ---------- mobile drawer + reveal ---------- */
function wireChrome() {
  $("#menuToggle")?.addEventListener("click", () => document.body.classList.toggle("menu-open"));
  $("#scrim")?.addEventListener("click", () => document.body.classList.remove("menu-open"));
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .08 });
  $$(".reveal").forEach(el => io.observe(el));
}

/* ===================== HOME ===================== */
let heroTimer;
function renderHome() {
  const params = new URLSearchParams(location.search);
  const cat = params.get("cat") || "todos";
  $("#sidebar").innerHTML = buildSidebar(cat);
  const content = $("#content");

  // skeleton flash
  content.innerHTML = `<div class="skel" style="height:340px;border-radius:26px;margin-bottom:40px"></div>
    <div class="grid">${"<div class='skel' style='height:240px'></div>".repeat(4)}</div>`;

  setTimeout(() => {
    if (cat !== "todos") {
      const list = GAMES.filter(g => g.cat === cat);
      content.innerHTML = `<h1 style="font-size:30px;margin-bottom:6px">${CATEGORIES.find(c=>c.id===cat).name}</h1>
        <p style="color:var(--muted);margin-bottom:26px">${list.length} jogo${list.length>1?'s':''}</p>
        <div class="grid">${list.map(cardHTML).join("")}</div>`;
    } else {
      content.innerHTML = heroHTML() +
        section("🔥", "Em alta agora", `<div class="grid">${GAMES.map(cardHTML).join("")}</div>`) +
        section("🗂️", "Explorar por categoria", catsHTML()) +
        favSection();
      wireHero();
    }
    wireSearch(); wireChrome();
  }, 420);
}

function heroHTML() {
  return `<div class="hero" id="hero">
    ${GAMES.map((g, i) => `<div class="bg" data-i="${i}" style="background:${g.grad};opacity:${i === 0 ? 1 : 0};position:absolute;inset:0;z-index:-2"></div>`).join("")}
    <div class="glowart" id="heroEm">${GAMES[0].icon}</div>
    <div class="herobody">
      <span class="pill">⭐ Jogo em destaque</span>
      <h1 id="heroTitle">${GAMES[0].title}</h1>
      <p class="tag" id="heroTag">${GAMES[0].short}</p>
      <div class="meta" id="heroMeta">${stars(GAMES[0].rating)} <span>▶ ${GAMES[0].plays} jogadas</span></div>
      <div class="cta">
        <a class="btn" id="heroPlay" href="game.html?id=${GAMES[0].id}">▶ Jogar agora</a>
        <a class="btn ghost" href="#alta">Ver todos</a>
      </div>
    </div>
    <div class="dots" id="heroDots">${GAMES.map((_, i) => `<i class="${i === 0 ? "on" : ""}" data-i="${i}"></i>`).join("")}</div>
  </div>`;
}
function wireHero() {
  const bgs = $$("#hero .bg"); let cur = 0;
  const go = i => {
    cur = i; const g = GAMES[i];
    bgs.forEach(b => b.style.opacity = +b.dataset.i === i ? 1 : 0);
    $("#heroEm").textContent = g.icon; $("#heroTitle").textContent = g.title;
    $("#heroTag").textContent = g.short;
    $("#heroMeta").innerHTML = `${stars(g.rating)} <span>▶ ${g.plays} jogadas</span>`;
    $("#heroPlay").href = `game.html?id=${g.id}`;
    $$("#heroDots i").forEach(d => d.classList.toggle("on", +d.dataset.i === i));
  };
  $$("#heroDots i").forEach(d => d.addEventListener("click", () => { go(+d.dataset.i); reset(); }));
  function reset() { clearInterval(heroTimer); heroTimer = setInterval(() => go((cur + 1) % GAMES.length), 6000); }
  if (GAMES.length > 1) reset();
}
function section(em, title, inner) {
  return `<section class="section reveal" id="alta"><div class="section-head">
    <h2><span class="em">${em}</span> ${title}</h2></div>${inner}</section>`;
}
function catsHTML() {
  return `<div class="cats">${CATEGORIES.slice(1).map(c => `
    <a class="cat-tile reveal" href="index.html?cat=${c.id}" style="background:${(GAMES.find(g=>g.cat===c.id)||{}).grad||'#111827'}">
      <span class="e">${c.icon}</span><small>${catCount(c.id)} jogo${catCount(c.id)>1?'s':''}</small><h3>${c.name}</h3>
    </a>`).join("")}</div>`;
}
function favSection() {
  const list = GAMES.filter(g => isFav(g.id));
  if (!list.length) return "";
  return `<a id="favoritos"></a>` + section("❤️", "Seus favoritos", `<div class="grid">${list.map(cardHTML).join("")}</div>`);
}

/* ===================== GAME PAGE ===================== */
function renderGame() {
  const g = byId(new URLSearchParams(location.search).get("id"));
  $("#sidebar").innerHTML = buildSidebar(g ? g.cat : "todos");
  const root = $("#gameRoot");
  if (!g) { root.innerHTML = `<div class="panel" style="text-align:center;padding:60px">😕<h3>Jogo não encontrado</h3></div>`; wireSearch(); wireChrome(); return; }
  document.title = `${g.title} — Atenis Games`;

  const related = GAMES.filter(x => x.id !== g.id);
  root.innerHTML = `
    <a class="back-link" href="index.html">← Voltar para a loja</a>

    <div class="player-hero" id="player">
      <div class="poster" id="poster">
        <div class="pbg" style="background:${g.grad}"></div>
        <div class="center">
          <div class="logo-em">${g.icon}</div>
          <h2>${g.title}</h2>
          <div class="playbig">▶</div>
          <div class="loadbar"><i></i></div>
          <small>Clique para iniciar o jogo</small>
        </div>
      </div>
      <div class="stage-spin" id="spin"><div class="spinner"></div></div>
    </div>

    <div class="ghead reveal">
      <div class="gicon" style="background:${g.grad}">${g.icon}</div>
      <div>
        <h1>${g.title}</h1>
        <div class="sub">${stars(g.rating)} <span>▶ ${g.plays} jogadas</span>
          <span class="chip">${g.catName}</span> <span>por ${g.dev}</span></div>
      </div>
      <div class="spacer"></div>
      <div class="gactions">
        <button class="icon-btn ${isFav(g.id) ? "on" : ""}" id="favBtn" title="Favoritar">❤️</button>
        <button class="icon-btn" id="shareBtn" title="Compartilhar">🔗</button>
        <button class="icon-btn" id="copyBtn" title="Copiar link">📋</button>
        <button class="icon-btn" id="fsBtn" title="Tela cheia">⛶</button>
        <button class="btn" id="playBtn">▶ Jogar agora</button>
      </div>
    </div>

    <div class="tags reveal">${g.tags.map(t => `<span class="t">#${t}</span>`).join("")}</div>

    <div class="panel about reveal"><h3>📖 Sobre ${g.title}</h3>${g.about.map(p => `<p>${p}</p>`).join("")}</div>

    <div class="panel reveal"><h3>🎮 Como jogar</h3>
      <div class="controls">${g.controls.map(c => `<div class="ctrl"><span class="key">${c.k}</span><span class="a">${c.a}</span></div>`).join("")}</div>
    </div>

    <section class="section reveal"><div class="section-head"><h2><span class="em">✨</span> Recursos</h2></div>
      <div class="features">${g.features.map(f => `<div class="feat"><div class="i">${f.i}</div><h4>${f.t}</h4><p>${f.d}</p></div>`).join("")}</div>
    </section>

    <section class="section reveal"><div class="section-head"><h2><span class="em">🖼️</span> Imagens</h2></div>
      <div class="shots" id="shots">${[0,1,2,3].map(i => `<div class="shot" data-i="${i}"><img src="${artURL(g, i)}" alt="${g.title} arte ${i+1}"><div class="zoom">🔍</div></div>`).join("")}</div>
    </section>

    ${related.length ? `<section class="section reveal"><div class="section-head"><h2><span class="em">🎲</span> Você também pode gostar</h2></div>
      <div class="grid">${related.map(cardHTML).join("")}</div></section>` : ""}

    <div class="lb" id="lb"><span class="x" id="lbX">✕</span>
      <span class="nav prev" id="lbPrev">‹</span><img id="lbImg" src=""><span class="nav next" id="lbNext">›</span></div>
  `;

  wireGame(g);
  wireSearch(); wireChrome();
}

function wireGame(g) {
  // launch (lazy iframe)
  const isMobile = matchMedia("(pointer:coarse)").matches || innerWidth < 820;
  const launch = () => {
    if (window.Atenis) Atenis.recordPlay(g.id);
    const player = $("#player"), spin = $("#spin");
    spin.classList.add("show");
    const url = g.embed || g.src;
    const ifr = document.createElement("iframe");
    ifr.src = url; ifr.allowFullscreen = true; ifr.title = g.title; ifr.loading = "eager";
    ifr.style.opacity = 0; ifr.style.transition = "opacity .5s ease";
    ifr.onload = () => { spin.classList.remove("show"); requestAnimationFrame(() => ifr.style.opacity = 1); };
    setTimeout(() => spin.classList.remove("show"), 6000); // fallback
    $("#poster").style.display = "none";
    player.appendChild(ifr);
    // No celular: abre o jogo em TELA CHEIA (ocupa a tela toda) com botão de sair
    if (isMobile) {
      player.classList.add("fs"); document.body.classList.add("playing");
      const x = document.createElement("button"); x.className = "fs-exit"; x.textContent = "✕";
      x.onclick = (e) => { e.stopPropagation(); player.classList.remove("fs"); document.body.classList.remove("playing"); x.remove(); };
      player.appendChild(x);
    }
  };
  $("#poster").addEventListener("click", launch);
  $("#playBtn").addEventListener("click", launch);

  $("#favBtn").addEventListener("click", e => e.currentTarget.classList.toggle("on", toggleFav(g.id)));
  $("#copyBtn").addEventListener("click", () => navigator.clipboard?.writeText(location.href).then(() => toast("📋 Link copiado!")));
  $("#shareBtn").addEventListener("click", () => {
    if (navigator.share) navigator.share({ title: g.title, url: location.href }).catch(() => {});
    else navigator.clipboard?.writeText(location.href).then(() => toast("🔗 Link copiado para compartilhar!"));
  });
  $("#fsBtn").addEventListener("click", () => $("#player").requestFullscreen?.());

  // lightbox
  const lb = $("#lb"), lbImg = $("#lbImg"); let idx = 0;
  const open = i => { idx = i; lbImg.src = artURL(g, i); lb.classList.add("show"); };
  $$("#shots .shot").forEach(s => s.addEventListener("click", () => open(+s.dataset.i)));
  $("#lbX").addEventListener("click", () => lb.classList.remove("show"));
  lb.addEventListener("click", e => { if (e.target === lb) lb.classList.remove("show"); });
  $("#lbPrev").addEventListener("click", e => { e.stopPropagation(); open((idx + 3) % 4); });
  $("#lbNext").addEventListener("click", e => { e.stopPropagation(); open((idx + 1) % 4); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") lb.classList.remove("show"); });
}

/* ---------- boot ---------- */
document.addEventListener("DOMContentLoaded", () => {
  if (document.body.dataset.page === "game") renderGame();
  else renderHome();
});
