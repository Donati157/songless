/* ===========================================================
   Atenis Games — Conta & progresso (LOCAL, pronto p/ nuvem)
   - Hoje: salva em localStorage (por navegador).
   - Amanhã: trocar load/save por Supabase mantendo a mesma API.
   =========================================================== */
(function () {
  const AK = "atenis_account", PK = "atenis_plays";
  const AVATARS = ["🙂","😎","🦊","🐼","🦁","🐸","🤴","👸","🧙","🐲","🤖","🦄","🐱","🐶","⚔️","🏎️","🃏","👑"];
  const TITLES = { car3d: "City Drive 3D", paciencia: "Paciência", reino: "The King's Decision" };
  const jget = (k, d) => { try { const v = JSON.parse(localStorage[k]); return v == null ? d : v; } catch (e) { return d; } };
  const jset = (k, v) => { try { localStorage[k] = JSON.stringify(v); } catch (e) {} };

  const Atenis = {
    profile: () => jget(AK, null),
    create(name, avatar) { const p = { name: (name || "").trim() || "Jogador", avatar: avatar || "🙂", created: Date.now() }; jset(AK, p); return p; },
    update(patch) { const p = Object.assign(Atenis.profile() || { name: "Jogador", avatar: "🙂", created: Date.now() }, patch); jset(AK, p); return p; },
    signOut() { localStorage.removeItem(AK); },
    recordPlay(id) { const m = jget(PK, {}); m[id] = (m[id] || 0) + 1; m._last = id; m._t = Date.now(); jset(PK, m); },
    plays: () => jget(PK, {}),
    summary() {
      const pl = Atenis.plays();
      const total = Object.keys(pl).filter(k => k[0] !== "_").reduce((a, k) => a + pl[k], 0);
      let fav = null, max = 0; for (const k in pl) { if (k[0] !== "_" && pl[k] > max) { max = pl[k]; fav = k; } }
      return {
        total, fav: fav ? (TITLES[fav] || fav) : "—",
        favs: jget("atenisFavs", []),
        reino: jget("kd_meta_v1", { endings: [], achv: [] }),
        paciencia: jget("paciencia_stats", { wins: 0, best: 0 }),
        car3d: jget("car3d_stats", { top: 0, dist: 0 }),
      };
    },
  };
  window.Atenis = Atenis;

  // ---------- UI ----------
  function injectStyle() {
    if (document.getElementById("acctCss")) return;
    const s = document.createElement("style"); s.id = "acctCss";
    s.textContent = `
    .acct-chip{display:flex;align-items:center;gap:9px;height:44px;padding:0 16px 0 8px;border-radius:24px;border:1px solid var(--border2,rgba(255,255,255,.12));background:rgba(255,255,255,.06);color:var(--text,#fff);font-weight:800;font-size:14px;cursor:pointer}
    .acct-chip:hover{border-color:var(--accent,#4F9DFF);box-shadow:0 0 18px rgba(79,157,255,.25)}
    .acct-chip .av{width:32px;height:32px;border-radius:50%;display:grid;place-items:center;font-size:18px;background:linear-gradient(135deg,#2ba6ff,#1486e8)}
    .acct-modal{position:fixed;inset:0;z-index:300;display:none;place-items:center;background:rgba(3,6,16,.7);backdrop-filter:blur(6px);padding:20px}
    .acct-modal.show{display:grid;animation:acctIn .2s ease}
    @keyframes acctIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
    .acct-card{width:100%;max-width:440px;background:#0b1220;border:1px solid #1f2942;border-radius:20px;padding:26px;box-shadow:0 24px 60px rgba(0,0,0,.6);color:#eef3fb}
    .acct-card h2{margin:0 0 4px;font-size:23px}
    .acct-card .sub{color:#8fa1c0;font-size:13px;margin-bottom:18px}
    .acct-card input{width:100%;height:46px;border-radius:12px;border:1px solid #2a3650;background:#0e1626;color:#fff;padding:0 14px;font-size:15px;outline:none;margin-bottom:14px}
    .acct-card input:focus{border-color:#4F9DFF}
    .av-grid{display:grid;grid-template-columns:repeat(9,1fr);gap:7px;margin-bottom:18px}
    .av-grid button{aspect-ratio:1;border-radius:10px;border:1px solid #2a3650;background:#0e1626;font-size:20px;cursor:pointer}
    .av-grid button.sel{border-color:#4F9DFF;background:rgba(79,157,255,.22);box-shadow:0 0 12px rgba(79,157,255,.4)}
    .acct-prof{display:flex;align-items:center;gap:14px;margin-bottom:18px}
    .acct-prof .big{width:64px;height:64px;border-radius:50%;display:grid;place-items:center;font-size:34px;background:linear-gradient(135deg,#2ba6ff,#1486e8)}
    .acct-prof b{font-size:20px}.acct-prof small{display:block;color:#8fa1c0}
    .stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:18px}
    .stat-tile{background:#0e1626;border:1px solid #1f2942;border-radius:12px;padding:12px 14px}
    .stat-tile .l{font-size:11px;letter-spacing:.5px;color:#8fa1c0;text-transform:uppercase;font-weight:700}
    .stat-tile .v{font-size:17px;font-weight:800;margin-top:3px}
    .acct-row{display:flex;gap:10px;flex-wrap:wrap}
    .acct-btn{flex:1;min-width:120px;border:none;border-radius:24px;padding:13px;font-weight:800;font-size:15px;cursor:pointer;color:#fff;background:linear-gradient(135deg,#4F9DFF,#2f6fd6)}
    .acct-btn.ghost{background:rgba(255,255,255,.07);border:1px solid #2a3650}
    .acct-btn:hover{filter:brightness(1.08)}
    .acct-cloud{margin-top:14px;text-align:center;color:#7b89a6;font-size:12px}`;
    document.head.appendChild(s);
  }

  function fmtTime(s) { if (!s) return "—"; return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); }

  function modal() {
    let m = document.getElementById("acctModal");
    if (!m) { m = document.createElement("div"); m.id = "acctModal"; m.className = "acct-modal"; document.body.appendChild(m);
      m.addEventListener("click", e => { if (e.target === m) close(); }); }
    return m;
  }
  function close() { const m = document.getElementById("acctModal"); if (m) m.classList.remove("show"); }

  function openCreate(editing) {
    const p = Atenis.profile();
    let chosen = (editing && p) ? p.avatar : "🙂";
    const m = modal();
    m.innerHTML = `<div class="acct-card">
      <h2>${editing ? "Editar perfil" : "Criar conta"}</h2>
      <div class="sub">Perfil local — fica salvo neste navegador. Login na nuvem chega depois.</div>
      <input id="acctName" maxlength="20" placeholder="Seu nome de jogador" value="${editing && p ? p.name.replace(/"/g, "") : ""}">
      <div class="av-grid" id="avGrid">${AVATARS.map(a => `<button data-a="${a}" class="${a === chosen ? "sel" : ""}">${a}</button>`).join("")}</div>
      <div class="acct-row">
        <button class="acct-btn" id="acctSave">${editing ? "Salvar" : "Criar conta"}</button>
        <button class="acct-btn ghost" id="acctCancel">Cancelar</button>
      </div>
      <div class="acct-cloud">🔒 Sua senha nunca passa por aqui — login na nuvem (Supabase) virá numa próxima atualização.</div>
    </div>`;
    m.classList.add("show");
    m.querySelectorAll("#avGrid button").forEach(b => b.onclick = () => { chosen = b.dataset.a; m.querySelectorAll("#avGrid button").forEach(x => x.classList.remove("sel")); b.classList.add("sel"); });
    document.getElementById("acctCancel").onclick = () => { if (Atenis.profile()) openProfile(); else close(); };
    document.getElementById("acctSave").onclick = () => {
      const name = document.getElementById("acctName").value;
      if (editing) Atenis.update({ name: name.trim() || "Jogador", avatar: chosen }); else Atenis.create(name, chosen);
      renderHeader(); openProfile();
    };
  }

  function openProfile() {
    const p = Atenis.profile(); if (!p) return openCreate(false);
    const s = Atenis.summary();
    const m = modal();
    m.innerHTML = `<div class="acct-card">
      <div class="acct-prof"><div class="big">${p.avatar}</div><div><b>${p.name}</b><small>Perfil local • desde ${new Date(p.created).toLocaleDateString("pt-BR")}</small></div></div>
      <div class="stat-grid">
        <div class="stat-tile"><div class="l">Partidas</div><div class="v">${s.total}</div></div>
        <div class="stat-tile"><div class="l">Jogo favorito</div><div class="v">${s.fav}</div></div>
        <div class="stat-tile"><div class="l">❤️ Favoritos</div><div class="v">${s.favs.length}</div></div>
        <div class="stat-tile"><div class="l">👑 The King's</div><div class="v">${s.reino.endings.length} finais · ${s.reino.achv.length} 🏆</div></div>
        <div class="stat-tile"><div class="l">🃏 Paciência</div><div class="v">${s.paciencia.wins} vitórias · ${fmtTime(s.paciencia.best)}</div></div>
        <div class="stat-tile"><div class="l">🏎️ City Drive</div><div class="v">${s.car3d.top} km/h · ${(s.car3d.dist / 1000).toFixed(1)} km</div></div>
      </div>
      <div class="acct-row">
        <button class="acct-btn" id="acctClose">Fechar</button>
        <button class="acct-btn ghost" id="acctEdit">Editar</button>
        <button class="acct-btn ghost" id="acctOut">Sair</button>
      </div>
      <div class="acct-cloud">☁️ Em breve: login real e save na nuvem (sincroniza entre celular e PC).</div>
    </div>`;
    m.classList.add("show");
    document.getElementById("acctClose").onclick = close;
    document.getElementById("acctEdit").onclick = () => openCreate(true);
    document.getElementById("acctOut").onclick = () => { Atenis.signOut(); renderHeader(); close(); };
  }

  function renderHeader() {
    const area = document.getElementById("acctArea"); if (!area) return;
    const p = Atenis.profile();
    if (p) { area.innerHTML = `<button class="acct-chip" id="acctChip"><span class="av">${p.avatar}</span><span>${p.name}</span></button>`;
      document.getElementById("acctChip").onclick = openProfile; }
    else { area.innerHTML = `<button class="btn ghost" id="acctLogin">Entrar</button><button class="btn" id="acctSignup">＋ <span>Criar conta</span></button>`;
      document.getElementById("acctLogin").onclick = () => openCreate(false);
      document.getElementById("acctSignup").onclick = () => openCreate(false); }
  }

  document.addEventListener("DOMContentLoaded", () => { injectStyle(); renderHeader(); });
})();
